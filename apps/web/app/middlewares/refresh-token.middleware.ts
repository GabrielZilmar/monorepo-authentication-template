import { cookies } from "next/headers";
import { COOKIES_NAMES } from "~/constants/cookies";
import { HttpMethods } from "~/constants/http-methods";
import { HttpStatus } from "~/constants/http-status";

type RefreshTokenResponse = {
  accessToken: string;
};

export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIES_NAMES.REFRESH_TOKEN);
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/refresh`,
      {
        method: HttpMethods.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken.value,
        }),
      },
    );

    if (
      response.status !== HttpStatus.CREATED &&
      response.status !== HttpStatus.OK
    ) {
      return null;
    }

    const data = (await response.json()) as RefreshTokenResponse;
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
