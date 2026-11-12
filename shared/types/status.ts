export type StatusTone = "pending" | "rejected" | "approved" | "info";

export const STATUS_LABEL: Record<StatusTone, string> = {
  pending: "รอดำเนินการ",
  rejected: "ไม่อนุมัติ",
  approved: "อนุมัติสำเร็จ",
  info: "ข้อมูล",
};
