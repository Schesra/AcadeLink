import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn accessToken vào mọi request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động refresh accessToken khi nhận 401, rồi retry request gốc
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/admin/login') ||
      url.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const refreshToken = sessionStorage.getItem('refreshToken');

      // Không có refresh token → hết phiên
      if (!refreshToken) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang refresh → xếp hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const newAccessToken: string = data.accessToken;

        // Lưu accessToken mới
        sessionStorage.setItem('accessToken', newAccessToken);

        // Cập nhật user nếu roles thay đổi
        if (data.user) {
          sessionStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new CustomEvent('user-updated', { detail: data.user }));
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
