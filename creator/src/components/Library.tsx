import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Upload, Film, Image as ImageIcon, FolderOpen, Plus, Trash2,
  X, Check, Loader2, AlertCircle, MoreVertical, Pencil, FolderInput, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { libraryService, LibraryItem, LibraryFolder } from '@/services/library';

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  done: boolean;
  error?: string;
}

interface NewFolderModalProps {
  onClose: () => void;
  onCreated: (folder: LibraryFolder) => void;
}

function NewFolderModal({ onClose, onCreated }: NewFolderModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) { setError('Le titre est requis'); return; }
    setLoading(true);
    try {
      const folder = await libraryService.createFolder(title.trim());
      onCreated(folder);
    } catch {
      setError('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Nouveau dossier</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X size={16} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="Nom du dossier"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 mb-3"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

interface MoveModalProps {
  item: LibraryItem;
  folders: LibraryFolder[];
  onClose: () => void;
  onMoved: (item: LibraryItem) => void;
}

function MoveModal({ item, folders, onClose, onMoved }: MoveModalProps) {
  const [loading, setLoading] = useState(false);

  const handleMove = async (folderId: string | null) => {
    setLoading(true);
    try {
      const updated = await libraryService.moveItem(item.id, folderId);
      onMoved(updated);
    } catch {
      // ignore error
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Déplacer vers...</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => handleMove(null)}
            disabled={loading}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
          >
            <ImageIcon size={16} className="text-gray-400" />
            Aucun dossier (racine)
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => handleMove(f.id)}
              disabled={loading || f.id === item.folderId}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                f.id === item.folderId
                  ? 'bg-purple-50 text-purple-700 font-semibold cursor-default'
                  : 'hover:bg-gray-50 text-gray-700'
              )}
            >
              <FolderOpen size={16} className="text-gray-400" />
              {f.title}
              {f.id === item.folderId && <Check size={14} className="ml-auto text-purple-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Media Viewer Modal ───────────────────────────────────────────────────────

interface MediaViewerModalProps {
  items: LibraryItem[];
  initialIndex: number;
  onClose: () => void;
  onMoveRequest: (item: LibraryItem) => void;
  onDeleteRequest: (item: LibraryItem) => void;
  onIndexChange: (index: number) => void;
}

function MediaViewerModal({ items, initialIndex, onClose, onMoveRequest, onDeleteRequest, onIndexChange }: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const item = items[currentIndex];

  useEffect(() => {
    onIndexChange(currentIndex);
  }, [currentIndex, onIndexChange]);

  // Adjust current index if items array shrinks (e.g. after deletion)
  useEffect(() => {
    if (items.length === 0) {
      onClose();
    } else if (currentIndex >= items.length) {
      setCurrentIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, currentIndex, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose]);

  if (!item) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm" onClick={onClose}>
      {/* Header bars */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent relative z-10" onClick={e => e.stopPropagation()}>
        <div className="text-white">
          <p className="font-semibold text-sm md:text-base">{item.filename || 'Fichier sans nom'}</p>
          <p className="text-xs text-white/60 mt-0.5">{formatSize(item.sizeBytes)} • {currentIndex + 1} / {items.length}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => onMoveRequest(item)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Déplacer">
            <FolderInput size={20} />
          </button>
          <button onClick={() => onDeleteRequest(item)} className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors" title="Supprimer">
            <Trash2 size={20} />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Fermer (Échap)">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden" onClick={e => e.stopPropagation()}>
        {currentIndex > 0 && (
          <button onClick={handlePrev} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-md">
            <ChevronLeft size={28} />
          </button>
        )}
        
        <div className="max-w-full max-h-full p-4 flex items-center justify-center w-full h-full relative group">
          {item.type === 'video' ? (
            <video src={item.url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg shadow-2xl h-[85vh]" />
          ) : (
             <img src={item.url} alt={item.filename || ''} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl h-[85vh]" />
          )}
        </div>

        {currentIndex < items.length - 1 && (
          <button onClick={handleNext} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-md">
            <ChevronRight size={28} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Library() {
  const [tab, setTab] = useState<'all' | 'folders'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [moveTarget, setMoveTarget] = useState<LibraryItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  const selectedFolder = folders.find(f => f.id === selectedFolderId) ?? null;

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsData, foldersData] = await Promise.all([
        libraryService.getItems({ limit: 100 }),
        libraryService.getFolders(),
      ]);
      setItems(itemsData.items);
      setFolders(foldersData);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Items to show ───────────────────────────────────────────────────────────
  const itemsToShow = selectedFolder
    ? items.filter(i => i.folderId === selectedFolder.id)
    : items.filter(i => !i.folderId);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (accepted: File[]) => {
    for (const file of accepted) {
      const uid = `${Date.now()}-${file.name}`;
      setUploadingFiles(prev => [...prev, { id: uid, name: file.name, progress: 0, done: false }]);

      try {
        const item = await libraryService.uploadFile(
          file,
          selectedFolderId,
          (pct) => setUploadingFiles(prev => prev.map(f => f.id === uid ? { ...f, progress: pct } : f))
        );
        setUploadingFiles(prev => prev.map(f => f.id === uid ? { ...f, progress: 100, done: true } : f));
        // Recharger les items depuis l'API pour avoir les URLs signées
        const refreshed = await libraryService.getItems({ limit: 100 });
        setItems(refreshed.items);
        // Remove from uploading list after 2s
        setTimeout(() => setUploadingFiles(prev => prev.filter(f => f.id !== uid)), 2000);
      } catch {
        setUploadingFiles(prev => prev.map(f => f.id === uid ? { ...f, error: 'Échec de l\'upload' } : f));
        setTimeout(() => setUploadingFiles(prev => prev.filter(f => f.id !== uid)), 4000);
      }
    }
  }, [selectedFolderId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'video/*': [] },
    onDrop,
  });

  // ── Delete item ─────────────────────────────────────────────────────────────
  const handleDelete = async (item: LibraryItem) => {
    setDeleteError(null);
    try {
      await libraryService.deleteItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Impossible de supprimer ce média';
      setDeleteError(msg);
      setTimeout(() => setDeleteError(null), 4000);
    }
    setOpenMenuId(null);
  };

  // ── Delete folder ───────────────────────────────────────────────────────────
  const handleDeleteFolder = async (folder: LibraryFolder) => {
    setDeleteError(null);
    try {
      await libraryService.deleteFolder(folder.id);
      setFolders(prev => prev.filter(f => f.id !== folder.id));
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Impossible de supprimer ce dossier';
      setDeleteError(msg);
      setTimeout(() => setDeleteError(null), 4000);
    }
  };

  // ── Move item ───────────────────────────────────────────────────────────────
  const handleMoved = (updated: LibraryItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    setMoveTarget(null);
  };

  // ── New folder created ──────────────────────────────────────────────────────
  const handleFolderCreated = (folder: LibraryFolder) => {
    setFolders(prev => [folder, ...prev]);
    setShowNewFolder(false);
  };

  const totalCount = items.length;
  const isUploading = uploadingFiles.some(f => !f.done && !f.error);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Chargement...' : `${totalCount} fichier${totalCount !== 1 ? 's' : ''} · ${folders.length} dossier${folders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <FolderOpen size={15} /> Dossier
          </button>
          <label
            {...getRootProps()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 cursor-pointer"
          >
            <input {...getInputProps()} />
            <Plus size={16} /> Ajouter
          </label>
        </div>
      </div>

      {/* ── Error toast ── */}
      {deleteError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {deleteError}
        </div>
      )}

      {/* ── Upload progress bar ── */}
      {uploadingFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadingFiles.map(f => (
            <div key={f.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-700 truncate max-w-[70%]">{f.name}</span>
                <span className="text-xs text-gray-400">
                  {f.error ? <span className="text-red-500">{f.error}</span> : f.done ? <span className="text-green-600 flex items-center gap-1"><Check size={12} /> Terminé</span> : `${f.progress}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', f.error ? 'bg-red-400' : f.done ? 'bg-green-500' : 'bg-purple-500')}
                  style={{ width: `${f.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-5">
        {([
          { id: 'all' as const, label: 'Médias', icon: ImageIcon },
          { id: 'folders' as const, label: 'Dossiers', icon: FolderOpen },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelectedFolderId(null); }}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === t.id ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* ── Breadcrumb ── */}
      {selectedFolder && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setSelectedFolderId(null)} className="text-sm text-purple-600 hover:underline font-medium">
            Médias
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-900">{selectedFolder.title}</span>
        </div>
      )}

      {/* ── Dropzone ── */}
      {(tab === 'all' || selectedFolder) && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-5 mb-5 text-center transition-all cursor-pointer',
            isDragActive ? 'border-purple-400 bg-purple-50 scale-[1.01]'
              : isUploading ? 'border-purple-300 bg-purple-50/50'
              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 bg-gray-50/50'
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex items-center justify-center gap-3 text-purple-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Import en cours…</span>
            </div>
          ) : (
            <>
              <Upload size={22} className={cn('mx-auto mb-2', isDragActive ? 'text-purple-500' : 'text-gray-400')} />
              <p className="text-sm text-gray-600 font-medium">
                {isDragActive ? 'Dépose ici !' : 'Glisse des photos/vidéos ou clique pour importer'}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, MP4, MOV…</p>
            </>
          )}
        </div>
      )}

      {/* ── Media Grid ── */}
      {(tab === 'all' || selectedFolder) && (
        loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="relative aspect-square rounded-xl bg-gray-200 animate-pulse overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200 opacity-50"></div>
              </div>
            ))}
          </div>
        ) : itemsToShow.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun média — glisse des fichiers ci-dessus</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {itemsToShow.map((item, idx) => (
              <div
                key={item.id}
                className="relative aspect-square group cursor-pointer"
                onClick={() => setViewingIndex(idx)}
              >
                {/* Inner image container (overflow-hidden for rounded corners) */}
                <div className="absolute inset-0 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-purple-300 transition-all">
                  {/* Thumbnail */}
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : item.type === 'image' ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Film size={24} className="text-gray-400" />
                    </div>
                  )}

                  {/* Hover dark overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />

                  {/* Center Video Icon for Videos with Thumbnails */}
                  {item.type === 'video' && item.thumbnailUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/30 rounded-full p-2.5 backdrop-blur-sm shadow-sm group-hover:bg-black/50 transition-colors">
                        <Film size={20} className="text-white opacity-90" />
                      </div>
                    </div>
                  )}

                  {/* Filename on hover (top) */}
                  <p className="absolute top-1.5 left-1.5 right-1.5 text-white text-[9px] font-medium bg-black/40 rounded px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-all">
                    {item.filename || 'fichier'} {item.sizeBytes ? `· ${formatSize(item.sizeBytes)}` : ''}
                  </p>

                  {/* Video badge */}
                  {item.type === 'video' && (
                    <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md p-1">
                      <Film size={10} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Menu button — OUTSIDE overflow-hidden so dropdown is not clipped */}
                <div className="absolute bottom-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
                    className="p-1.5 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-sm"
                  >
                    <MoreVertical size={11} />
                  </button>

                  {openMenuId === item.id && (
                    <div className="absolute bottom-8 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px]">
                      <button
                        onClick={() => { setMoveTarget(item); setOpenMenuId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <FolderInput size={12} /> Déplacer
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        )
      )}

      {/* ── Folders Grid ── */}
      {tab === 'folders' && !selectedFolder && (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full relative rounded-2xl aspect-[4/3] bg-gray-200 animate-pulse overflow-hidden border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200 opacity-50"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
              {folders.length} dossier{folders.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {folders.map(folder => {
                const count = items.filter(i => i.folderId === folder.id).length;
                return (
                  <div key={folder.id} className="relative group">
                    <button
                      onClick={() => { setSelectedFolderId(folder.id); setTab('all'); }}
                      className="w-full relative rounded-2xl overflow-hidden aspect-[4/3] border border-gray-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md bg-gradient-to-br from-purple-50 to-gray-100"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FolderOpen size={48} className="text-purple-200" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                        <p className="font-bold text-white text-sm truncate">{folder.title}</p>
                        <p className="text-white/70 text-xs mt-0.5">{count} média{count !== 1 ? 's' : ''}</p>
                      </div>
                    </button>

                    {/* Delete folder button */}
                    <button
                      onClick={() => handleDeleteFolder(folder)}
                      title="Supprimer le dossier"
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })}

              {/* New folder button */}
              <button
                onClick={() => setShowNewFolder(true)}
                className="relative rounded-2xl aspect-[4/3] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/30 transition-all gap-2"
              >
                <Plus size={24} />
                <span className="text-xs font-semibold">Nouveau dossier</span>
              </button>
            </div>
          </>
        )
      )}

      {/* ── Modals ── */}
      {showNewFolder && (
        <NewFolderModal onClose={() => setShowNewFolder(false)} onCreated={handleFolderCreated} />
      )}

      {moveTarget && (
        <MoveModal
          item={moveTarget}
          folders={folders}
          onClose={() => setMoveTarget(null)}
          onMoved={handleMoved}
        />
      )}

      {/* Close menu on outside click */}
      {openMenuId && (
        <div className="fixed inset-0 z-[5]" onClick={() => setOpenMenuId(null)} />
      )}

      {viewingIndex !== null && (
        <MediaViewerModal
          items={itemsToShow}
          initialIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
          onMoveRequest={(item) => setMoveTarget(item)}
          onDeleteRequest={(item) => {
             if (window.confirm('Voulez-vous vraiment supprimer ce média ?')) {
               handleDelete(item);
             }
          }}
          onIndexChange={(index) => setViewingIndex(index)}
        />
      )}
    </div>
  );
}