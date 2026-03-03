import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Instance Axios avec interceptors
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Ajouter token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('creator_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Gérer refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si 401 et pas déjà retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ignorer les requêtes d'authentification
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('creator_refresh_token');
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });
        
        localStorage.setItem('creator_token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('creator_token');
        localStorage.removeItem('creator_refresh_token');
        localStorage.removeItem('creator_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
