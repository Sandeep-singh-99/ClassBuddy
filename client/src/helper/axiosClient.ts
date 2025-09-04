import axios from "axios";

const VITE_API_URL = "http://127.0.0.1:8000";

export const axiosClient = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true,
});
