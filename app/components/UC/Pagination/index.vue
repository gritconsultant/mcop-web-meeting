<template>
  <div class="hrm-pagination">
    <div class="hrm-pagination__info">
      <span class="hrm-pagination__text">
        แสดง {{ startItem }} ถึง {{ endItem }} จาก {{ pagination.total }} แถว
      </span>
      <div class="hrm-pagination__size">
        <select
          class="hrm-pagination__select"
          :value="pagination.per_page"
          :disabled="loading"
          @change="onPageSizeChange"
        >
          <option
            v-for="size in pageSizes"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <ul
      v-if="pagination.total > 0"
      class="hrm-pagination__pages"
    >
      <li>
        <button
          type="button"
          class="hrm-pagination__nav"
          :disabled="loading || pagination.current_page <= 1"
          aria-label="หน้าก่อนหน้า"
          @click="goToPage(pagination.current_page - 1)"
        >
          <UIcon
            name="i-lucide-chevron-left"
            class="size-4"
          />
        </button>
      </li>

      <li
        v-for="(item, index) in pageItems"
        :key="`page-${index}-${item}`"
      >
        <button
          v-if="item !== '...'"
          type="button"
          class="hrm-pagination__page"
          :class="{ 'is-active': item === pagination.current_page }"
          :disabled="loading || item === pagination.current_page"
          @click="goToPage(item)"
        >
          {{ item }}
        </button>
        <span
          v-else
          class="hrm-pagination__dots"
        >…</span>
      </li>

      <li>
        <button
          type="button"
          class="hrm-pagination__nav"
          :disabled="loading || pagination.current_page >= pagination.total_pages"
          aria-label="หน้าถัดไป"
          @click="goToPage(pagination.current_page + 1)"
        >
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4"
          />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PaginationMeta } from '#shared/types/pagination'

const props = defineProps<{
  pagination: PaginationMeta
  loading?: boolean
  pageSizes?: number[]
}>()

const emit = defineEmits<{
  pageChange: [from: number]
  pageSizeChange: [size: number]
}>()

const pageSizes = computed(() => props.pageSizes ?? [5, 10, 20, 30, 50])

const startItem = computed(() =>
  props.pagination.total === 0 ? 0 : props.pagination.from + 1,
)

const endItem = computed(() =>
  Math.min(
    props.pagination.from + props.pagination.per_page,
    props.pagination.total,
  ),
)

const pageItems = computed(() => {
  const total = props.pagination.total_pages
  const current = props.pagination.current_page
  const items: Array<number | '...'> = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i)
    return items
  }

  items.push(1)

  if (current <= 3) {
    items.push(2, 3, '...', total)
    return items
  }

  if (current >= total - 2) {
    items.push('...', total - 2, total - 1, total)
    return items
  }

  items.push('...', current - 1, current, current + 1, '...', total)
  return items
})

const goToPage = (page: number) => {
  if (page < 1 || page > props.pagination.total_pages) return
  emit('pageChange', (page - 1) * props.pagination.per_page)
}

const onPageSizeChange = (event: Event) => {
  const size = Number((event.target as HTMLSelectElement).value)
  if (!Number.isFinite(size) || size === props.pagination.per_page) return
  emit('pageSizeChange', size)
}
</script>
