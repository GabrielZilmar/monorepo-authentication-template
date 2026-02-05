import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { VerifyEmailParamsDTO } from "@repo/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type VerifyEmailPayload = VerifyEmailParamsDTO;
export type VerifyEmailErrorResult = AxiosError<GenericRequestError>;
export type VerifyEmailResult = AxiosResponse<void, VerifyEmailErrorResult>;

export const verifyEmail = async ({
  token,
}: VerifyEmailPayload): Promise<VerifyEmailResult> => {
  const response = await axiosInstance.post<void>(
    "/auth/verify-email",
    undefined,
    { params: { token } },
  );

  return response;
};

export default verifyEmail;
