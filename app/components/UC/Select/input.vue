<template>
  <div class="relative w-full">
    <div
      v-if="!isOpen && selectedItem"
      class="pointer-events-none absolute inset-0 z-10 flex items-center gap-2 px-3"
    >
      <span
        v-if="selectedItem.tag"
        class="inline-flex h-6 shrink-0 items-center rounded px-2 text-xs font-semibold text-white"
        :class="selectedItem.tagClass ?? defaultTagClass"
      >
        {{ selectedItem.tag }}
      </span>
      <span class="truncate text-sm text-[#222]">
        {{ selectedItem.label }}
      </span>
    </div>

    <UInputMenu
      ref="menuRef"
      v-model="modelValue"
      :key="inputKey"
      v-model:open="isOpen"
      v-model:search-term="searchTerm"
      color="neutral"
      size="lg"
      class="w-full"
      v-bind="$attrs"
      :items="items"
      :loading="loading"
      value-key="value"
      label-key="label"
      :filter-fields="['label', 'tag']"
      :placeholder="isOpen || !selectedItem ? placeholder : ''"
      :open-on-click="true"
      :highlight-on-hover="true"
      :display-value="() => ''"
      trailing
      :content="{ side: 'bottom', sideOffset: 4, align: 'start' }"
      :ui="mergedUi"
      @update:open="onOpenChange"
    >
      <template #item-label="{ item }">
        <div class="flex min-w-0 items-center gap-2">
          <span
            v-if="item.tag"
            class="inline-flex h-6 shrink-0 items-center rounded px-2 text-xs font-semibold text-white"
            :class="item.tagClass ?? defaultTagClass"
          >
            {{ item.tag }}
          </span>
          <span class="truncate">{{ item.label }}</span>
        </div>
      </template>

      <!-- infinite scroll: กำลังโหลดหน้าถัดไป -->
      <template v-if="meta?.isInfiniteScroll" #content-bottom>
        <div
          v-if="loadingMore && !loading"
          class="flex items-center justify-center gap-1 px-3 py-2"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-4 animate-spin text-neutral-500"
          />
          <span class="text-sm text-neutral-400">กำลังโหลดเพิ่ม...</span>
        </div>
      </template>

      <template #trailing="{ open }">
        <UIcon
          :name="open ? 'i-lucide-chevron-up' : icon"
          class="size-4 shrink-0 text-neutral-500"
        />
      </template>
    </UInputMenu>
  </div>
</template>

<script setup lang="ts">
import { appInputUi } from "~/utils/ui/input";

export type UCSelectItem = {
  label: string;
  value: string;
  tag?: string;
  tagClass?: string;
};

interface InputMeta {
  // เปิดโหลดรายการเพิ่มเมื่อเลื่อนถึงท้าย (ไม่ส่ง = ปิด ทำงานแบบเดิม)
  isInfiniteScroll?: boolean;
}

const inputKey = ref(0);
const props = withDefaults(
  defineProps<{
    items?: UCSelectItem[];
    placeholder?: string;
    icon?: string;
    ui?: Record<string, unknown>;
    meta?: InputMeta;
    // ใช้คู่กับ meta.isInfiniteScroll: ยังมีหน้าถัดไปให้โหลดไหม
    hasMore?: boolean;
    // ใช้คู่กับ meta.isInfiniteScroll: กำลังโหลดหน้าถัดไปอยู่ไหม
    loadingMore?: boolean;
    loading?: boolean;
  }>(),
  {
    placeholder: "ค้นหา",
    icon: "i-lucide-chevron-down",
    items: () => [],
    meta: () => ({}),
    hasMore: false,
    loadingMore: false,
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "load-more"): void;
}>();

const modelValue = defineModel<string>();
const isOpen = ref(false);
const searchTerm = ref("");
const defaultTagClass = "bg-[#7F1113]";

const selectedItem = computed(() =>
  props.items.find((item) => item.value === modelValue.value),
);
const onOpenChange = async (open: boolean) => {
  isOpen.value = open;

  if (open) {
    searchTerm.value = "";
    inputKey.value++; // 🔥 force re-render
  }
};

// ---------- infinite scroll ----------
const LOAD_MORE_THRESHOLD = 48; // px จากท้ายรายการ
const menuRef = ref<{ viewportRef?: HTMLElement | null } | null>(null);
let boundViewport: HTMLElement | null = null;

const canLoadMore = () =>
  !!props.meta?.isInfiniteScroll &&
  props.hasMore &&
  !props.loading &&
  !props.loadingMore &&
  isOpen.value;

const requestLoadMore = () => {
  if (!canLoadMore()) return;
  emit("load-more");
};

const onScrollOptions = (e: Event) => {
  const el = e.target as HTMLElement;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - LOAD_MORE_THRESHOLD) {
    requestLoadMore();
  }
};

const unbindViewport = () => {
  boundViewport?.removeEventListener("scroll", onScrollOptions);
  boundViewport = null;
};

// viewport อยู่ใน portal จะมีก็ต่อเมื่อเปิดอยู่ → ผูก scroll ตอนเปิด ถอดตอนปิด
const bindViewport = async () => {
  if (!props.meta?.isInfiniteScroll || !isOpen.value) return;
  await nextTick();
  const el = menuRef.value?.viewportRef ?? null;
  if (!el || el === boundViewport) return;
  unbindViewport();
  el.addEventListener("scroll", onScrollOptions, { passive: true });
  boundViewport = el;
};

// รายการยังสั้นจนไม่มี scrollbar → โหลดต่อเองจนเลื่อนได้หรือหมด
const fillIfNotScrollable = async () => {
  if (!canLoadMore()) return;
  await nextTick();
  const el = boundViewport;
  if (el && el.scrollHeight <= el.clientHeight) {
    requestLoadMore();
  }
};

watch(
  isOpen,
  async (open) => {
    if (open) {
      await bindViewport();
      fillIfNotScrollable();
    } else {
      unbindViewport();
    }
  },
  { flush: "post" },
);

watch(
  () => [
    props.items.length,
    props.loadingMore,
    props.loading,
    props.hasMore,
    searchTerm.value,
  ],
  async () => {
    await bindViewport();
    fillIfNotScrollable();
  },
  { flush: "post" },
);

onBeforeUnmount(unbindViewport);

const mergedUi = computed(() => ({
  ...props.ui,
  base: [appInputUi.base, "w-full cursor-text", props.ui?.base]
    .filter(Boolean)
    .join(" "),
  content: [
    "z-[60] w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded-lg border border-neutral-200 bg-white p-0 shadow-sm",
    props.ui?.content,
  ]
    .filter(Boolean)
    .join(" "),
  group: ["p-0", props.ui?.group].filter(Boolean).join(" "),
  viewport: ["max-h-60 overflow-y-auto p-0", props.ui?.viewport]
    .filter(Boolean)
    .join(" "),
  item: [
    "w-full rounded-none px-3 py-2.5 text-sm text-[#222] outline-none select-none",
    "before:hidden",
    "data-[highlighted]:bg-neutral-200 data-[highlighted]:text-[#222]",
    "data-[state=checked]:bg-neutral-500 data-[state=checked]:text-white",
    "data-[state=checked][data-highlighted]:bg-neutral-500 data-[state=checked][data-highlighted]:text-white",
    props.ui?.item,
  ]
    .filter(Boolean)
    .join(" "),
  itemLabel: ["truncate", props.ui?.itemLabel].filter(Boolean).join(" "),
  itemTrailing: ["hidden", props.ui?.itemTrailing].filter(Boolean).join(" "),
}));
</script>
