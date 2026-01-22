import { UserDTO } from "@repo/api";

export interface UserState {
  user: UserDTO | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface UserActions {
  setUser: (user: UserDTO, accessToken: string) => void;
  clearUser: () => void;
  updateUser: (user: Partial<UserDTO>) => void;
}
