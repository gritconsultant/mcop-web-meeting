<template>
  <div
    class="grid grid-cols-1 gap-x-8 gap-y-3 text-sm"
    :class="gridClass"
  >
    <div
      v-for="field in fields"
      :key="`card-skel-field-${field}`"
      class="flex flex-wrap items-center gap-x-1.5"
    >
      <UCSkeleton
        variant="text"
        :width="labelWidth(field)"
        height="14px"
        :delay="field * 50"
      />
      <UCSkeleton
        variant="text"
        :width="valueWidth(field)"
        height="14px"
        :delay="field * 50 + 25"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    fields?: number;
    columns?: 1 | 2 | 3;
  }>(),
  {
    fields: 6,
    columns: 3,
  },
);

const gridClass = computed(() => {
  if (props.columns === 3) return "sm:grid-cols-3";
  if (props.columns === 2) return "sm:grid-cols-2";
  return "";
});

const labelWidth = (field: number) => {
  const widths = ["72px", "64px", "88px", "56px", "96px", "80px"];
  return widths[(field - 1) % widths.length]!;
};

const valueWidth = (field: number) => {
  const widths = ["96px", "120px", "140px", "80px", "110px", "72px"];
  return widths[(field - 1) % widths.length]!;
};
</script>
