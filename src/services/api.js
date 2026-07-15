import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        //
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isAuthError = (status) => status === 401;
const isForbidden = (status) => status === 403;
const isNotFound = (status) => status === 404;
const isServerError = (status) => status >= 500;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (isAuthError(status)) {
        try {
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken(true);
            error.config.headers.Authorization = `Bearer ${token}`;
            return api(error.config);
          }
        } catch {
          auth.signOut();
          window.location.href = '/login';
        }
        auth.signOut();
        window.location.href = '/login';
      }

      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || null,
        data: data?.data || null,
        isAuthError: isAuthError(status),
        isForbidden: isForbidden(status),
        isNotFound: isNotFound(status),
        isServerError: isServerError(status),
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Unable to reach the server. Please check your connection.',
        errors: null,
        data: null,
        isNetworkError: true,
      });
    }

    return Promise.reject({
      status: -1,
      message: error.message || 'An unexpected error occurred',
      errors: null,
      data: null,
    });
  }
);

export const apiGet = (url, params) => api.get(url, { params });
export const apiPost = (url, data, config) => api.post(url, data, config);
export const apiPut = (url, data) => api.put(url, data);
export const apiDelete = (url) => api.delete(url);

export default api;
