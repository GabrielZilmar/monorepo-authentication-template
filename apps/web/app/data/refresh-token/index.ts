import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { RefreshTokenDTO, RefreshTokenResponseDTO } from "@repo/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type RefreshTokenPayload = RefreshTokenDTO;
export type RefreshTokenErrorResult = AxiosError<GenericRequestError>;
export type RefreshTokenResult = AxiosResponse<
  RefreshTokenResponseDTO,
  RefreshTokenErrorResult
>;

export const refreshToken = async (
  payload: RefreshTokenDTO,
): Promise<RefreshTokenResult> => {
  return axiosInstance.post<RefreshTokenResponseDTO>("/auth/refresh", payload);
};

export default refreshToken;
