<template>
  <div class="skeleton-page skeleton-page--list">
    <div class="flex items-center justify-between gap-3">
      <UCSkeleton variant="title" width="180px" height="20px" />
      <UCSkeleton variant="button" width="120px" height="36px" />
    </div>

    <div class="mt-4 flex flex-wrap gap-3">
      <UCSkeleton
        v-for="n in filters"
        :key="`filter-${n}`"
        width="180px"
        height="40px"
        rounded="lg"
        :delay="n * 40"
      />
      <UCSkeleton width="72px" height="40px" rounded="lg" :delay="160" />
    </div>

    <div class="mt-4 min-h-[200px]">
      <UCSkeletonTable
        :rows="rows"
        :columns="columns"
        :column-variants="columnVariants"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type ColumnVariant = "text" | "amount" | "badge" | "action" | "line";

withDefaults(
  defineProps<{
    rows?: number;
    columns?: number;
    filters?: number;
    columnVariants?: ColumnVariant[];
  }>(),
  {
    rows: 3,
    columns: 7,
    filters: 3,
    columnVariants: () => [
      "line",
      "text",
      "text",
      "text",
      "text",
      "badge",
      "action",
    ],
  },
);
</script>
