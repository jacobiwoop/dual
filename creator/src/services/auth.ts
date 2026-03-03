import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: 'CREATOR';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: string;
    avatarUrl: string | null;
    balance: number;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/login', credentials);
    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post('/api/auth/register', userData);
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async getCurrentUser() {
    const { data } = await api.get('/api/auth/me');
    return data;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    return data;
  },
};
