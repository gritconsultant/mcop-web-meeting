import * as v from "valibot";
import { requiredPassword } from "./helpers";

export const LoginSchema = v.object({
  username: v.pipe(
    v.string("กรุณากรอกข้อมูล"),
    v.trim(),
    v.nonEmpty("กรุณากรอกชื่อผู้ใช้"),
    // v.check(
    //   (val) => /^\d{13}$/.test(val) || /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(val),
    //   "กรุณากรอกเลขประจำตัวประชาชน 13 หลัก หรือ ชื่อผู้ใช้ที่ถูกต้อง",
    // ),
  ),
  password: requiredPassword(),
  recaptcha_token: v.pipe(
    v.string("กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์"),
    v.nonEmpty("กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์"),
  ),
});
