export interface Committee {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommitteeSet {
  id: string;
  set_number: number;
  year?: string | null;
  meeting_committee_id?: string;
  created_at: string | null;
  updated_at: string | null;
  meeting_committee?: MeetingCommitteeRef | null;
}

export interface MeetingCommitteeRef {
  id: string;
  name: string;
}

export interface MeetingSetRef {
  id: string;
  set_number: number;
  year: string;
}
