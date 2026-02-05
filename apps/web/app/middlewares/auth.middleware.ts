import { UserDTO } from "@repo/api";
import { NextURL } from "next/dist/server/web/next-url";
import { cookies } from "next/headers";
import { COOKIES_NAMES } from "~/constants/cookies";
import { HttpMethods } from "~/constants/http-methods";
import { HttpStatus } from "~/constants/http-status";
import { PUBLIC_ROUTES } from "~/routes";
import { refreshAccessToken } from "./refresh-token.middleware";

type AuthMiddlewareParams = {
  url: NextURL;
};

type AuthMiddlewareResponse = {
  isAuth: boolean;
  user?: UserDTO;
  newAccessToken?: string;
};

export async function authMiddleware({
  url,
}: AuthMiddlewareParams): Promise<AuthMiddlewareResponse> {
  const { login: loginRoute, ...publicRoutes } = PUBLIC_ROUTES;
  void loginRoute;
  if (Object.values(publicRoutes).includes(url.pathname)) {
    return { isAuth: true };
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(COOKIES_NAMES.ACCESS_TOKEN);

  if (!accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      accessToken = { name: COOKIES_NAMES.ACCESS_TOKEN, value: newToken };
      return validateToken(accessToken.value, true, newToken);
    }
    return { isAuth: false };
  }

  const validationResult = await validateToken(accessToken.value, false);
  if (!validationResult.isAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return validateToken(newToken, true, newToken);
    }
  }

  return validationResult;
}

async function validateToken(
  token: string,
  isRefreshed: boolean,
  newAccessToken?: string,
): Promise<AuthMiddlewareResponse> {
  let response: Response;

  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/me`, {
      method: HttpMethods.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return { isAuth: false };
  }

  if (response.status !== HttpStatus.OK) {
    return { isAuth: false };
  }

  const user = (await response.json()) as UserDTO;
  return {
    isAuth: true,
    user,
    newAccessToken: isRefreshed ? newAccessToken : undefined,
  };
}
