import api from './api';

export interface User {
  id: string;
  email: string;
  role: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  balanceCredits: number;
  totalSpent: number;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  async register(data: any): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', { ...data, role: 'CLIENT' });
    return response.data;
  },

  async login(data: any): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', { ...data, role: 'CLIENT' });
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('client_refresh_token');
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken });
      } catch (e) {
        console.error('Erreur lors du logout backend', e);
      }
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  },
};
