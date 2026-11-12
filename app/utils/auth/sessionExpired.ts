import { showAlertConfirm } from '~/utils/alert'

// หลายจุดเจอ session หมดอายุพร้อมกันให้รอ modal อันเดียวกัน ไม่ขึ้นซ้อน
let alerting: Promise<void> | null = null

export const alertSessionExpired = (): Promise<void> => {
  if (import.meta.server) return Promise.resolve()
  if (!alerting) {
    alerting = showAlertConfirm({
      type: 'error',
      title: 'เซสชันหมดอายุ',
      text: 'กรุณาเข้าสู่ระบบอีกครั้ง',
      showCancelButton: false,
      allowEscapeKey: false,
      confirmButtonText: 'ตกลง',
    }).then(() => {
      alerting = null
    })
  }
  return alerting
}
