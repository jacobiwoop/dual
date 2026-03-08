import api from './api';

export interface ShowType {
  id: string;
  creatorId: string;
  emoji: string | null;
  title: string;
  description: string | null;
  priceCredits: number;
  durationLabel: string | null;
  availability: string;
}

export const showsService = {
  async getCreatorShows(creatorId: string): Promise<ShowType[]> {
    const { data } = await api.get(`/api/client/shows/${creatorId}`);
    return data.shows;
  },

  async requestShow(showId: string, creatorId: string): Promise<{ newBalance: number }> {
    const { data } = await api.post('/api/client/shows/request', { showId, creatorId });
    return data;
  },
};
