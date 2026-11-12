export interface Committee {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommitteeSet {
  id: string;
  meeting_committee_id: string;
  set_number: number;
  meeting_committee: Pick<Committee, 'id' | 'name'>;
  created_at: string;
  updated_at: string;
}

export interface MeetingRelation {
  id: string;
  meeting_no: number;
  meeting_date: string;
  meeting_committee_set: Pick<CommitteeSet, 'id' | 'set_number' | 'meeting_committee'>;
}

export interface Meeting extends MeetingRelation {
  meeting_committee_set_id: string;
  description: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
}
