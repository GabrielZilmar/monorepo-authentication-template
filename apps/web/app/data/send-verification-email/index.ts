import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type SendVerificationEmailErrorResult = AxiosError<GenericRequestError>;
export type SendVerificationEmailResult = AxiosResponse<
  void,
  SendVerificationEmailErrorResult
>;

export const sendVerificationEmail =
  async (): Promise<SendVerificationEmailResult> => {
    const response = await axiosInstance.post<void>(
      "/auth/send-verification-email",
    );

    return response;
  };

export default sendVerificationEmail;
