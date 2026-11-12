import { client } from "../httpClient";

export const getCommittees = (params?: Record<string, unknown>) => {
  return client({
    url: "/meeting/meeting-committees",
    method: "GET",
    params,
  });
};

export const getCommitteeSets = (params?: Record<string, unknown>) => {
  return client({
    url: "/meeting/meeting-committee-sets",
    method: "GET",
    params,
  });
};

export const getMeetings = (params?: Record<string, unknown>) => {
  return client({
    url: "/meeting/meetings",
    method: "GET",
    params,
  });
};
