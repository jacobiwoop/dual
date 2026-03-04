import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LibraryFolder {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: string;
  _count: { items: number };
}

export interface LibraryItem {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: 'image' | 'video';
  filename: string | null;
  sizeBytes: number | null;
  durationSec: number | null;
  folderId: string | null;
  createdAt: string;
  folder?: { id: string; title: string } | null;
}

export interface LibraryStats {
  totalItems: number;
  totalFolders: number;
  imageCount: number;
  videoCount: number;
  totalSizeBytes: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const libraryService = {
  // Médias
  async getItems(params?: { folderId?: string; type?: string; limit?: number; offset?: number }) {
    const { data } = await api.get('/api/creator/library', { params });
    return data as { items: LibraryItem[]; total: number; hasMore: boolean };
  },

  async deleteItem(id: string) {
    // Use media route to also delete from R2
    await api.delete(`/api/creator/media/${id}`);
  },

  async moveItem(id: string, folderId: string | null) {
    const { data } = await api.put(`/api/creator/library/${id}/move`, { folderId });
    return data.item as LibraryItem;
  },

  async getStats() {
    const { data } = await api.get('/api/creator/library/stats');
    return data as LibraryStats;
  },

  // Dossiers
  async getFolders() {
    const { data } = await api.get('/api/creator/library/folders');
    return data.folders as LibraryFolder[];
  },

  async createFolder(title: string, description?: string) {
    const body: any = { title };
    if (description) {
      body.description = description;
    }
    const { data } = await api.post('/api/creator/library/folders', body);
    return data.folder as LibraryFolder;
  },

  async updateFolder(id: string, title: string) {
    const { data } = await api.put(`/api/creator/library/folders/${id}`, { title });
    return data.folder as LibraryFolder;
  },

  async deleteFolder(id: string) {
    await api.delete(`/api/creator/library/folders/${id}`);
  },

  // Upload R2 (3 étapes)
  async requestUploadUrl(file: File) {
    const { data } = await api.post('/api/creator/media/upload-url', {
      filename: file.name,
      contentType: file.type,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      size: file.size,
    });
    return data as { uploadUrl: string; key: string; expiresIn: number };
  },

  async uploadToR2(uploadUrl: string, file: File, onProgress?: (pct: number) => void) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(file);
    });
  },

  async confirmUpload(params: { key: string; filename: string; contentType: string; size: number; type: string; folderId?: string | null }) {
    const body: Record<string, unknown> = {
      key: params.key,
      filename: params.filename,
      contentType: params.contentType,
      size: params.size,
      type: params.type,
    };
    // N'envoyer folderId que si c'est une vraie UUID (le schéma backend rejette null)
    if (params.folderId) body.folderId = params.folderId;

    const { data } = await api.post('/api/creator/media/confirm', body);
    return data.item as LibraryItem;
  },

  // Upload complet en une seule fonction
  async uploadFile(file: File, folderId?: string | null, onProgress?: (pct: number) => void): Promise<LibraryItem> {
    // 1. Obtenir la presigned URL
    const { uploadUrl, key } = await libraryService.requestUploadUrl(file);

    // 2. Uploader le fichier directement vers R2
    await libraryService.uploadToR2(uploadUrl, file, onProgress);

    // 3. Confirmer l'upload et créer l'entrée en base
    const item = await libraryService.confirmUpload({
      key,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      folderId: folderId || null,
    });

    return item;
  },

};
