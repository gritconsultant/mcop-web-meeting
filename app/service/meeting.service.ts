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

export const getMeetingMembers = (id: string) => {
  return client({
    url: `/meeting/meetings/${id}/members`,
    method: "GET",
  });
};

export const getCommittees = (params?: Record<string, unknown>) => {
  return client({
    url: "/hrm/meeting-committees",
    method: "GET",
    params: {
      ...params,
    },
  });
};

export const getCommitteeSets = (params?: Record<string, unknown>) => {
  return client({
    url: "/hrm/meeting-sets",
    method: "GET",
    params: {
      ...params,
    },
  });
};
