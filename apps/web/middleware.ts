import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "~/middlewares";
import { ALL_ROUTES } from "~/routes";
import { COOKIES_NAMES } from "~/constants/cookies";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const url = req.nextUrl.clone();
  const { isAuth, newAccessToken } = await authMiddleware({ url });

  const isLoginPage = url.pathname === ALL_ROUTES.login;

  if (!isAuth && !isLoginPage) {
    url.pathname = ALL_ROUTES.login;
    const response = NextResponse.redirect(url);

    response.cookies.delete(COOKIES_NAMES.ACCESS_TOKEN);
    response.cookies.delete(COOKIES_NAMES.REFRESH_TOKEN);

    return response;
  }

  let response = NextResponse.next();
  if (isAuth && isLoginPage) {
    url.pathname = "/";
    response = NextResponse.redirect(url);
  }

  if (newAccessToken) {
    response.cookies.set(COOKIES_NAMES.ACCESS_TOKEN, newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1h
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|public).*)"],
};
