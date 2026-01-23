import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import register, {
  RegisterErrorResult,
  RegisterPayload,
  RegisterResult,
} from "~/data/register";
import { ALL_ROUTES } from "~/routes";

export const useRegister = () => {
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useToastActions();

  const { mutate: registerMutation, isPending } = useMutation<
    RegisterResult,
    RegisterErrorResult,
    RegisterPayload
  >({
    mutationFn: (payload) => register(payload),
    onSuccess: () => {
      showSuccessToast("Account created successfully! Please sign in.");
      router.push(ALL_ROUTES.login);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      showErrorToast(errorMessage);
    },
  });

  return { registerMutation, isPending };
};

export default useRegister;
