import { useState, useRef } from 'react';
import { X, Upload, Lock, ChevronLeft, Image as ImageIcon, Film, Check } from 'lucide-react';
import { LIBRARY_ITEMS, LIBRARY_FOLDERS } from '@/data/mockData';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'folders';

interface SelectedMedia {
  url: string;
  type: 'image' | 'video';
  isPaid: boolean;
  price: number;
}

interface MessageMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (media: SelectedMedia) => void;
}

export function MessageMediaModal({ isOpen, onClose, onSend }: MessageMediaModalProps) {
  const [tab, setTab]                           = useState<Tab>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selected, setSelected]                 = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isPaid, setIsPaid]                     = useState(false);
  const [price, setPrice]                       = useState(200);
  const uploadRef                               = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const selectedFolder = LIBRARY_FOLDERS.find(g => g.id === selectedFolderId) ?? null;

  // Médias à afficher
  const mediaToShow = tab === 'all'
    ? LIBRARY_ITEMS
    : selectedFolder
      ? LIBRARY_ITEMS.filter(m => m.folderId === selectedFolder.id)
      : null; // null = liste des dossiers

  // Navigation dossier — clean, sans `as any`
  const openFolder  = (id: string) => { setSelectedFolderId(id); setSelected(null); };
  const closeFolder = ()           => { setSelectedFolderId(null); setSelected(null); };

  const handleSend = () => {
    if (!selected) return;
    onSend({ ...selected, isPaid, price: isPaid ? price : 0 });
    handleClose();
  };

  const handleClose = () => {
    setSelected(null);
    setIsPaid(false);
    setSelectedFolderId(null);
    setTab('all');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4 max-h-[90vh] flex flex-col">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* ── Header ── */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {selectedFolder && (
                <button
                  onClick={closeFolder}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <h3 className="font-bold text-gray-900">
                {selectedFolder ? selectedFolder.title : 'Choisir un média'}
              </h3>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* ── Controls bar ── */}
          <div className="flex items-center gap-2 px-4 pt-4 flex-shrink-0">
            {/* Onglets — cachés si on est dans un dossier */}
            {!selectedFolder && (
              <div className="flex gap-1">
                {([
                  { id: 'all'     as Tab, label: 'Médias' },
                  { id: 'folders' as Tab, label: 'Galerie' },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setSelected(null); }}
                    className={cn(
                      'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                      tab === t.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Bouton import — visible dans "Médias" ou dans un dossier, PAS sur la liste des galeries */}
            {(tab === 'all' || selectedFolder) && (
              <button
                onClick={() => uploadRef.current?.click()}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold transition-colors border border-purple-200"
              >
                <Upload size={14} /> Importer
              </button>
            )}
            <input ref={uploadRef} type="file" accept="image/*,video/*" multiple className="hidden" />
          </div>

          {/* ── Grille médias ── */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* Onglet MÉDIAS ou contenu d'un dossier */}
            {mediaToShow !== null && (
              mediaToShow.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun média</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {mediaToShow.map(item => {
                    const isSelected = selected?.url === item.url;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelected(isSelected ? null : { url: item.url, type: item.type })}
                        className={cn(
                          'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                          isSelected
                            ? 'border-purple-500 ring-2 ring-purple-300'
                            : 'border-transparent hover:border-gray-300'
                        )}
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover" />

                        {item.type === 'video' && (
                          <div className="absolute bottom-1 left-1 bg-black/60 rounded-md px-1.5 py-0.5">
                            <Film size={10} className="text-white" />
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                            <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <Check size={14} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {/* Onglet GALERIE — liste des dossiers */}
            {tab === 'folders' && !selectedFolder && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LIBRARY_FOLDERS.map(folder => {
                  const count = LIBRARY_ITEMS.filter(m => m.folderId === folder.id).length;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => openFolder(folder.id)}
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
                        <p className="text-white/70 text-xs">{count} média{count !== 1 ? 's' : ''}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer — visible uniquement si un média est sélectionné ── */}
          {selected && (
            <div className="border-t border-gray-100 p-4 flex-shrink-0 bg-gray-50/60 space-y-3">
              <div className="flex items-center gap-4">
                {/* Miniature */}
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={selected.url} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  {/* Toggle payant */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className={isPaid ? 'text-amber-500' : 'text-gray-400'} />
                      <span className={cn('text-sm font-semibold', isPaid ? 'text-amber-700' : 'text-gray-600')}>
                        Envoi payant
                      </span>
                    </div>
                    <button
                      onClick={() => setIsPaid(v => !v)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                        isPaid ? 'bg-amber-500' : 'bg-gray-200'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        isPaid ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>

                  {/* Prix si payant */}
                  {isPaid && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Prix :</span>
                      <input
                        type="number"
                        value={price}
                        min={1}
                        onChange={e => setPrice(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-3 py-1.5 text-sm border border-amber-200 rounded-lg bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400/30 font-semibold text-amber-800"
                      />
                      <span className="text-xs text-gray-500">🪙</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSend}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                  isPaid
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20'
                )}
              >
                {isPaid
                  ? <><Lock size={15} /> Envoyer ({price}🪙)</>
                  : 'Envoyer le média'
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}