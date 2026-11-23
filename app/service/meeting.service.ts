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

export const createMeeting = (data: Record<string, unknown>) => {
  return client({
    url: "/meeting/meetings",
    method: "POST",
    data,
  });
};

export const updateMeeting = (id: string, data: Record<string, unknown>) => {
  return client({
    url: `/meeting/meetings/${id}`,
    method: "PATCH",
    data,
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
