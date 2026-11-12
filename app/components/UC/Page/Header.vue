<template>
  <div class="space-y-4">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div
        class="flex items-center gap-2"
        :class="[isBorder ? 'border-l-4 border-[#0066DA] pl-2' : '', titleClass]"
      >
        <div>
          <h1 class="text-lg font-bold text-neutral-900">
            {{ title }}
            <span v-if="required" class="text-[#f95454]">*</span>
          </h1>
        </div>
      </div>

      <div v-if="$slots.actions" class="flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
// default props
const props = withDefaults(
  defineProps<{
    title: string;
    titleClass?: string;
    description?: string;
    isBorder?: boolean;
    required?: boolean;
  }>(),
  {
    isBorder: true,
    required: false,
  },
);
</script>
