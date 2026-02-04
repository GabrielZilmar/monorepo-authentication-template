import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import sendVerificationEmail, {
  SendVerificationEmailErrorResult,
  SendVerificationEmailResult,
} from "~/data/send-verification-email";

export const useSendVerificationEmail = () => {
  const { showErrorToast, showSuccessToast } = useToastActions();

  const { mutate: sendEmailMutation, isPending } = useMutation<
    SendVerificationEmailResult,
    SendVerificationEmailErrorResult,
    void
  >({
    mutationFn: () => sendVerificationEmail(),
    onSuccess: () => {
      showSuccessToast("Verification email sent successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send verification email. Please try again.";
      showErrorToast(errorMessage);
    },
  });

  return { sendEmailMutation, isPending };
};

export default useSendVerificationEmail;
