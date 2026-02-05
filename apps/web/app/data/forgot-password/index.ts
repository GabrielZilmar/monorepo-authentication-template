import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { ForgotPasswordDTO } from "@repo/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type ForgotPasswordPayload = ForgotPasswordDTO;
export type ForgotPasswordErrorResult = AxiosError<GenericRequestError>;
export type ForgotPasswordResult = AxiosResponse<
  void,
  ForgotPasswordErrorResult
>;

export const forgotPassword = async (
  payload: ForgotPasswordDTO,
): Promise<ForgotPasswordResult> => {
  const response = await axiosInstance.post<void>("/auth/forgot-password", {
    ...payload,
  });

  return response;
};

export default forgotPassword;
