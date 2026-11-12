import * as v from 'valibot'
import { numberRange } from './helpers'

export const querySchema = v.object({
  from: v.pipe(v.number(), v.minValue(0, 'หน้าต้องไม่ติดลบ')),
  size: numberRange(1, 100, 'จำนวนต่อหน้าต้องอย่างน้อย 1', 'จำนวนต่อหน้าต้องไม่เกิน 100'),
  search: v.optional(v.string()),
  order_by: v.optional(v.string()),
  sort_by: v.optional(v.string()),
})

export type QueryInput = v.InferInput<typeof querySchema>
export type QueryOutput = v.InferOutput<typeof querySchema>
