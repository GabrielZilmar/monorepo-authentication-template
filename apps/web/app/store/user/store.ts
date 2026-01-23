import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserState } from "~/store/user";
import { UserActions } from "~/store/user/type";

const initialData: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialData,

      setUser: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      clearUser: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
