/** สถานะการประชุม — `meeting_status` จาก api-spec */
export type MeetingStatus =
  | "draft"
  | "waiting"
  | "meeting"
  | "ended"
  | "completed";

export const MEETING_STATUS_LABEL: Record<MeetingStatus, string> = {
  draft: "ฉบับร่าง",
  waiting: "รอประชุม",
  meeting: "กำลังประชุม",
  ended: "จบการประชุม",
  completed: "เสร็จสิ้น",
};

/** @deprecated ใช้ MeetingStatus */
export type MeetingListStatus = MeetingStatus;

/** @deprecated ใช้ MEETING_STATUS_LABEL */
export const MEETING_LIST_STATUS_LABEL = MEETING_STATUS_LABEL;
