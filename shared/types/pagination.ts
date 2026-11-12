export interface PaginationMeta {
  from: number
  per_page: number
  total: number
  total_pages: number
  current_page: number
  total_all: number
}

export interface PaginateSlice {
  from: number
  size: number
  total: number
}
