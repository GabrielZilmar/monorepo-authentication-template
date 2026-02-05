import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { COOKIES_NAMES } from "~/constants/cookies";
import logout, { LogoutResult, LogoutResultError } from "~/data/logout";
import { ALL_ROUTES } from "~/routes";
import { useUserStore } from "~/store/user";

export const useLogout = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();
  const { showSuccessToast, showErrorToast } = useToastActions();

  const { mutate: logoutMutation, isPending } = useMutation<
    LogoutResult,
    LogoutResultError
  >({
    mutationFn: () => logout(),
    onSuccess: () => {
      deleteCookie(COOKIES_NAMES.ACCESS_TOKEN);
      deleteCookie(COOKIES_NAMES.REFRESH_TOKEN);
      clearUser();

      showSuccessToast("Logged out successfully!");
      router.push(ALL_ROUTES.login);
    },
    onError: () => {
      deleteCookie(COOKIES_NAMES.ACCESS_TOKEN);
      deleteCookie(COOKIES_NAMES.REFRESH_TOKEN);
      clearUser();

      showErrorToast("Error during logout, but you've been logged out locally");
      router.push(ALL_ROUTES.login);
    },
  });

  return { logoutMutation, isPending };
};

export default useLogout;
