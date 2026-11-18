<template>
  <div class="hrm-data-table">
    <div
      class="hrm-data-table__scroll"
      :class="!showPagination ? 'border-b border-[#E4E7ED]' : ''"
    >
      <div class="relative">
        <UCSkeletonOverlay v-if="loading && items.length" />

        <!-- โหลดครั้งแรก: หัวตารางจริง + skeleton เฉพาะแถว -->
        <table
          v-if="loading && !items.length"
          class="hrm-table"
        >
          <thead>
            <slot name="header" />
          </thead>
          <tbody>
            <tr
              v-for="row in skeletonRows"
              :key="`skeleton-row-${row}`"
            >
              <td
                v-for="col in skeletonColumns"
                :key="`skeleton-col-${row}-${col}`"
                :class="skeletonCellClass(col)"
              >
                <UCSkeleton
                  :width="skeletonWidth(col)"
                  :height="skeletonHeight(col)"
                  rounded="sm"
                  :delay="row * 45 + col * 30"
                />
              </td>
            </tr>
          </tbody>
        </table>

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

type ColumnVariant = "text" | "amount" | "badge" | "action" | "line";

const props = withDefaults(
  defineProps<{
    items: T[];
    loading?: boolean;
    pagination?: PaginationMeta;
    showPagination?: boolean;
    /** จำนวนแถว skeleton — ใช้ค่าน้อย (3) เพื่อไม่ดูยาวเกินตอนข้อมูลจริงน้อย */
    skeletonRows?: number;
    skeletonColumns?: number;
    skeletonColumnVariants?: ColumnVariant[];
    pageSizes?: number[];
  }>(),
  {
    loading: false,
    showPagination: true,
    skeletonRows: 3,
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

const DEFAULT_VARIANTS_8: ColumnVariant[] = [
  "line",
  "text",
  "text",
  "text",
  "text",
  "amount",
  "badge",
  "action",
];

const resolvedVariants = computed(() => {
  if (props.skeletonColumnVariants?.length) return props.skeletonColumnVariants;
  if (props.skeletonColumns === 8) return DEFAULT_VARIANTS_8;
  return Array.from(
    { length: props.skeletonColumns },
    () => "text" as ColumnVariant,
  );
});

const variantForColumn = (col: number) =>
  resolvedVariants.value[col - 1] ?? "text";

const skeletonCellClass = (col: number) => {
  const variant = variantForColumn(col);
  if (variant === "action" || variant === "badge" || variant === "line") {
    return "is-center";
  }
  if (variant === "amount") return "is-center";
  return "is-left";
};

const skeletonWidth = (col: number) => {
  const variant = variantForColumn(col);
  if (variant === "action" || variant === "badge") return "56px";
  if (variant === "line") return "24px";
  if (variant === "amount") return "64px";
  return "72%";
};

const skeletonHeight = (col: number) => {
  const variant = variantForColumn(col);
  if (variant === "badge" || variant === "action") return "28px";
  return "14px";
};
</script>
