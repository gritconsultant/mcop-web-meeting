<template>
  <div class="skeleton-page skeleton-page--detail min-h-[260px]">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="h-5 w-1 rounded bg-[#0066DA]" />
        <UCSkeleton variant="title" width="200px" height="20px" />
      </div>
      <div class="flex gap-2">
        <UCSkeleton variant="button" width="88px" height="32px" />
        <UCSkeleton variant="button" width="88px" height="32px" />
      </div>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="rounded-xl border border-neutral-200 bg-white p-4">
        <UCSkeletonDetail :fields="fields" :columns="1" />
      </div>
      <div class="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
        <UCSkeleton variant="text" width="40%" height="14px" />
        <UCSkeleton variant="block" height="120px" rounded="lg" />
        <UCSkeleton variant="text" width="70%" height="12px" />
        <UCSkeleton variant="text" width="50%" height="12px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    fields?: number;
  }>(),
  {
    fields: 5,
  },
);
</script>
