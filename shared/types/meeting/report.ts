import type { Query } from "../query";

export interface ReportListItem {
  id: string;
  meeting_no: number;
  start_at: string;
  end_at: string;
  location: string;
  status: string;
  status_name: string;
  member_count: number;
  topic_count: number;
  approved_topic_count: number;
  meeting_committee: { id: string; name: string; name_abb: string } | null;
  meeting_set: { id: string; set_number: number; year: string } | null;
}

export interface MeetingFile {
  id: string;
  file_type?: string;
  ref_id?: string;
  file_id: string;
  url: string;
  file_names: string;
  file_types: string;
  size: number;
  convert_size: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingTopic {
  id: string;
  meeting_agenda_id: string;
  topic_no: number;
  title: string;
  detail: string | null;
  resolution_note: string | null;
  resolution_type: string | null;
  resolution_type_name: string | null;
  resolution_target: string | null;
  is_effective: boolean | null;
  resolution_status: string | null;
  resolution_status_name: string | null;
  files: MeetingFile[];
}

export interface MeetingAgenda {
  id: string;
  meeting_id: string;
  agenda_no: number;
  agenda_type: string;
  agenda_type_name: string;
  agenda_title: string | null;
  topics: MeetingTopic[];
}

export interface MeetingGuest {
  id: string;
  meeting_id: string;
  full_name: string;
  detail: string | null;
}

export interface MeetingInvitation {
  id: string;
  meeting_id: string;
  is_email: boolean;
  is_sms: boolean;
  is_line: boolean;
  is_remind_7_days: boolean;
  is_remind_2_days: boolean;
  meeting_url: string | null;
  email_subject: string;
  email_body: string;
  sms_message: string;
  line_message: string;
  files: MeetingFile[];
}

export interface MeetingDetail {
  id: string;
  meeting_committee_id: string;
  meeting_set_id: string;
  meeting_no: number;
  start_at: string;
  end_at: string | null;
  location: string;
  status: string;
  status_name: string;
  created_at: string;
  updated_at: string;
  meeting_committee: { id: string; name: string; name_abb: string } | null;
  meeting_set: { id: string; set_number: number; year: string } | null;
  guests: MeetingGuest[];
  invitation: MeetingInvitation | null;
  agendas: MeetingAgenda[];
}

export interface QueryMeetings extends Query {
  meeting_no?: string;
  meeting_date?: string;
  location?: string;
  statuses?: string;
}

export interface MeetingMember {
  id: string | null;
  meeting_id: string;
  employee_id: string;
  position_id: string | null;
  is_invited: boolean;
  attendance_status: string | null;
  attendance_status_name: string | null;
  employee: {
    id: string;
    prefix_name_th: string | null;
    first_name_th: string;
    last_name_th: string;
  } | null;
  position: { id: string; name: string } | null;
}
