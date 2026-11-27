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
      <span class="truncate text-sm text-[#1A1E24]">
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
        <div class="flex min-w-0 items-center gap-2 text-inherit">
          <span
            v-if="item.tag"
            class="inline-flex h-6 shrink-0 items-center rounded px-2 text-xs font-semibold text-white"
            :class="item.tagClass ?? defaultTagClass"
          >
            {{ item.tag }}
          </span>
          <span class="truncate text-inherit">{{ item.label }}</span>
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
import type { UCSelectItem } from "#shared/types/select";

export type { UCSelectItem };

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

type LockedOverflow = { el: HTMLElement; overflow: string };
const lockedElements: LockedOverflow[] = [];
let lockedBody: {
  scrollY: number;
  paddingRight: string;
  position: string;
  top: string;
  width: string;
} | null = null;

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

const isScrollable = (el: HTMLElement) => {
  const style = window.getComputedStyle(el);
  const canScroll =
    style.overflowY === "auto" ||
    style.overflowY === "scroll" ||
    style.overflowX === "auto" ||
    style.overflowX === "scroll";
  return (
    canScroll &&
    (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
  );
};

const getDropdownViewport = () => menuRef.value?.viewportRef ?? null;

const onLockScroll = () => {
  const viewport = getDropdownViewport();
  document.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (!isScrollable(el)) return;
    if (viewport && (el === viewport || el.contains(viewport))) return;
    lockedElements.push({ el, overflow: el.style.overflow });
    el.style.overflow = "hidden";
  });

  const scrollY = window.scrollY;
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  lockedBody = {
    scrollY,
    paddingRight: document.body.style.paddingRight,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  };
  if (scrollbarWidth > 0) {
    const currentPaddingRight = parseFloat(
      window.getComputedStyle(document.body).paddingRight || "0",
    );
    document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  }
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
};

const onUnlockScroll = () => {
  lockedElements.forEach(({ el, overflow }) => {
    el.style.overflow = overflow;
  });
  lockedElements.length = 0;

  if (!lockedBody) return;
  document.body.style.position = lockedBody.position;
  document.body.style.top = lockedBody.top;
  document.body.style.width = lockedBody.width;
  document.body.style.paddingRight = lockedBody.paddingRight;
  window.scrollTo(0, lockedBody.scrollY);
  lockedBody = null;
};

const onWheelOutside = (e: WheelEvent) => {
  const viewport = getDropdownViewport();
  const target = e.target as Node | null;
  if (viewport && target && viewport.contains(target)) {
    const atTop = viewport.scrollTop <= 0 && e.deltaY < 0;
    const atBottom =
      viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1 &&
      e.deltaY > 0;
    if (atTop || atBottom) e.preventDefault();
    return;
  }
  e.preventDefault();
};

const onTouchMoveOutside = (e: TouchEvent) => {
  const viewport = getDropdownViewport();
  const target = e.target as Node | null;
  if (viewport && target && viewport.contains(target)) return;
  e.preventDefault();
};

const bindOutsideScrollBlock = () => {
  document.addEventListener("wheel", onWheelOutside, { passive: false });
  document.addEventListener("touchmove", onTouchMoveOutside, {
    passive: false,
  });
};

const unbindOutsideScrollBlock = () => {
  document.removeEventListener("wheel", onWheelOutside);
  document.removeEventListener("touchmove", onTouchMoveOutside);
};

const bindViewport = async () => {
  await nextTick();
  const el = getDropdownViewport();
  if (!el) return;
  if (props.meta?.isInfiniteScroll && el !== boundViewport) {
    unbindViewport();
    el.addEventListener("scroll", onScrollOptions, { passive: true });
    boundViewport = el;
  }
};

const fillIfNotScrollable = async () => {
  if (!canLoadMore()) return;
  await nextTick();
  const el = boundViewport ?? getDropdownViewport();
  if (el && el.scrollHeight <= el.clientHeight) {
    requestLoadMore();
  }
};

watch(
  isOpen,
  async (open) => {
    if (open) {
      await nextTick();
      await bindViewport();
      onLockScroll();
      bindOutsideScrollBlock();
      fillIfNotScrollable();
    } else {
      unbindOutsideScrollBlock();
      onUnlockScroll();
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
    if (!isOpen.value) return;
    await bindViewport();
    fillIfNotScrollable();
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  unbindOutsideScrollBlock();
  onUnlockScroll();
  unbindViewport();
});

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
  viewport: [
    "max-h-60 overflow-y-auto overscroll-contain p-0",
    props.ui?.viewport,
  ]
    .filter(Boolean)
    .join(" "),
  item: [
    "w-full rounded-none px-3 py-2.5 text-sm !text-[#1A1E24] outline-none select-none",
    "before:hidden",
    "data-[highlighted]:!bg-[#F9F9F9] data-[highlighted]:!text-[#1A1E24]",
    "data-[state=checked]:!bg-[#edecec] data-[state=checked]:!text-[#1A1E24]",
    "data-[state=checked][data-highlighted]:!bg-[#E8E8E8] data-[state=checked][data-highlighted]:!text-[#1A1E24]",
    props.ui?.item,
  ]
    .filter(Boolean)
    .join(" "),
  itemLabel: ["truncate !text-inherit", props.ui?.itemLabel]
    .filter(Boolean)
    .join(" "),
  itemTrailing: ["hidden", props.ui?.itemTrailing].filter(Boolean).join(" "),
}));
</script>
