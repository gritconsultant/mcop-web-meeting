import * as v from 'valibot'

/** บังคับกรอก — trim + nonEmpty */
export const required = (message: string) =>
  v.pipe(v.string(), v.trim(), v.nonEmpty(message))

/** บังคับกรอก + ความยาวขั้นต่ำ */
export const requiredMin = (min: number, emptyMessage: string, minMessage?: string) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(emptyMessage),
    v.minLength(min, minMessage ?? emptyMessage),
  )

/** บังคับกรอก + ความยาวสูงสุด */
export const requiredMax = (max: number, emptyMessage: string, maxMessage: string) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(emptyMessage),
    v.maxLength(max, maxMessage),
  )

/** บังคับกรอก + min/max */
export const requiredRange = (
  min: number,
  max: number,
  emptyMessage: string,
  minMessage: string,
  maxMessage: string,
) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(emptyMessage),
    v.minLength(min, minMessage),
    v.maxLength(max, maxMessage),
  )

/** ไม่บังคับ — ถ้ากรอกต้องมีอย่างน้อย min ตัว */
export const optionalMin = (min: number, message: string) =>
  v.optional(v.pipe(v.string(), v.trim(), v.minLength(min, message)))

/** ไม่บังคับ — สูงสุด max ตัว */
export const optionalMax = (max: number, message: string) =>
  v.optional(v.pipe(v.string(), v.maxLength(max, message)))

/** ไม่บังคับ — ถ้ากรอกต้องไม่ว่าง */
export const optionalNonEmpty = () =>
  v.optional(v.pipe(v.string(), v.nonEmpty()))

/** dropdown / select ที่ต้องเลือก (เก็บเป็น string id) */
export const requiredSelect = (message: string) =>
  v.pipe(v.string(message), v.nonEmpty(message))

/** dropdown / select ที่ต้องเลือก (เก็บเป็น object { id, name }) */
export const requiredSelectObject = (message: string) =>
  v.pipe(
    v.object({
      id: v.string(),
      name: v.string(),
    }),
    v.check((val) => !!val.id, message),
  )

/** วันที่รูปแบบ ISO */
export const requiredDate = (
  emptyMessage: string,
  formatMessage = 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD',
) =>
  v.pipe(v.string(emptyMessage), v.nonEmpty(emptyMessage), v.isoDate(formatMessage))

/** อีเมล */
export const requiredEmail = (
  emptyMessage = 'กรุณากรอกอีเมล',
  invalidMessage = 'รูปแบบอีเมลไม่ถูกต้อง',
) =>
  v.pipe(v.string(), v.nonEmpty(emptyMessage), v.email(invalidMessage))

/** เบอร์โทร (ไม่บังคับ) */
export const optionalPhone = (
  min = 9,
  max = 15,
  minMessage = 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก',
  maxMessage = 'เบอร์โทรต้องไม่เกิน 15 หลัก',
) =>
  v.optional(v.pipe(v.string(), v.minLength(min, minMessage), v.maxLength(max, maxMessage)))

/** รหัสผ่าน */
export const requiredPassword = (
  min = 6,
  emptyMessage = 'กรุณากรอกรหัสผ่าน',
  minMessage?: string,
) =>
  v.pipe(
    v.string(emptyMessage),
    v.nonEmpty(emptyMessage),
    v.minLength(min, minMessage ?? `รหัสผ่านอย่างน้อย ${min} ตัวอักษร`),
  )

/** id จาก API */
export const requiredId = (message = 'กรุณากรอก ID') =>
  v.pipe(v.string(message), v.nonEmpty(message))

/** timestamp จาก API */
export const timestamps = () => ({
  createdAt: v.string(),
  updatedAt: v.string(),
})

/** ตัวเลขช่วง min–max */
export const numberRange = (min: number, max: number, minMessage: string, maxMessage: string) =>
  v.pipe(v.number(), v.minValue(min, minMessage), v.maxValue(max, maxMessage))

/** แปลงจำนวนเงิน string (รองรับ comma) */
export const parseDecimalAmount = (value: string) => parseFloat(value.replace(/,/g, ''))

/** จำนวนเงิน string ต้อง > 0 */
export const requiredPositiveAmount = (
  emptyMessage: string,
  invalidMessage = 'จำนวนเงินต้องเป็นตัวเลข',
  minMessage = 'จำนวนเงินต้องมากกว่า 0',
) =>
  v.pipe(
    v.string(),
    v.nonEmpty(emptyMessage),
    v.check((val) => !Number.isNaN(parseDecimalAmount(val)), invalidMessage),
    v.check((val) => parseDecimalAmount(val) > 0, minMessage),
  )
