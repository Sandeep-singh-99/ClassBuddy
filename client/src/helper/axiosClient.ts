import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { oauthStorage } from "@/helper/oauthPKCE";

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || "classbuddy-web";

export const axiosClient = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true,
});

// Flag and queue to manage concurrent token refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Pass requests through (cookies are attached automatically via withCredentials: true)
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

// Response Interceptor: 429 Error & Automatic Cookie Token Refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 429) {
      error.message =
        (error.response?.data as { detail?: string })?.detail ||
        "Too many requests. Please try again later.";
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized for API requests (excluding auth/oauth endpoints)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/oauth/token") &&
      !originalRequest.url?.includes("/oauth/revoke")
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosClient(originalRequest)),
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("client_id", CLIENT_ID);

        // Perform token refresh via separate axios call sending and receiving HttpOnly cookies
        await axios.post(`${VITE_API_URL}/oauth/token`, params, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        processQueue(null, "cookie_updated");
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        oauthStorage.clearPKCEContext();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

