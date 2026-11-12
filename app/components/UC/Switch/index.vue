<template>
  <USwitch
    color="info"
    size="xl"
    v-bind="$attrs"
    :model-value="modelValue"
    :ui="mergedUi"
    @update:model-value="modelValue = $event"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  ui?: Record<string, unknown>;
}>();

const modelValue = defineModel<boolean>();

const mergedUi = computed(() => ({
  ...props.ui,
  base: ["w-12", props.ui?.base].filter(Boolean).join(" "),
  thumb: [
    "data-[state=checked]:translate-x-6 data-[state=checked]:rtl:-translate-x-6",
    props.ui?.thumb,
  ]
    .filter(Boolean)
    .join(" "),
}));
</script>
