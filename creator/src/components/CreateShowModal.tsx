import { useState } from 'react';
import { X, Zap } from 'lucide-react';

const AVAILABILITY = [
  { value: 'always',    label: '✅ Toujours disponible' },
  { value: 'ondemand',  label: '📅 Sur demande' },
  { value: 'disabled',  label: '❌ Désactivé' },
];

const EMOJIS = ['🔥','📞','📸','🎁','💋','🎭','👠','🛁','🎬','💎'];

interface ShowType {
  emoji: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  availability: string;
}

interface CreateShowModalProps {
  initial?: Partial<ShowType>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (show: ShowType) => void;
}

export function CreateShowModal({ initial, isOpen, onClose, onSave }: CreateShowModalProps) {
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🔥');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? 500);
  const [duration, setDuration] = useState(initial?.duration ?? '30 min');
  const [availability, setAvailability] = useState(initial?.availability ?? 'always');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ emoji, title, description, price, duration, availability });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 text-xl">
                {emoji}
              </div>
              <h3 className="font-bold text-gray-900">
                {initial ? 'Modifier le type de show' : 'Nouveau type de demande'}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">

            {/* Emoji picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-gray-900 shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Scène hot, Appel privé..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (visible par les clients)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Ce que tu feras..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            {/* Prix + Durée */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (🪙)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée estimée</label>
                <input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="Ex: 30 min"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Disponibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Disponibilité</label>
              <div className="space-y-2">
                {AVAILABILITY.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${availability === opt.value ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="avail"
                      value={opt.value}
                      checked={availability === opt.value}
                      onChange={() => setAvailability(opt.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
