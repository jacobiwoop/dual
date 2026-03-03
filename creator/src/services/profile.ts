import { api } from './api';

export interface CreatorProfile {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
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

  // Upload an image to R2 then update the profile avatar
  async uploadAndSetAvatar(file: File): Promise<string> {
    // Step 1: Get signed URL
    const { data: urlData } = await api.post('/api/creator/media/upload-url', {
      filename: file.name,
      contentType: file.type,
      type: 'image',
      size: file.size,
    });

    // Step 2: Upload to R2
    await fetch(urlData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    // Step 3: Build URL and update profile
    const publicUrl = urlData.key; // The key used as URL reference
    await profileService.updateAvatar(publicUrl);
    return publicUrl;
  },

  async uploadAndSetBanner(file: File): Promise<string> {
    const { data: urlData } = await api.post('/api/creator/media/upload-url', {
      filename: file.name,
      contentType: file.type,
      type: 'image',
      size: file.size,
    });

    await fetch(urlData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    const publicUrl = urlData.key;
    await profileService.updateBanner(publicUrl);
    return publicUrl;
  },
};
