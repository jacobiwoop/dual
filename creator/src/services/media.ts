import axios from 'axios';
import api from './api';

export interface MediaItem {
  id: string;
  creatorId: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string | null;
  visibility: 'free' | 'subscribers' | 'paid';
  priceCredits: number;
  description: string | null;
  galleryId: string | null;
  sortOrder: number;
  fileSizeBytes: number | null;
  durationSec: number | null;
  isFlagged: boolean;
  isVisible: boolean;
  salesCount: number;
  revenueCredits: number;
  uploadDate: string;
  gallery?: {
    id: string;
    title: string;
  } | null;
}

export interface Gallery {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  visibility: 'free' | 'subscribers' | 'paid';
  priceCredits: number;
  salesCount: number;
  revenueCredits: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

export const mediaService = {
  // Get Media Items
  getItems: async (params?: { galleryId?: string; type?: string; search?: string; visibility?: string; limit?: number; offset?: number }) => {
    const res = await api.get<{ items: MediaItem[]; total: number; hasMore: boolean }>('/api/creator/media', { params });
    return res.data;
  },

  // Get Galleries
  getGalleries: async () => {
    const res = await api.get<{ galleries: Gallery[] }>('/api/creator/media/galleries');
    return res.data.galleries;
  },

  // Get single Gallery with contents
  getGalleryDetails: async (id: string) => {
    const res = await api.get<{ gallery: Gallery & { items: MediaItem[] } }>(`/api/creator/media/galleries/${id}`);
    return res.data.gallery;
  },

  // Generate Upload URL
  requestUploadUrl: async (filename: string, contentType: string, size: number, type: 'image' | 'video') => {
    const res = await api.post<{ uploadUrl: string; key: string }>('/api/creator/media/upload-url', {
      filename,
      contentType,
      size,
      type,
    });
    return res.data;
  },

  // Upload to R2 directly
  uploadToR2: async (uploadUrl: string, file: File) => {
    // Note: On n'utilise pas l'instance globale `api` car Cloudflare nécessite un PUT direct
    // avec un Content-Type précis et sans en-tête d'Authorization local
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  // Create Gallery
  createGallery: async (data: { title: string; description?: string; priceCredits: number; visibility: string; coverKey?: string }) => {
    const res = await api.post<{ gallery: Gallery }>('/api/creator/media/galleries', data);
    return res.data.gallery;
  },

  // Update Gallery
  updateGallery: async (id: string, data: { title?: string; description?: string; priceCredits?: number; visibility?: string; coverKey?: string | null }) => {
    const res = await api.put<{ gallery: Gallery }>(`/api/creator/media/galleries/${id}`, data);
    return res.data.gallery;
  },

  // Update Media (pricing/visibility)
  updateMedia: async (id: string, data: { visibility?: string; priceCredits?: number; description?: string; isVisible?: boolean }) => {
    const res = await api.put<{ media: MediaItem }>(`/api/creator/media/${id}`, data);
    return res.data.media;
  },

  // Delete Media
  deleteMedia: async (id: string) => {
    const res = await api.delete(`/api/creator/media/${id}`);
    return res.data;
  },
};
