import type { LoginInput } from "#shared/types";
import { client } from "./httpClient";

export type RequestLogin = LoginInput;

export const login = (payload: RequestLogin) => {
  return client({
    url: "/member/auth/manage/login",
    method: "POST",
    data: payload,
  });
};

export const getProfile = () => {
  return client({
    url: "/hrm/me/employee",
    method: "GET",
  });
};

export const updateProfileImage = (profileImageId: string) => {
  return client({
    url: "/hrm/me/employee/profile-image",
    method: "PATCH",
    data: { profile_image_id: profileImageId },
  });
};
