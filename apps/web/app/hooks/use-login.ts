import { useToastActions } from "@repo/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { COOKIES_NAMES } from "~/constants/cookies";
import { HttpStatus } from "~/constants/http-status";
import { getMe } from "~/data/get-me";
import login, { LoginPayload, LoginResult } from "~/data/login";
import { ALL_ROUTES } from "~/routes";
import Env from "~/shared/env";
import { useUserStore } from "~/store/user";

export const useLogin = () => {
  const router = useRouter();
  const { setUser } = useUserStore();
  const { showErrorToast, showSuccessToast } = useToastActions();

  const { mutate: loginMutation } = useMutation<
    LoginResult,
    AxiosError,
    LoginPayload
  >({
    mutationFn: (payload) => login(payload),
    onSuccess: async ({ data }: LoginResult) => {
      setCookie(COOKIES_NAMES.ACCESS_TOKEN, data.accessToken, {
        secure: true,
        sameSite: "lax",
        domain: Env.appDomain,
      });
      const { data: user } = await getMe();
      setUser(user, data.accessToken);
      showSuccessToast("Successful login!");
      router.push(ALL_ROUTES.home);
    },
    onError: ({ response }: AxiosError) => {
      if (response?.status === HttpStatus.UNAUTHORIZED) {
        return showErrorToast("Ops.. Invalid password or email. Try again!");
      }

      return showErrorToast("Ops.. Error on sign in. Try again!");
    },
  });

  return { loginMutation };
};

export default useLogin;
