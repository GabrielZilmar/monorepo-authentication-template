import { UserDTO } from "@repo/api";
import { AxiosError, AxiosResponse } from "axios";
import axiosInstance from "~/data/api";

export type GetMeResult = AxiosResponse<UserDTO, AxiosError>;

export const getMe = async (): Promise<GetMeResult> => {
  return axiosInstance.get<UserDTO>("/auth/me");
};
