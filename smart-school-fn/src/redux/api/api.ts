import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded: any = jwtDecode(token);
      const role = decoded.role;
      if (
        role !== "ADMIN" &&
        role !== "INSTRUCTOR" &&
        window.location.pathname === "/dashboard"
      ) {
        window.location.href = "/courses";
      }
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
