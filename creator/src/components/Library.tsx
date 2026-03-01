import { useState, useCallback } from 'react';
import { Upload, Film, Image as ImageIcon, FolderOpen, Plus, Trash2, X, Check } from 'lucide-react';
import { LIBRARY_ITEMS, LIBRARY_FOLDERS, LibraryItem, LibraryFolder } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

type LibTab = 'all' | 'folders';

interface LocalFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: 'image' | 'video';
  folderId?: string;
  isLocal: true;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function Library() {
  const [tab, setTab]                       = useState<LibTab>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [localFiles, setLocalFiles]         = useState<LocalFile[]>([]);
  const [uploading, setUploading]           = useState(false);
  const [justUploaded, setJustUploaded]     = useState<Set<string>>(new Set());

  const selectedFolder = LIBRARY_FOLDERS.find(f => f.id === selectedFolderId);

  // Combine mock + local files
  const allItems: (LibraryItem | LocalFile)[] = [
    ...localFiles,
    ...LIBRARY_ITEMS,
  ];

  const mediaToShow = selectedFolder
    ? allItems.filter(m => m.folderId === selectedFolder.id)
    : allItems;

  const onDrop = useCallback((accepted: File[]) => {
    setUploading(true);
    const newFiles: LocalFile[] = accepted.map((f, i) => ({
      id: `local-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      type: f.type.startsWith('video/') ? 'video' : 'image',
      folderId: selectedFolderId ?? undefined,
      isLocal: true,
    }));

    // Simulate brief upload delay
    setTimeout(() => {
      setLocalFiles(prev => [...newFiles, ...prev]);
      setJustUploaded(new Set(newFiles.map(f => f.id)));
      setUploading(false);
      // Clear "new" badge after 2s
      setTimeout(() => setJustUploaded(new Set()), 2000);
    }, 600);
  }, [selectedFolderId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'video/*': [] },
    onDrop,
  });

  const removeLocal = (id: string) => {
    const file = localFiles.find(f => f.id === id);
    if (file) URL.revokeObjectURL(file.url);
    setLocalFiles(prev => prev.filter(f => f.id !== id));
  };

  const totalCount = mediaToShow.length;
  const localCount = localFiles.filter(f =>
    selectedFolder ? f.folderId === selectedFolder.id : true
  ).length;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCount} fichier{totalCount !== 1 ? 's' : ''}
            {localCount > 0 && (
              <span className="ml-2 text-purple-600 font-semibold">· {localCount} ajouté{localCount > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <div {...getRootProps()} onClick={e => e.stopPropagation()}>
          <input {...getInputProps()} />
          <label
            {...getRootProps()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 cursor-pointer"
          >
            <Plus size={16} /> Ajouter
          </label>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-2 mb-5">
        {([
          { id: 'all' as LibTab, label: 'Médias', icon: ImageIcon },
          { id: 'folders' as LibTab, label: 'Galerie', icon: FolderOpen },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelectedFolderId(null); }}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === t.id
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Breadcrumb dossier ── */}
      {selectedFolder && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSelectedFolderId(null)}
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            Galerie
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-sm font-bold text-gray-900">{selectedFolder.title}</span>
        </div>
      )}

      {/* ── Dropzone ── */}
      {(tab === 'all' || selectedFolder) && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-5 mb-5 text-center transition-all cursor-pointer',
            isDragActive
              ? 'border-purple-400 bg-purple-50 scale-[1.01]'
              : uploading
              ? 'border-purple-300 bg-purple-50/50'
              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 bg-gray-50/50'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-3 text-purple-600">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Import en cours…</span>
            </div>
          ) : (
            <>
              <Upload size={22} className={cn('mx-auto mb-2', isDragActive ? 'text-purple-500' : 'text-gray-400')} />
              <p className="text-sm text-gray-600 font-medium">
                {isDragActive ? 'Dépose ici !' : 'Glisse des photos/vidéos ou clique pour importer'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Images & vidéos · illimité</p>
            </>
          )}
        </div>
      )}

      {/* ── Grille Médias ── */}
      {(tab === 'all' || selectedFolder) && (
        <>
          {mediaToShow.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun média — glisse des fichiers ci-dessus</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {mediaToShow.map((item) => {
                const isNew = 'isLocal' in item && justUploaded.has(item.id);
                const isLocal = 'isLocal' in item;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'relative aspect-square rounded-xl overflow-hidden group border-2 transition-all',
                      isNew
                        ? 'border-purple-400 shadow-md shadow-purple-200'
                        : 'border-gray-100 hover:border-gray-300'
                    )}
                  >
                    <img src={item.url} alt="" className="w-full h-full object-cover" />

                    {/* "Nouveau" badge */}
                    {isNew && (
                      <div className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={8} /> Ajouté
                      </div>
                    )}

                    {/* Vidéo badge */}
                    {item.type === 'video' && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md p-1">
                        <Film size={10} className="text-white" />
                      </div>
                    )}

                    {/* Local file info + delete on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col justify-between p-1.5 opacity-0 group-hover:opacity-100">
                      {isLocal && (
                        <p className="text-white text-[9px] font-medium bg-black/40 rounded px-1 py-0.5 truncate">
                          {'name' in item ? item.name : ''}
                        </p>
                      )}
                      <div className="flex justify-end mt-auto">
                        {isLocal ? (
                          <button
                            onClick={() => removeLocal(item.id)}
                            className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        ) : (
                          <button className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Galerie dossiers ── */}
      {tab === 'folders' && !selectedFolder && (
        <>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
            {LIBRARY_FOLDERS.length} dossier{LIBRARY_FOLDERS.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {LIBRARY_FOLDERS.map(folder => {
              const count = allItems.filter(m => m.folderId === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => { setSelectedFolderId(folder.id); setTab('all'); }}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] group border border-gray-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
                >
                  <img
                    src={folder.coverUrl}
                    alt={folder.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <p className="font-bold text-white text-sm truncate">{folder.title}</p>
                    <p className="text-white/70 text-xs mt-0.5">{count} média{count !== 1 ? 's' : ''}</p>
                  </div>
                </button>
              );
            })}

            {/* Bouton créer dossier */}
            <button className="relative rounded-2xl aspect-[4/3] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/30 transition-all gap-2">
              <Plus size={24} />
              <span className="text-xs font-semibold">Nouveau dossier</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}