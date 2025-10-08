import { useAuthStore } from "@/store/userStore";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;
console.log("API URL being used:", apiUrl);

export const axiosIsntanceAuth = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosIstanceAuthenticated = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosIstanceAuthenticated.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default axiosIstanceAuthenticated;
