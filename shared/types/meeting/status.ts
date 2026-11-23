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

export type MeetingListStatus = MeetingStatus;

export const MEETING_LIST_STATUS_LABEL = MEETING_STATUS_LABEL;
