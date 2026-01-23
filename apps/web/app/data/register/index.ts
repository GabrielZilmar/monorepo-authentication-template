import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import type { RegisterUserDTO, AuthResponseDTO } from "@repo/api";
import { GenericRequestError } from "~/types/generic-request-error.type";

export type RegisterPayload = RegisterUserDTO;
export type RegisterErrorResult = AxiosError<GenericRequestError>;
export type RegisterResult = AxiosResponse<
  AuthResponseDTO,
  RegisterErrorResult
>;

export const register = async (
  payload: RegisterUserDTO,
): Promise<RegisterResult> => {
  const response = await axiosInstance.post<AuthResponseDTO>("/auth/register", {
    ...payload,
  });

  return response;
};

export default register;
