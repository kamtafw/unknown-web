import { useAuthStore } from '@/store/userStore';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const axiosIsntanceAuth = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  //   withCredentials: true,
});

const axiosIstanceAuthenticated = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// axiosIstanceAuthenticated.interceptors.request.use((config) => {
//     const user = useAuthStore.getState().user
//       console.log('user state', user);

//   if (user?.data) {
//     config.headers.Authorization = `Bearer ${user?.data?.access_token}`;
//   }
//   return config;
// });

// export default axiosIstanceAuthenticated

axiosIstanceAuthenticated.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState();

  console.log('user state', user);

  const token = user?.data?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosIstanceAuthenticated;
