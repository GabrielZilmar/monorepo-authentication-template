import { AxiosResponse, AxiosError } from "axios";
import axiosInstance from "~/data/api";
import { LoginDTO, LoginResponseDTO } from "@repo/api";

export type LoginPayload = LoginDTO;
export type LoginResult = AxiosResponse<LoginResponseDTO, AxiosError>;

export const login = async (payload: LoginDTO): Promise<LoginResult> => {
  const response = await axiosInstance.post<LoginResponseDTO>("/auth/login", {
    ...payload,
  });

  return response;
};

export default login;
