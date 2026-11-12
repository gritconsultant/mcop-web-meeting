export interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

export interface PaginatedData<T> {
  from: number
  size: number
  total: number
  items: T[]
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>
