<template>
  <div class="skeleton-page skeleton-page--form min-h-[280px]">
    <div class="flex items-center gap-2">
      <div class="h-5 w-1 rounded bg-[#0066DA]" />
      <UCSkeleton variant="title" width="160px" height="20px" />
    </div>

    <div class="mt-4">
      <UCSkeletonForm :rows="rows" :columns="columns" />
    </div>

    <div class="mt-4 space-y-2">
      <UCSkeleton variant="text" width="25%" height="12px" />
      <UCSkeleton variant="block" height="88px" rounded="lg" />
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <UCSkeleton variant="button" width="96px" />
      <UCSkeleton variant="button" width="120px" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number;
    columns?: 1 | 2 | 3 | 4;
  }>(),
  {
    rows: 2,
    columns: 2,
  },
);
</script>
