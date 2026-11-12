<template>
  <div class="hrm-data-table">
    <div
      class="hrm-data-table__scroll"
      :class="!showPagination ? 'border-b border-[#E4E7ED]' : ''"
    >
      <div class="relative">
        <UCSkeletonOverlay v-if="loading && items.length" />

        <UCSkeletonTable
          v-if="loading && !items.length"
          :rows="skeletonRows"
          :columns="skeletonColumns"
          :column-variants="skeletonColumnVariants"
        >
          <template v-if="$slots.header" #header>
            <slot name="header" />
          </template>
          <slot v-if="$slots.skeleton" name="skeleton" />
        </UCSkeletonTable>

        <table
          v-else-if="items.length"
          class="hrm-table"
          :class="{ 'opacity-60': loading }"
        >
          <thead>
            <slot name="header" />
          </thead>
          <tbody>
            <slot name="body" :items="items" />
          </tbody>
        </table>

        <div
          v-else
          class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
        >
          <slot name="empty">
            <UIcon name="i-lucide-inbox" class="size-10 text-neutral-300" />
            <p class="font-medium text-neutral-700">ไม่พบข้อมูล</p>
          </slot>
        </div>
      </div>
    </div>

    <UCPagination
      v-if="showPagination && items.length"
      :pagination="pagination || PAGINATION_DEFAULT"
      :loading="loading"
      :page-sizes="pageSizes"
      @page-change="emit('pageChange', $event)"
      @page-size-change="emit('pageSizeChange', $event)"
    />
  </div>
</template>

<script setup lang="ts" generic="T">
import type { PaginationMeta } from "#shared/types/pagination";

withDefaults(
  defineProps<{
    items: T[];
    loading?: boolean;
    pagination?: PaginationMeta;
    showPagination?: boolean;
    skeletonRows?: number;
    skeletonColumns?: number;
    skeletonColumnVariants?: Array<
      "text" | "amount" | "badge" | "action" | "line"
    >;
    pageSizes?: number[];
  }>(),
  {
    loading: false,
    showPagination: true,
    skeletonRows: 10,
    skeletonColumns: 8,
    pageSizes: () => [5, 10, 20, 30, 50],
  },
);

const PAGINATION_DEFAULT = ref<PaginationMeta>({
  from: 0,
  per_page: 0,
  total: 0,
  total_pages: 0,
  current_page: 0,
  total_all: 0,
});

const emit = defineEmits<{
  pageChange: [from: number];
  pageSizeChange: [size: number];
}>();
</script>
