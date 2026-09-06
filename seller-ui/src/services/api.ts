import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// ======================================================
// API URL
// ======================================================

const BASE_URL =
  process.env
    .NEXT_PUBLIC_API_URL
    ?.trim()
    .replace(/\/+$/, "") ||
  "http://localhost:8080/api";

// ======================================================
// MAIN API INSTANCE
// ======================================================

const api = axios.create({
  baseURL: BASE_URL,

  withCredentials: true,

  headers: {
    "Content-Type":
      "application/json",
  },
});

// ======================================================
// REFRESH-ONLY INSTANCE
// ======================================================

const refreshApi =
  axios.create({
    baseURL: BASE_URL,

    withCredentials: true,

    headers: {
      "Content-Type":
        "application/json",
    },
  });

// ======================================================
// RETRY TYPE
// ======================================================

interface RetryRequest
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ======================================================
// REFRESH STATE
// ======================================================

let isRefreshing = false;

let refreshPromise:
  | Promise<void>
  | null = null;

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => response,

  async (
    error: AxiosError
  ) => {
    const originalRequest =
      error.config as
        | RetryRequest
        | undefined;

    if (!originalRequest) {
      return Promise.reject(
        error
      );
    }

    if (
      error.response?.status !==
        401 ||
      originalRequest._retry
    ) {
      return Promise.reject(
        error
      );
    }

    const requestUrl =
      originalRequest.url ||
      "";

    const skipRefreshRoutes = [
      "/seller-login",
      "/seller-logout",
      "/seller-registration",
      "/verify-seller",
      "/seller-forgot-password",
      "/verify-seller-forgot-password-otp",
      "/seller-reset-password",
      "/reset-seller-password",
      "/seller-refresh-token",
    ];

    const shouldSkipRefresh =
      skipRefreshRoutes.some(
        (route) =>
          requestUrl.includes(
            route
          )
      );

    if (shouldSkipRefresh) {
      return Promise.reject(
        error
      );
    }

    originalRequest._retry =
      true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise =
          refreshApi
            .post(
              "/seller-refresh-token"
            )
            .then(
              () => undefined
            )
            .finally(() => {
              isRefreshing =
                false;

              refreshPromise =
                null;
            });
      }

      if (refreshPromise) {
        await refreshPromise;
      }

      return api(
        originalRequest
      );
    } catch (refreshError) {
      if (
        typeof window !==
        "undefined"
      ) {
        window.location.replace(
          "/login"
        );
      }

      return Promise.reject(
        refreshError
      );
    }
  }
);

export default api;