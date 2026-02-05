import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type LogoutResultError = AxiosError<GenericRequestError>;
export type LogoutResult = AxiosResponse<void, LogoutResultError>;

export const logout = async (): Promise<LogoutResult> => {
  return axiosInstance.post<void>("/auth/logout");
};

export default logout;
