import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { COOKIES_NAMES } from "~/constants/cookies";
import { HttpStatus } from "~/constants/http-status";
import resetPassword, {
  ResetPasswordErrorResult,
  ResetPasswordPayload,
  ResetPasswordResult,
} from "~/data/reset-password";
import { ALL_ROUTES } from "~/routes";
import { useUserStore } from "~/store/user";

export const useResetPassword = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();
  const { showErrorToast, showSuccessToast } = useToastActions();

  const { mutate: resetPasswordMutation, isPending } = useMutation<
    ResetPasswordResult,
    ResetPasswordErrorResult,
    ResetPasswordPayload
  >({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: () => {
      deleteCookie(COOKIES_NAMES.ACCESS_TOKEN);
      deleteCookie(COOKIES_NAMES.REFRESH_TOKEN);
      clearUser();

      showSuccessToast(
        "Password reset successful! All sessions have been logged out. Please login with your new password.",
      );
      router.push(ALL_ROUTES.login);
    },
    onError: ({ response }) => {
      if (response?.status === HttpStatus.BAD_REQUEST) {
        return showErrorToast(
          "Invalid or expired token. Please request a new password reset.",
        );
      }
      showErrorToast("Ops.. Error resetting password. Try again!");
    },
  });

  return { resetPasswordMutation, isPending };
};

export default useResetPassword;
