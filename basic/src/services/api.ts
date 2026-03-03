import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('client_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepter les erreurs 401 pour rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et qu'on n'a pas déjà essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ignorer les requêtes d'authentification
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('client_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Demander un nouveau token d'accès
        const res = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = res.data;
        
        // Sauvegarder le nouveau token
        localStorage.setItem('client_token', accessToken);
        
        // Refaire la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // En cas d'échec, on déconnecte de force (le AuthContext s'en chargera via event)
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_refresh_token');
        localStorage.removeItem('client_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
