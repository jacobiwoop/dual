import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('client_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('client_token');
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const userData = await authService.getCurrentUser();
        
        // Sécurité supplémentaire: le token client n'est valable QUE pour les rôles client/admin
        if (userData.role !== 'CLIENT' && userData.role !== 'ADMIN') {
          throw new Error('Unauthorized role for this app');
        }

        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to restore session:', error);
        logout(); // Nettoie le state si le token est invalide
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Écouter les événements de déconnexion forcée via api.ts
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (data: any) => {
    const response = await authService.login(data);
    
    if (response.user.role !== 'CLIENT' && response.user.role !== 'ADMIN') {
      throw new Error('Seuls les clients peuvent se connecter ici.');
    }

    localStorage.setItem('client_token', response.accessToken);
    localStorage.setItem('client_refresh_token', response.refreshToken);
    localStorage.setItem('client_user', JSON.stringify(response.user));
    
    setToken(response.accessToken);
    setUser(response.user);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    
    localStorage.setItem('client_token', response.accessToken);
    localStorage.setItem('client_refresh_token', response.refreshToken);
    localStorage.setItem('client_user', JSON.stringify(response.user));
    
    setToken(response.accessToken);
    setUser(response.user);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
  };

  const logout = () => {
    authService.logout().finally(() => {
      localStorage.removeItem('client_token');
      localStorage.removeItem('client_refresh_token');
      localStorage.removeItem('client_user');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    });
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
