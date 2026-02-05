import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { HttpStatus } from "~/constants/http-status";
import resetPassword, {
  ResetPasswordErrorResult,
  ResetPasswordPayload,
  ResetPasswordResult,
} from "~/data/reset-password";
import { ALL_ROUTES } from "~/routes";

export const useResetPassword = () => {
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useToastActions();

  const { mutate: resetPasswordMutation, isPending } = useMutation<
    ResetPasswordResult,
    ResetPasswordErrorResult,
    ResetPasswordPayload
  >({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: () => {
      showSuccessToast("Password reset successful! Please login.");
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
