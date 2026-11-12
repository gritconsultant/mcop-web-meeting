import { client } from "../httpClient";

export const storageObject = (payload: {
  filename: string;
  visibility: "private" | "public";
}) => {
  return client({
    url: "/storage/object",
    method: "POST",
    data: payload,
  });
};
