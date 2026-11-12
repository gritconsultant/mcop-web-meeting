<template>
  <div :class="[openShadow ? 'shadow-md' : 'shadow-none', attrs.class]">
    <slot name="navbar" />

    <div class="overflow-hidden rounded-lg border border-color bg-white">
      <div
        v-if="showHeader"
        class="flex items-center justify-between gap-2 bg-[#f5f5f5] px-4 py-2"
      >
        <div class="flex min-w-0 items-center gap-2">
          <p v-if="title" class="truncate text-base font-bold">
            {{ title }}
            <span v-if="required" class="text-red-500">*</span>
          </p>

          <slot name="title-detail" />
          <slot name="title-action" />
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <slot name="header" />
          <slot name="right-action" />

          <button
            v-if="accordion && !disabled"
            type="button"
            class="flex items-center justify-center"
            aria-label="เปิด/ปิดการ์ด"
            @click="onToggle"
          >
            <UIcon
              name="i-lucide-chevron-down"
              class="size-5 text-neutral-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              :class="isOpen ? 'rotate-180' : 'rotate-0'"
            />
          </button>
        </div>
      </div>

      <div class="relative">
        <div
          v-if="accordion"
          ref="contentRef"
          class="overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[max-height]"
          :style="contentStyle"
        >
          <div class="border-t border-color" :class="bodyClass">
            <UCCardSkeleton
              v-if="loading"
              :fields="skeletonFields"
              :columns="skeletonColumns"
            />
            <template v-else>
              <slot name="content">
                <slot />
              </slot>
            </template>
          </div>
        </div>

        <div v-else class="border-t border-color" :class="bodyClass">
          <UCCardSkeleton
            v-if="loading"
            :fields="skeletonFields"
            :columns="skeletonColumns"
          />
          <template v-else>
            <slot name="content">
              <slot />
            </slot>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const ANIM_MS = 500;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    accordion?: boolean;
    title?: string;
    loading?: boolean;
    disabled?: boolean;
    required?: boolean;
    defaultOpen?: boolean;
    padded?: boolean;
    openShadow?: boolean;
    skeletonFields?: number;
    skeletonColumns?: 1 | 2 | 3;
  }>(),
  {
    accordion: false,
    loading: false,
    disabled: false,
    required: false,
    defaultOpen: true,
    padded: true,
    openShadow: false,
    skeletonFields: 6,
    skeletonColumns: 3,
  },
);

const attrs = useAttrs();
const openModel = defineModel<boolean>("open");

const slots = useSlots();
const contentRef = ref<HTMLElement | null>(null);
let animTimer: ReturnType<typeof setTimeout> | null = null;

const isOpen = computed({
  get: () => openModel.value ?? props.defaultOpen,
  set: (value: boolean) => {
    openModel.value = value;
  },
});

const contentStyle = ref<{ maxHeight: string }>({
  maxHeight: (openModel.value ?? props.defaultOpen) ? "none" : "0px",
});

const bodyClass = computed(() => (props.padded ? "p-4" : undefined));

const showHeader = computed(
  () =>
    !!props.title ||
    !!slots["title-detail"] ||
    !!slots["title-action"] ||
    !!slots.header ||
    !!slots["right-action"] ||
    props.accordion,
);

const clearAnimTimer = () => {
  if (animTimer) {
    clearTimeout(animTimer);
    animTimer = null;
  }
};

const animateOpen = async () => {
  await nextTick();
  const el = contentRef.value;
  if (!el) {
    contentStyle.value.maxHeight = "none";
    return;
  }

  contentStyle.value.maxHeight = `${el.scrollHeight}px`;
  clearAnimTimer();
  animTimer = setTimeout(() => {
    contentStyle.value.maxHeight = "none";
    animTimer = null;
  }, ANIM_MS);
};

const animateClose = async () => {
  await nextTick();
  const el = contentRef.value;
  if (!el) {
    contentStyle.value.maxHeight = "0px";
    return;
  }

  contentStyle.value.maxHeight = `${el.scrollHeight}px`;
  void el.offsetHeight;
  contentStyle.value.maxHeight = "0px";

  clearAnimTimer();
  animTimer = setTimeout(() => {
    animTimer = null;
  }, ANIM_MS);
};

const onToggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

watch(isOpen, (open) => {
  if (!props.accordion) return;
  if (open) animateOpen();
  else animateClose();
});

onMounted(() => {
  if (props.accordion && isOpen.value) {
    contentStyle.value.maxHeight = "none";
  }
});

onBeforeUnmount(() => {
  clearAnimTimer();
});
</script>
