import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import forgotPassword, {
  ForgotPasswordErrorResult,
  ForgotPasswordPayload,
  ForgotPasswordResult,
} from "~/data/forgot-password";

export const useForgotPassword = () => {
  const { showErrorToast, showSuccessToast } = useToastActions();

  const { mutate: forgotPasswordMutation, isPending } = useMutation<
    ForgotPasswordResult,
    ForgotPasswordErrorResult,
    ForgotPasswordPayload
  >({
    mutationFn: (payload) => forgotPassword(payload),
    onSuccess: () => {
      showSuccessToast("Password reset email sent! Please check your inbox.");
    },
    onError: () => {
      showErrorToast("Ops.. Error sending password reset email. Try again!");
    },
  });

  return { forgotPasswordMutation, isPending };
};

export default useForgotPassword;
