import axios from "axios";
import { getCookie } from "cookies-next";
import Env from "~/shared/env";
import { COOKIES_NAMES } from "~/constants/cookies";
import { addToast } from "@repo/ui";

const axiosInstance = axios.create({
  baseURL: Env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      addToast({
        title: "Network error, check your connection",
        color: "danger",
      });
      return new Promise(() => {});
    }

    return Promise.reject(error);
  },
);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie(COOKIES_NAMES.ACCESS_TOKEN) as string;
    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
