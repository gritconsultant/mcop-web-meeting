<template>
  <div class="skeleton-table">
    <div class="skeleton-table__head" :style="gridStyle">
      <div
        v-for="col in columns"
        :key="`skeleton-head-${col}`"
        class="skeleton-table__cell"
        :class="cellAlign(col)"
      >
        <UCSkeleton
          width="70%"
          height="12px"
          rounded="sm"
          :delay="col * 30"
        />
      </div>
    </div>

    <div
      v-for="row in rows"
      :key="`skeleton-row-${row}`"
      class="skeleton-table__row"
      :style="gridStyle"
    >
      <div
        v-for="col in columns"
        :key="`skeleton-col-${row}-${col}`"
        class="skeleton-table__cell"
        :class="cellAlign(col)"
      >
        <UCSkeleton
          v-if="
            variantForColumn(col) === 'badge' ||
            variantForColumn(col) === 'action'
          "
          width="56px"
          :height="SKELETON_HEIGHT"
          rounded="sm"
          :delay="row * 50 + col * 35"
        />
        <UCSkeleton
          v-else-if="variantForColumn(col) === 'line'"
          width="32px"
          :height="SKELETON_HEIGHT"
          rounded="sm"
          :delay="row * 50 + col * 35"
        />
        <UCSkeleton
          v-else
          class="max-w-full"
          width="100%"
          :height="SKELETON_HEIGHT"
          rounded="sm"
          :delay="row * 50 + col * 35"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ColumnVariant = "text" | "amount" | "badge" | "action" | "line";

const SKELETON_HEIGHT = "14px";

const DEFAULT_VARIANTS_8: ColumnVariant[] = [
  "text",
  "text",
  "text",
  "text",
  "text",
  "amount",
  "badge",
  "action",
];

const props = withDefaults(
  defineProps<{
    rows?: number;
    columns?: number;
    columnVariants?: ColumnVariant[];
  }>(),
  {
    rows: 3,
    columns: 8,
  },
);

const resolvedVariants = computed(() => {
  if (props.columnVariants?.length) return props.columnVariants;
  if (props.columns === 8) return DEFAULT_VARIANTS_8;
  return Array.from({ length: props.columns }, () => "text" as ColumnVariant);
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
}));

const variantForColumn = (col: number) =>
  resolvedVariants.value[col - 1] ?? "text";

const cellAlign = (col: number) => {
  const variant = variantForColumn(col);
  if (variant === "action" || variant === "badge" || variant === "line")
    return "is-center";
  if (variant === "amount") return "is-end";
  return "is-start";
};
</script>
