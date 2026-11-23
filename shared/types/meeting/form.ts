import type { CurrentlyFile } from "../file";

export interface MeetingFormStep {
  key: string;
  label: string;
  lines?: string[];
}

export interface MeetingInfoForm {
  meetingSetId: string;
  meetingCommitteeId: string;
  meetingDate: string | undefined;
  startTime: string | undefined;
  location: string;
}

export interface MeetingPerson {
  key: string;
  id?: string;
  name: string;
  detail: string;
}

export interface MeetingInviteForm {
  remind7Days: boolean;
  remind2Days: boolean;
  isEmail: boolean;
  isSms: boolean;
  isLine: boolean;
  meetingUrl: string;
  emailSubject: string;
  emailBody: string;
  smsMessage: string;
  lineMessage: string;
  files: CurrentlyFile[];
}

export interface MeetingInviteRecipient {
  key: string;
  id: string;
  name: string;
  position: string;
  channels: string;
  selected: boolean;
}

export interface MeetingAgendaTopicDraft {
  key: string;
  id?: string;
  title: string;
  detail: string;
  files: CurrentlyFile[];
}

export interface MeetingAgendaDraft {
  key: string;
  id?: string;
  label: string;
  agendaType: string;
  topics: MeetingAgendaTopicDraft[];
}

export interface MeetingFormReviewInfo {
  setLabel: string;
  committeeLabel: string;
  meetingNoLabel: string;
  meetingDate: string;
  startTime: string;
  location: string;
}

export interface MeetingFormReviewInvite {
  remind7Days: boolean;
  remind2Days: boolean;
  isEmail: boolean;
  isSms: boolean;
  isLine: boolean;
  meetingUrl: string;
  selectedCount: number;
  totalCount: number;
}
