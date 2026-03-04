import { api } from './api';

export interface CreatorProfile {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  age: number | null;
  country: string | null;
  welcomeMessage: string | null;
  subscriberWelcomeMsg: string | null;
  categories: string | null;   // JSON string → string[]
  tags: string | null;         // JSON string → string[]
  profilePhotos: string | null;// JSON string → string[]
  height: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  bodyType: string | null;
  tattoos: string | null;
  subscriptionPrice: number;
  coinBalance: number;
  totalEarned: number;
  isVerified: boolean;
  kycStatus: string;
  iban: string | null;
  ibanVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  username?: string;
  subscriptionPrice?: number;
  iban?: string;
  age?: number | null;
  country?: string;
  welcomeMessage?: string;
  subscriberWelcomeMsg?: string;
  categories?: string[];
  tags?: string[];
  profilePhotos?: string[];
  height?: string;
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
  tattoos?: string;
}

export const profileService = {
  async getProfile(): Promise<CreatorProfile> {
    const { data } = await api.get('/api/creator/profile');
    return data.profile;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<CreatorProfile> {
    const { data } = await api.put('/api/creator/profile', payload);
    return data.profile;
  },

  async updateAvatar(avatarUrl: string): Promise<void> {
    await api.post('/api/creator/profile/avatar', { avatarUrl });
  },

  async updateBanner(bannerUrl: string): Promise<void> {
    await api.post('/api/creator/profile/banner', { bannerUrl });
  },

  async addProfilePhoto(photoUrl: string): Promise<string[]> {
    const { data } = await api.post('/api/creator/profile/photos', { photoUrl });
    return data.profilePhotos;
  },

  async removeProfilePhoto(index: number): Promise<string[]> {
    const { data } = await api.delete('/api/creator/profile/photos', { data: { index } });
    return data.profilePhotos;
  },

  // Helper: Upload an image to R2 and return its full public URL
  async uploadImage(file: File): Promise<string> {
    const { data: urlData } = await api.post('/api/creator/media/upload-url', {
      filename: file.name,
      contentType: file.type,
      type: 'image',
      size: file.size,
    });

    // Upload directly to R2 via presigned URL (same as library flow)
    await fetch(urlData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    // Return the ready-to-use public CDN URL
    return urlData.publicUrl;
  },

  async uploadAndSetAvatar(file: File): Promise<string> {
    const key = await profileService.uploadImage(file);
    await profileService.updateAvatar(key);
    return key;
  },

  async uploadAndSetBanner(file: File): Promise<string> {
    const key = await profileService.uploadImage(file);
    await profileService.updateBanner(key);
    return key;
  },
};
