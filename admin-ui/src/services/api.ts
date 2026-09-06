import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// ======================================================
// API URL
// ======================================================

const API_BASE_URL =
  process.env
    .NEXT_PUBLIC_API_URL
    ?.trim()
    .replace(/\/+$/, "") ||
  "http://localhost:8080/api";

// ======================================================
// MAIN API INSTANCE
// ======================================================

const api = axios.create({
  baseURL:
    API_BASE_URL,

  withCredentials: true,

  headers: {
    "Content-Type":
      "application/json",
  },
});

// ======================================================
// RETRY TYPE
// ======================================================

interface RetryRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ======================================================
// REFRESH STATE
// ======================================================

let refreshPromise:
  | Promise<void>
  | null = null;

// ======================================================
// REFRESH ADMIN SESSION
// ======================================================

const refreshAdminSession =
  async (): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/admin-refresh-token`,
      {},
      {
        withCredentials: true,

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  };

// ======================================================
// NOTIFY SESSION EXPIRY
// ======================================================

const notifySessionExpired =
  () => {
    if (
      typeof window !==
      "undefined"
    ) {
      window.dispatchEvent(
        new Event(
          "admin-session-expired"
        )
      );
    }
  };

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
        | RetryRequestConfig
        | undefined;

    const requestUrl =
      originalRequest?.url ||
      "";

    const isAuthRequest =
      requestUrl.includes(
        "/admin-login"
      ) ||
      requestUrl.includes(
        "/admin-logout"
      ) ||
      requestUrl.includes(
        "/admin-refresh-token"
      );

    if (
      error.response?.status !==
        401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(
        error
      );
    }

    originalRequest._retry =
      true;

    try {
      if (!refreshPromise) {
        refreshPromise =
          refreshAdminSession()
            .finally(() => {
              refreshPromise =
                null;
            });
      }

      await refreshPromise;

      return api(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      notifySessionExpired();

      return Promise.reject(
        refreshError
      );
    }
  }
);

export default api;