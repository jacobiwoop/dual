# 🎨 Creator Studio - Intégration Frontend

**Application** : Creator Studio (`creator/`)  
**Backend** : ✅ 100% Ready  
**Frontend** : 🔄 0% → 100%  
**Sessions** : 7 sessions estimées

---

## 📊 Progression Globale

| Phase                              | Status | Sessions | Progress |
| ---------------------------------- | ------ | -------- | -------- |
| Creator.1 - Authentification       | ⏳     | 0/1      | 0%       |
| Creator.2 - Dashboard & Analytics  | ⏳     | 0/1      | 0%       |
| Creator.3 - Messages WebSocket     | ⏳     | 0/2      | 0%       |
| Creator.4 - Library & Media Upload | ⏳     | 0/1      | 0%       |
| Creator.5 - Profile Management     | ⏳     | 0/1      | 0%       |
| Creator.6 - Payouts                | ⏳     | 0/1      | 0%       |
| **TOTAL**                          | **⏳** | **0/7**  | **0%**   |

---

## 🎯 Phase Creator.1 - Authentification (Session 1)

### Objectif

Connecter le système d'authentification existant (AuthContext) avec le backend API.

### Backend Endpoints Utilisés

- ✅ POST `/api/auth/register` - Inscription
- ✅ POST `/api/auth/login` - Connexion
- ✅ POST `/api/auth/refresh` - Refresh token
- ✅ POST `/api/auth/logout` - Déconnexion
- ✅ GET `/api/auth/me` - Profil utilisateur

### Fichiers à Créer/Modifier

#### 1. Service API (`src/services/api.ts`) - CRÉER

```typescript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Instance Axios avec interceptors
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Ajouter token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("creator_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Gérer refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et pas déjà retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("creator_refresh_token");
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("creator_token", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem("creator_token");
        localStorage.removeItem("creator_refresh_token");
        localStorage.removeItem("creator_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

#### 2. Auth Service (`src/services/auth.ts`) - CRÉER

```typescript
import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: "CREATOR";
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
    const { data } = await api.post("/api/auth/login", credentials);
    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post("/api/auth/register", userData);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout");
  },

  async getCurrentUser() {
    const { data } = await api.get("/api/auth/me");
    return data;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await api.post("/api/auth/refresh", { refreshToken });
    return data;
  },
};
```

#### 3. Mettre à jour AuthContext (`src/context/AuthContext.tsx`) - MODIFIER

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/auth';

interface User {
  id: string;
  email: string;
  username: string | null;
  role: string;
  avatarUrl: string | null;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage, vérifier si un token existe et fetch user
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
    const response: AuthResponse = await authService.login({ email, password });

    setToken(response.accessToken);
    setUser(response.user);

    localStorage.setItem('creator_token', response.accessToken);
    localStorage.setItem('creator_refresh_token', response.refreshToken);
    localStorage.setItem('creator_user', JSON.stringify(response.user));
  };

  const register = async (data: any) => {
    const response: AuthResponse = await authService.register({
      ...data,
      role: 'CREATOR',
    });

    setToken(response.accessToken);
    setUser(response.user);

    localStorage.setItem('creator_token', response.accessToken);
    localStorage.setItem('creator_refresh_token', response.refreshToken);
    localStorage.setItem('creator_user', JSON.stringify(response.user));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    }

    setToken(null);
    setUser(null);
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
```

#### 4. Page Login (`src/components/Auth.tsx`) - MODIFIER

Connecter avec le vrai AuthContext au lieu de mock data.

#### 5. Créer `.env` - CRÉER

```bash
VITE_API_URL=http://localhost:3001
```

### Tâches Session 1

- [ ] Créer `src/services/api.ts`
- [ ] Créer `src/services/auth.ts`
- [ ] Modifier `src/context/AuthContext.tsx`
- [ ] Modifier `src/components/Auth.tsx` (login form)
- [ ] Créer `.env` avec VITE_API_URL
- [ ] Installer dependencies : `npm install axios`
- [ ] Tester login/logout
- [ ] Tester token refresh
- [ ] Tester protected routes

### Tests de Validation

1. ✅ Login avec email/password → Token stocké
2. ✅ Refresh page → User toujours connecté
3. ✅ Token expiré → Auto-refresh fonctionne
4. ✅ Logout → Redirection vers login
5. ✅ Routes protégées → Redirect si non auth

### Status

- ⏳ **Non commencé**
- Durée estimée : 1-2h
- Dépendances : Aucune

---

## 🎯 Phase Creator.2 - Dashboard & Analytics (Session 2)

### Objectif

Connecter le dashboard avec les vraies analytics du backend.

### Backend Endpoints Utilisés

- ✅ GET `/api/creator/analytics/overview` - Vue d'ensemble
- ✅ GET `/api/creator/analytics/revenue` - Graphique revenus
- ✅ GET `/api/creator/analytics/subscribers` - Graphique abonnés
- ✅ GET `/api/creator/analytics/top-clients` - Top clients
- ✅ GET `/api/creator/analytics/stats` - Statistiques

### Fichiers à Créer/Modifier

#### 1. Analytics Service (`src/services/analytics.ts`) - CRÉER

```typescript
import api from "./api";

export const analyticsService = {
  async getOverview() {
    const { data } = await api.get("/api/creator/analytics/overview");
    return data;
  },

  async getRevenueChart(period: string) {
    const { data } = await api.get("/api/creator/analytics/revenue", {
      params: { period },
    });
    return data;
  },

  async getSubscribersChart(period: string) {
    const { data } = await api.get("/api/creator/analytics/subscribers", {
      params: { period },
    });
    return data;
  },

  async getTopClients(limit: number = 10) {
    const { data } = await api.get("/api/creator/analytics/top-clients", {
      params: { limit },
    });
    return data;
  },

  async getStats() {
    const { data } = await api.get("/api/creator/analytics/stats");
    return data;
  },
};
```

#### 2. Dashboard Component (`src/components/Dashboard.tsx`) - MODIFIER

Remplacer mock data par calls API.

### Tâches Session 2

- [ ] Créer `src/services/analytics.ts`
- [ ] Modifier `src/components/Dashboard.tsx`
- [ ] Connecter overview stats
- [ ] Connecter revenue chart
- [ ] Connecter subscribers chart
- [ ] Connecter top clients
- [ ] Gérer loading states
- [ ] Gérer error states

### Status

- ⏳ **Non commencé**
- Durée estimée : 1-2h
- Dépendances : Creator.1 (Auth)

---

## 🎯 Phase Creator.3 - Messages WebSocket (Sessions 3-4)

### Objectif

Implémenter la messagerie temps réel avec Socket.io.

### Backend Utilisé

- ✅ WebSocket Server (Socket.io)
- ✅ 8 events implémentés
- ✅ GET `/api/creator/conversations` - REST fallback
- ✅ POST `/api/creator/conversations/:id/messages` - REST fallback

### Session 3.1 - Socket Context & Hooks

#### Fichiers à Créer

##### 1. SocketContext (`src/context/SocketContext.tsx`)

##### 2. Hook useSocket (`src/hooks/useSocket.ts`)

##### 3. Hook useMessages (`src/hooks/useMessages.ts`)

##### 4. Hook useTyping (`src/hooks/useTyping.ts`)

### Session 3.2 - UI Integration

#### Fichiers à Modifier

##### 1. Messages Component (`src/components/Messages.tsx`)

- Intégrer WebSocket
- Typing indicators
- Online/offline status
- Real-time updates

### Tâches Sessions 3-4

**Session 3.1 :**

- [ ] Installer `socket.io-client`
- [ ] Créer SocketContext
- [ ] Créer useSocket hook
- [ ] Créer useMessages hook
- [ ] Créer useTyping hook
- [ ] Tester connexion WebSocket

**Session 3.2 :**

- [ ] Modifier Messages.tsx
- [ ] Intégrer real-time messages
- [ ] Ajouter typing indicators UI
- [ ] Ajouter online/offline badges
- [ ] Gérer reconnexion
- [ ] Tests end-to-end

### Status

- ⏳ **Non commencé**
- Durée estimée : 3-4h (2 sessions)
- Dépendances : Creator.1 (Auth)

---

## 🎯 Phases Suivantes (Résumé)

### Creator.4 - Library & Media Upload

- Upload vers R2 (signed URLs)
- Liste bibliothèque
- Folders management

### Creator.5 - Profile Management

- Afficher profil
- Éditer profil
- Upload avatar/banner
  ve

### Creator.6 - Payouts

- Demander retrait
- Historique

---

## 📝 Notes & Décisions

### Architecture

- **API Service** : Axios avec interceptors pour JWT
- **Context API** : AuthContext + SocketContext
- **Hooks customs** : useSocket, useMessages, useTyping
- **State management** : useState + Context (pas de Redux)

### Sécurité

- JWT dans localStorage
- Auto-refresh token
- Protected routes
- WebSocket auth au handshake

---

**Status Actuel** : ⏳ Prêt à démarrer Creator.1  
**Prochaine étape** : Créer services API & connecter Auth
