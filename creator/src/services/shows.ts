import api from './api';

export interface ShowType {
  id: string;
  emoji: string | null;
  title: string;
  description: string | null;
  priceCredits: number;
  durationLabel: string | null;
  availability: string;
  isActive: boolean;
}

export const showsService = {
  async getShows(): Promise<ShowType[]> {
    const { data } = await api.get('/api/creator/shows');
    return data.shows;
  },

  async createShow(showInfo: Partial<ShowType>): Promise<ShowType> {
    const { data } = await api.post('/api/creator/shows', showInfo);
    return data.show;
  },

  async updateShow(id: string, updates: Partial<ShowType>): Promise<ShowType> {
    const { data } = await api.put(`/api/creator/shows/${id}`, updates);
    return data.show;
  },

  async deleteShow(id: string): Promise<void> {
    await api.delete(`/api/creator/shows/${id}`);
  },
};
