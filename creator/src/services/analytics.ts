import api from './api';

export interface OverviewStats {
  balance: number;
  totalEarned: number;
  earningsLast30Days: number;
  subscriptionPrice: number;
  subscribers: {
    total: number;
    new7Days: number;
  };
  messages: {
    total: number;
    unread: number;
  };
  library: {
    totalItems: number;
  };
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
}

export interface SubscribersDataPoint {
  date: string;
  count: number;
  active: number;
}

export interface TopClient {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalSpent: number;
  messageCount: number;
  subscriptionStatus: 'active' | 'inactive';
}

export const analyticsService = {
  /**
   * Récupérer la vue d'ensemble (stats principales)
   */
  async getOverview(): Promise<OverviewStats> {
    const { data } = await api.get('/api/creator/analytics/overview');
    return data;
  },

  /**
   * Récupérer les données du graphique de revenus
   * @param period - '7d' | '30d' | '90d' | '1y'
   */
  async getRevenueChart(period: string = '30d'): Promise<RevenueDataPoint[]> {
    const { data } = await api.get('/api/creator/analytics/revenue', {
      params: { period },
    });
    return data.data || [];
  },

  /**
   * Récupérer les données du graphique d'abonnés
   * @param period - '7d' | '30d' | '90d' | '1y'
   */
  async getSubscribersChart(period: string = '30d'): Promise<SubscribersDataPoint[]> {
    const { data } = await api.get('/api/creator/analytics/subscribers', {
      params: { period },
    });
    return data.data || [];
  },

  /**
   * Récupérer la liste des meilleurs clients
   * @param limit - Nombre de clients à retourner (défaut: 10)
   */
  async getTopClients(limit: number = 10): Promise<TopClient[]> {
    const { data } = await api.get('/api/creator/analytics/top-clients', {
      params: { limit },
    });
    return data.clients || [];
  },

  /**
   * Récupérer les statistiques détaillées
   */
  async getStats() {
    const { data } = await api.get('/api/creator/analytics/stats');
    return data;
  },
};
