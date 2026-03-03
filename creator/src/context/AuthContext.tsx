import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/auth';

interface User {
  id: string;
  email: string;
  username: string | null;
  role: string;
  avatarUrl: string | null;
  coinBalance: number;
  preferredPayoutMethod?: string;
  iban?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  paxfulUsername?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Au démarrage, vérifier si un token existe et valider avec le backend
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('creator_token');
      
      if (savedToken) {
        try {
          // Vérifier le token avec /me
          const userData = await authService.getCurrentUser();
          setToken(savedToken);
          setUser(userData.user);
        } catch (error) {
          console.error('Token invalide, déconnexion');
          localStorage.removeItem('creator_token');
          localStorage.removeItem('creator_refresh_token');
          localStorage.removeItem('creator_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response: AuthResponse = await authService.login({ email, password });
      
      setToken(response.accessToken);
      setUser(response.user);
      
      localStorage.setItem('creator_token', response.accessToken);
      localStorage.setItem('creator_refresh_token', response.refreshToken);
      localStorage.setItem('creator_user', JSON.stringify(response.user));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (data: any) => {
    try {
      setError(null);
      const response: AuthResponse = await authService.register({
        ...data,
        role: 'CREATOR',
      });
      
      setToken(response.accessToken);
      setUser(response.user);
      
      localStorage.setItem('creator_token', response.accessToken);
      localStorage.setItem('creator_refresh_token', response.refreshToken);
      localStorage.setItem('creator_user', JSON.stringify(response.user));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    }
    
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('creator_token');
    localStorage.removeItem('creator_refresh_token');
    localStorage.removeItem('creator_user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
