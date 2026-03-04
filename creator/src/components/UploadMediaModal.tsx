import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Video, Check, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { mediaService } from '@/services/media';

type Visibility = 'free' | 'paid' | 'subscribers';

interface FileItem {
  file: File;
  preview: string;
  visibility: Visibility;
  price: number;
  description: string;
  status: 'idle' | 'uploading' | 'done' | 'error';
}

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId?: string; // Optional – if set, media gets linked to this gallery
  onUploaded?: () => void; // Callback to refresh parent after upload
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; color: string }[] = [
  { value: 'free',        label: 'Gratuit',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'paid',        label: 'Payant 🪙', color: 'bg-amber-100  text-amber-700  border-amber-200'  },
  { value: 'subscribers', label: 'Abonnés',   color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function UploadMediaModal({ isOpen, onClose, galleryId, onUploaded }: UploadMediaModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newItems: FileItem[] = accepted.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      visibility: 'free',
      price: 200,
      description: '',
      status: 'idle',
    }));
    setFiles(prev => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 500 * 1024 * 1024,
  });

  const remove = (i: number) => {
    URL.revokeObjectURL(files[i].preview);
    setFiles(f => f.filter((_, idx) => idx !== i));
  };

  const update = <K extends keyof FileItem>(i: number, key: K, val: FileItem[K]) => {
    setFiles(f => f.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  };

  const handleClose = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setUploaded(false);
    setIsUploading(false);
    onClose();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const fileType = item.file.type.startsWith('video/') ? 'video' : 'image';

        // Mark as uploading
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

        try {
          // 1. Get presigned URL + key from backend (library route for now — works for both)
          const { uploadUrl, key } = await mediaService.requestUploadUrl(
            item.file.name,
            item.file.type,
            item.file.size,
            fileType
          );

          // 2. Upload file directly to R2
          await mediaService.uploadToR2(uploadUrl, item.file);

          // 3. Confirm upload (create MediaItem in DB) - uses confirm-upload route
          const body: any = {
            key,
            filename: item.file.name,
            contentType: item.file.type,
            size: item.file.size,
            type: fileType,
          };
          if (galleryId) body.galleryId = galleryId;
          
          // Confirm via the existing confirm-upload endpoint
          const { default: axios } = await import('axios');
          const token = localStorage.getItem('creator_token');
          await axios.post('http://localhost:3001/api/creator/media/confirm', body, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
        } catch (err) {
          console.error(`Upload failed for ${item.file.name}:`, err);
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
        }
      }

      setUploaded(true);
      onUploaded?.();
      setTimeout(handleClose, 1500);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Uploader des médias" maxWidth="max-w-2xl">
      {uploaded ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} className="text-emerald-500" />
          </div>
          <p className="font-bold text-gray-900">Upload réussi !</p>
          <p className="text-sm text-gray-500">{files.length} fichier{files.length > 1 ? 's' : ''} uploadé{files.length > 1 ? 's' : ''}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {galleryId && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-xs font-medium text-purple-700">📁 Upload vers la galerie sélectionnée</span>
            </div>
          )}

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-purple-100' : 'bg-white shadow-sm'}`}>
              <Upload size={26} className={isDragActive ? 'text-purple-600' : 'text-gray-400'} />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {isDragActive ? 'Déposez ici !' : 'Glissez vos fichiers ici'}
            </p>
            <p className="text-xs text-gray-400 mt-1">ou <span className="text-purple-600 font-medium underline">parcourir</span> · Images & vidéos · max 500 Mo/fichier</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">{files.length} fichier{files.length > 1 ? 's' : ''}</h4>
                <button onClick={() => { files.forEach(f => URL.revokeObjectURL(f.preview)); setFiles([]); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">Tout supprimer</button>
              </div>

              {files.map((item, i) => {
                const isVideo = item.file.type.startsWith('video/');
                return (
                  <div key={i} className={`bg-gray-50 border rounded-2xl p-3 space-y-3 transition-colors ${item.status === 'done' ? 'border-emerald-200 bg-emerald-50' : item.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-200 border border-gray-200">
                        {isVideo
                          ? <div className="w-full h-full flex items-center justify-center bg-gray-800"><Video size={22} className="text-white/70" /></div>
                          : <img src={item.preview} alt="" className="w-full h-full object-cover" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatSize(item.file.size)} · {isVideo ? 'Vidéo' : 'Image'}</p>
                      </div>
                      {item.status === 'uploading' && <Loader2 size={18} className="text-purple-500 animate-spin shrink-0" />}
                      {item.status === 'done' && <Check size={18} className="text-emerald-500 shrink-0" />}
                      {item.status === 'idle' && (
                        <button onClick={() => remove(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {item.status === 'idle' && (
                      <>
                        <div className="flex gap-2 flex-wrap">
                          {VISIBILITY_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => update(i, 'visibility', opt.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                item.visibility === opt.value ? opt.color : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {item.visibility === 'paid' && (
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-gray-600 shrink-0">Prix :</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number" min={10}
                                value={item.price}
                                onChange={e => update(i, 'price', Number(e.target.value))}
                                className="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                              />
                              <span className="text-sm">🪙</span>
                            </div>
                          </div>
                        )}

                        <input
                          type="text"
                          value={item.description}
                          onChange={e => update(i, 'description', e.target.value)}
                          placeholder="Description optionnelle..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleClose} disabled={isUploading} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading ? <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</> : <><Upload size={18} /> Uploader {files.length > 0 ? `(${files.length})` : ''}</>}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
