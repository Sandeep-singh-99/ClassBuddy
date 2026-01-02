import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosClient = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      error.message = error.response?.data?.detail || "Too many requests. Please try again later.";
    }
    return Promise.reject(error);
  }
)
