import { useState } from 'react';
import { X, GripVertical, ArrowUp, ArrowDown, Trash2, Plus, Lock } from 'lucide-react';
import { Gallery, MEDIA_ITEMS } from '@/data/mockData';

interface EditGalleryModalProps {
  gallery: Gallery | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (gallery: Gallery) => void;
}

export function EditGalleryModal({ gallery, isOpen, onClose, onSave }: EditGalleryModalProps) {
  const [title, setTitle] = useState(gallery?.title ?? '');
  const [description, setDescription] = useState(gallery?.description ?? '');
  const [price, setPrice] = useState(gallery?.price ?? 0);
  const [visibility, setVisibility] = useState<'paid' | 'subscribers' | 'free'>(
    gallery?.price && gallery.price > 0 ? 'paid' : 'free'
  );
  // Simule les médias de la galerie
  const [items, setItems] = useState(MEDIA_ITEMS.slice(0, 3));

  if (!gallery || !isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xl font-bold text-gray-900">Modifier la galerie</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* Infos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
              </div>

              {/* Visibilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Visibilité</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: 'paid', label: '🔒 Payante' },
                    { value: 'subscribers', label: '👑 Abonnés' },
                    { value: 'free', label: '🎁 Gratuite' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vis"
                        checked={visibility === opt.value}
                        onChange={() => setVisibility(opt.value as any)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix */}
              {visibility === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix (🪙)</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Médias dans la galerie */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Médias ({items.length})</label>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                    {/* Drag handle */}
                    <GripVertical size={16} className="text-gray-300 flex-shrink-0" />

                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">{item.type === 'video' ? '🎬 Vidéo' : '🖼️ Photo'}</p>
                      <p className="text-[10px] text-gray-400">
                        {item.price > 0 ? `${item.price}🪙` : item.visibility === 'subscribers' ? 'Abonnés' : 'Libre'}
                      </p>
                    </div>

                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === items.length - 1}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    Aucun média dans cette galerie
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              onClick={() => { onSave?.({ ...gallery!, title, description, price, items }); onClose(); }}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
