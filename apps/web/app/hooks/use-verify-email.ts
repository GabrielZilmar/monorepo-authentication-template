import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_ROUTES } from "~/routes";
import verifyEmail, {
  VerifyEmailErrorResult,
  VerifyEmailPayload,
  VerifyEmailResult,
} from "~/data/verify-email";

export const useVerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showErrorToast, showSuccessToast } = useToastActions();

  const {
    mutate: verifyEmailMutation,
    isSuccess,
    isPending,
    isError,
  } = useMutation<
    VerifyEmailResult,
    VerifyEmailErrorResult,
    VerifyEmailPayload
  >({
    mutationFn: ({ token }) => verifyEmail({ token }),
    onSuccess: () => {
      showSuccessToast("Email verified successfully!");
      router.push(ALL_ROUTES.home);
    },
    onError: () => {
      showErrorToast("Invalid or expired verification token.");
    },
  });

  const verifyEmailFromParams = () => {
    const token = searchParams.get("token");
    if (!token) {
      return showErrorToast("Verification token is required.");
    }
    if (isError || isPending || isSuccess) {
      return;
    }

    verifyEmailMutation({ token });
  };

  return { verifyEmailMutation, verifyEmailFromParams, isPending };
};

export default useVerifyEmail;
