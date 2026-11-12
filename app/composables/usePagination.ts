import type { PaginateSlice, PaginationMeta } from '#shared/types/pagination'
import type { Query } from '#shared/types/query'

export const usePagination = (defaultSize = 10) => {
  const pagination = ref<PaginationMeta>({
    from: 0,
    per_page: defaultSize,
    total: 0,
    total_pages: 1,
    current_page: 1,
    total_all: 0,
  })

  const setPagination = (slice: PaginateSlice, search?: string) => {
    const perPage = slice.size || pagination.value.per_page || defaultSize
    pagination.value = {
      from: slice.from,
      per_page: perPage,
      total: slice.total,
      total_pages: Math.max(1, Math.ceil(slice.total / perPage)),
      current_page: Math.floor(slice.from / perPage) + 1,
      total_all: !search ? slice.total : pagination.value.total_all,
    }
  }

  const applyPage = (query: Query, from: number) => {
    query.from = from
    pagination.value.from = from
  }

  const applyPageSize = (query: Query, size: number) => {
    query.from = 0
    query.size = size
    pagination.value.per_page = size
    pagination.value.from = 0
  }

  const resetPagination = () => {
    pagination.value = {
      from: 0,
      per_page: defaultSize,
      total: 0,
      total_pages: 1,
      current_page: 1,
      total_all: 0,
    }
  }

  return {
    pagination,
    setPagination,
    applyPage,
    applyPageSize,
    resetPagination,
  }
}
