import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * Axios interceptor setup for dual authentication (User & Student)
 * Automatically adds appropriate Bearer token based on current context
 */

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api` || "http://localhost:3000/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor: Add appropriate auth token
 * Priority: Student token > User token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for student token first (active student session)
    const studentToken = localStorage.getItem("accessToken_student");
    if (studentToken && isValidToken(studentToken)) {
      config.headers.Authorization = `Bearer ${studentToken}`;
      return config;
    }

    // Fall back to user token (staff/admin session)
    const userToken = localStorage.getItem("accessToken_user");
    if (userToken && isValidToken(userToken)) {
      config.headers.Authorization = `Bearer ${userToken}`;
      return config;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle token expiration & errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Check if it's a student auth error
      if (localStorage.getItem("accessToken_student")) {
        // Clear student session
        clearStudentSession();

        // Attempt refresh if endpoint exists
        if (!originalRequest.url?.includes("/student-auth/refresh")) {
          try {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/student-auth/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken_student")}`,
                },
              }
            );

            const newToken = refreshResponse.data.data.token;
            localStorage.setItem("accessToken_student", newToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch {
            // Refresh failed, redirect to login
            clearStudentSession();
            window.location.href = "/login?error=session-expired";
            return Promise.reject(error);
          }
        }
      } else if (localStorage.getItem("accessToken_user")) {
        // Clear user session
        clearUserSession();

        // Attempt user refresh (if endpoint exists)
        if (!originalRequest.url?.includes("/auth/refresh")) {
          try {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken_user")}`,
                },
              }
            );

            const newToken = refreshResponse.data.data.token;
            localStorage.setItem("accessToken_user", newToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch {
            // Refresh failed, redirect to login
            clearUserSession();
            window.location.href = "/login?error=session-expired";
            return Promise.reject(error);
          }
        }
      }

      window.location.href = "/login?error=unauthorized";
    }

    // Handle 403 Forbidden (permission denied)
    if (error.response?.status === 403) {
      console.warn("Access forbidden:", error.response.data?.message);
      // Don't redirect, let component handle it
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("Resource not found:", error.response.data?.message);
    }

    // Handle 500+ Server errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper: Validate JWT token expiration
 */
function isValidToken(token: string): boolean {
  try {
    // Simple check: token exists and is not just "undefined" or empty
    if (!token || token === "undefined") return false;

    // Decode without verification (client-side only)
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all student session data
 */
function clearStudentSession(): void {
  localStorage.removeItem("accessToken_student");
  localStorage.removeItem("student");
  sessionStorage.removeItem("studentContext");
}

/**
 * Clear all user session data
 */
function clearUserSession(): void {
  localStorage.removeItem("accessToken_user");
  localStorage.removeItem("user");
  localStorage.removeItem("userOrganizations");
  sessionStorage.removeItem("userContext");
}

/**
 * Helper: Get current auth type (student or user)
 */
export function getCurrentAuthType(): "student" | "user" | null {
  if (
    localStorage.getItem("accessToken_student") &&
    isValidToken(localStorage.getItem("accessToken_student")!)
  ) {
    return "student";
  }
  if (
    localStorage.getItem("accessToken_user") &&
    isValidToken(localStorage.getItem("accessToken_user")!)
  ) {
    return "user";
  }
  return null;
}

/**
 * Helper: Logout from all sessions
 */
export function logoutAll(): void {
  clearStudentSession();
  clearUserSession();
  window.location.href = "/login";
}

/**
 * Helper: Switch from student to user context
 */
export function switchToUserContext(): void {
  clearStudentSession();
  window.location.href = "/dashboard";
}

/**
 * Helper: Switch from user to student context
 */
export function switchToStudentContext(): void {
  clearUserSession();
  window.location.href = "/student/dashboard";
}

export default apiClient;
