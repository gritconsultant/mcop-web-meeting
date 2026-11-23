import type { MeetingCommitteeRef, MeetingSetRef } from "./committee";
import type { MeetingStatus } from "./status";

export interface MeetingListApiRow {
  id: string;
  meeting_committee_id: string;
  meeting_set_id: string;
  meeting_no: number | null;
  start_at: string;
  end_at: string | null;
  location: string;
  status: MeetingStatus;
  status_name: string;
  member_count: number;
  topic_count: number;
  approved_topic_count: number;
  created_at: string;
  updated_at: string;
  meeting_committee: MeetingCommitteeRef | null;
  meeting_set: MeetingSetRef | null;
}

export interface MeetingListItem {
  id: string;
  meetingNo: string;
  meetingDate: string;
  committee: string;
  location: string;
  attendees: number;
  status: MeetingStatus;
  statusName: string;
}

export interface MeetingListFilters {
  meetingNo: string;
  meetingDate: string | undefined;
  location: string;
}

export interface MeetingListQuery {
  from: number;
  size: number;
  sort_by?: string;
  order_by?: string;
  meeting_no?: number;
  meeting_date?: string;
  location?: string;
  statuses?: string;
  search?: string;
  meeting_committee_id?: string;
  meeting_set_id?: string;
}
