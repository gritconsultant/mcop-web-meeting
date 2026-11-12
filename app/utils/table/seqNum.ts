import type { PaginationMeta } from '#shared/types/pagination'

export const seqNum = (paginate: PaginationMeta, index: number) =>
  (paginate.current_page - 1) * paginate.per_page + (index + 1)
