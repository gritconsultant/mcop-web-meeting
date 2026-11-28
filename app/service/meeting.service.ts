import { client } from "./httpClient";

export const getMeetings = (params?: Record<string, unknown>) => {
  return client({
    url: "/meeting/meetings",
    method: "GET",
    params: {
      ...params,
    },
  });
};

export const getMeeting = (id: string) => {
  return client({
    url: `/meeting/meetings/${id}`,
    method: "GET",
  });
};

export const createMeeting = (payload: Record<string, unknown>) => {
  return client({
    url: "/meeting/meetings",
    method: "POST",
    data: payload,
  });
};

export const updateMeeting = (id: string, payload: Record<string, unknown>) => {
  return client({
    url: `/meeting/meetings/${id}`,
    method: "PATCH",
    data: payload,
  });
};

export const startMeeting = (id: string) => {
  return client({
    url: `/meeting/meetings/${id}/start`,
    method: "POST",
  });
};

export const endMeeting = (id: string) => {
  return client({
    url: `/meeting/meetings/${id}/end`,
    method: "POST",
  });
};

export const getMeetingMembers = (id: string) => {
  return client({
    url: `/meeting/meetings/${id}/members`,
    method: "GET",
  });
};

export const getCommittees = (params?: Record<string, unknown>) => {
  return client({
    url: "/meeting/meeting-committees",
    method: "GET",
    params: {
      ...params,
    },
  });
};

export const getCommitteeMembers = (params?: Record<string, unknown>) => {
  return client({
    url: "/hrm/meeting-committee-members",
    method: "GET",
    params: {
      ...params,
    },
  });
};

export const getCommitteeSets = (params?: Record<string, unknown>) => {
  return client({
    url: "/meeting/meeting-committee-sets",
    method: "GET",
    params: {
      ...params,
    },
  });
};

export const getMeetingGuests = (id: string) => {
  return client({
    url: `/meeting/meetings/${id}/guests`,
    method: "GET",
  });
};
