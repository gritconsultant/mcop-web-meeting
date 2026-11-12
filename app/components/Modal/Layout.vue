<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        data-hrm-modal
        class="fixed inset-0 z-50 bg-black/50"
        @click="onBackdropClick"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="open"
        data-hrm-modal
        class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          :id="`modal-content-${modalId}`"
          role="dialog"
          aria-modal="true"
          class="pointer-events-auto flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl px-2"
          :class="panelClass"
        >
          <div
            v-if="$slots.title || title"
            class="border-b border-neutral-100 px-5 py-4"
          >
            <slot name="title">
              <h2 class="min-w-0 border-l-4 border-[#0066DA] pl-2 text-[20px] leading-7 font-bold text-black">
                {{ title }}
              </h2>
              <p v-if="description" class="mt-1 text-sm text-neutral-500">
                {{ description }}
              </p>
            </slot>
          </div>

          <div
            class="min-h-0 flex-1 overflow-y-auto"
            :id="`modal-content-scroll-${modalId}`"
            :class="contentPadding ? 'px-5 py-4' : ''"
          >
            <slot v-if="loading" name="loading">
              <UCSkeletonDetail />
            </slot>
            <slot v-else :modal-id="modalId" />
          </div>

          <div v-if="$slots.footer" class="flex justify-end gap-2 px-5 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    description?: string;
    loading?: boolean;
    dismissible?: boolean;
    closeOnBackdrop?: boolean;
    panelClass?: string;
    contentPadding?: boolean;
    isBorder?: boolean;
    formId?: string;
  }>(),
  {
    dismissible: true,
    closeOnBackdrop: true,
    panelClass: "max-w-2xl",
    contentPadding: true,
    isBorder: true,
  },
);

const emit = defineEmits<{ close: [] }>();
const modalId = getCurrentInstance()?.uid;

provide("modalContentId", `modal-content-${modalId}`);
watch(
  () => props.open,
  (value) => {
    if (import.meta.server) return;
    document.body.classList.toggle("overflow-hidden", value);
  },
);

onUnmounted(() => {
  if (import.meta.server) return;
  document.body.classList.remove("overflow-hidden");
});

const onBackdropClick = () => {
  if (props.closeOnBackdrop && !props.loading) {
    emit("close");
  }
};
</script>
