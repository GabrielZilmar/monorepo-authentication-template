import { UserDTO } from "@repo/api";
import { NextURL } from "next/dist/server/web/next-url";
import { cookies } from "next/headers";
import { COOKIES_NAMES } from "~/constants/cookies";
import { HttpMethods } from "~/constants/http-methods";
import { HttpStatus } from "~/constants/http-status";
import { PUBLIC_ROUTES } from "~/routes";

type AuthMiddlewareParams = {
  url: NextURL;
};

type AuthMiddlewareResponse = {
  isAuth: boolean;
  user?: UserDTO;
};

export async function authMiddleware({
  url,
}: AuthMiddlewareParams): Promise<AuthMiddlewareResponse> {
  const { login: loginRoute, ...publicRoutes } = PUBLIC_ROUTES;
  void loginRoute; // Mark as intentionally unused
  if (Object.values(publicRoutes).includes(url.pathname)) {
    return { isAuth: true };
  }

  const accessToken = (await cookies()).get(COOKIES_NAMES.ACCESS_TOKEN);
  if (!accessToken) {
    return { isAuth: false };
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/me`, {
      method: HttpMethods.GET,
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });
  } catch {
    return { isAuth: false };
  }

  if (response.status !== HttpStatus.OK) {
    return { isAuth: false };
  }

  const responseBody = (await response.json()) as UserDTO;
  return { isAuth: true, user: responseBody };
}
