import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "~/middlewares";
import { ALL_ROUTES } from "~/routes";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const url = req.nextUrl.clone();
  const { isAuth } = await authMiddleware({ url });

  const isLoginPage = url.pathname === ALL_ROUTES.login;
  if (!isAuth && !isLoginPage) {
    url.pathname = ALL_ROUTES.login;
    return NextResponse.redirect(url);
  }
  if (isAuth && isLoginPage) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|public).*)"],
};
