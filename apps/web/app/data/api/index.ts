import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import Env from "~/shared/env";
import { COOKIES_NAMES } from "~/constants/cookies";
import { addToast } from "@repo/ui";

const axiosInstance = axios.create({
  baseURL: Env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.code === "ERR_NETWORK") {
      addToast({
        title: "Network error, check your connection",
        color: "danger",
      });
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getCookie(COOKIES_NAMES.REFRESH_TOKEN) as string;

      if (!refreshToken) {
        isRefreshing = false;
        deleteCookie(COOKIES_NAMES.ACCESS_TOKEN);
        deleteCookie(COOKIES_NAMES.REFRESH_TOKEN);

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${Env.apiBaseUrl}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const { accessToken } = response.data;

        setCookie(COOKIES_NAMES.ACCESS_TOKEN, accessToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          domain: Env.appDomain,
          maxAge: 60 * 60, // 1h
          path: "/",
        });

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        deleteCookie(COOKIES_NAMES.ACCESS_TOKEN);
        deleteCookie(COOKIES_NAMES.REFRESH_TOKEN);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie(COOKIES_NAMES.ACCESS_TOKEN) as string;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
