import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { ResetPasswordDTO } from "@repo/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type ResetPasswordPayload = ResetPasswordDTO;
export type ResetPasswordErrorResult = AxiosError<GenericRequestError>;
export type ResetPasswordResult = AxiosResponse<void, ResetPasswordErrorResult>;

export const resetPassword = async (
  payload: ResetPasswordDTO,
): Promise<ResetPasswordResult> => {
  const response = await axiosInstance.post<void>("/auth/reset-password", {
    ...payload,
  });

  return response;
};

export default resetPassword;
