<template>
  <div
    class="block min-w-0 truncate"
    :class="[alignClass, ui]"
    :style="maxWidth ? { maxWidth } : undefined"
    :title="tooltipText"
  >
    <slot>{{ text }}</slot>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string | number | null;
    align?: "left" | "center" | "right";
    maxWidth?: string;
    ui?: string;
  }>(),
  {
    text: "",
    align: "left",
  },
);

const tooltipText = computed(() => {
  const value = props.text;
  if (value === null || value === undefined || value === "") return undefined;
  return String(value);
});

const alignClass = computed(() => {
  if (props.align === "center") return "text-center";
  if (props.align === "right") return "text-right";
  return "text-left";
});
</script>
