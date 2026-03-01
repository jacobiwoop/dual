import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Video, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

type Visibility = 'free' | 'paid' | 'subscribers';

interface FileItem {
  file: File;
  preview: string;
  visibility: Visibility;
  price: number;
  description: string;
}

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (files: FileItem[]) => void;
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

export function UploadMediaModal({ isOpen, onClose, onUpload }: UploadMediaModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newItems: FileItem[] = accepted.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      visibility: 'free',
      price: 200,
      description: '',
    }));
    setFiles(prev => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 500 * 1024 * 1024, // 500 MB
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
    onClose();
  };

  const handleUpload = () => {
    onUpload?.(files);
    setUploaded(true);
    setTimeout(handleClose, 1200);
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
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-3">
                    {/* Row 1 : preview + nom + suppr */}
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
                      <button onClick={() => remove(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <X size={16} />
                      </button>
                    </div>

                    {/* Row 2 : visibilité */}
                    <div className="flex gap-2 flex-wrap">
                      {VISIBILITY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => update(i, 'visibility', opt.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            item.visibility === opt.value
                              ? opt.color
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Row 3 : prix si payant */}
                    {item.visibility === 'paid' && (
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-600 shrink-0">Prix :</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={10}
                            value={item.price}
                            onChange={e => update(i, 'price', Number(e.target.value))}
                            className="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          />
                          <span className="text-sm">🪙</span>
                        </div>
                      </div>
                    )}

                    {/* Row 4 : description (hors galerie) */}
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => update(i, 'description', e.target.value)}
                      placeholder="Description optionnelle..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              Uploader {files.length > 0 ? `(${files.length})` : ''}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
