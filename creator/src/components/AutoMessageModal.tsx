import { useState } from 'react';
import { X, Zap, Clock, Image as ImageIcon } from 'lucide-react';

const TRIGGERS = [
  'Nouveau message (hors ligne)',
  'Nouveau abonné',
  'Anniversaire 1 mois',
  'Inactivité 7 jours',
  'Après un tip',
];

const DELAYS = [
  { value: 0,    label: 'Immédiat' },
  { value: 5,    label: '5 min' },
  { value: 60,   label: '1h' },
  { value: 1440, label: '24h' },
];

interface AutoMsg {
  trigger: string;
  text: string;
  delay: number;
  active: boolean;
  hasMedia: boolean;
}

interface AutoMessageModalProps {
  initial?: Partial<AutoMsg>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (msg: AutoMsg) => void;
}

export function AutoMessageModal({ initial, isOpen, onClose, onSave }: AutoMessageModalProps) {
  const [trigger, setTrigger] = useState(initial?.trigger ?? TRIGGERS[0]);
  const [text, setText] = useState(initial?.text ?? '');
  const [delay, setDelay] = useState(initial?.delay ?? 0);
  const [active, setActive] = useState(initial?.active ?? true);
  const [hasMedia, setHasMedia] = useState(initial?.hasMedia ?? false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ trigger, text, delay, active, hasMedia });
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
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                <Zap size={16} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">
                {initial ? 'Modifier le message auto' : 'Nouveau message automatique'}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* Déclencheur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Déclencheur</label>
              <select
                value={trigger}
                onChange={e => setTrigger(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none"
              >
                {TRIGGERS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Message */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <span className="text-xs text-gray-400">{text.length}/500</span>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Ex: Bienvenue ! 🌸 Tu as accès à ma galerie privée..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            {/* Délai + Média */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={13} className="inline mr-1" />Délai
                </label>
                <select
                  value={delay}
                  onChange={e => setDelay(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none"
                >
                  {DELAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon size={13} className="inline mr-1" />Média joint
                </label>
                <button
                  onClick={() => setHasMedia(!hasMedia)}
                  className={`w-full py-3 rounded-xl border text-sm font-medium transition-all ${
                    hasMedia
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-300'
                  }`}
                >
                  {hasMedia ? '✅ Sélectionné' : 'Choisir un média'}
                </button>
              </div>
            </div>

            {/* Actif */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Activer ce message</p>
                <p className="text-xs text-gray-500 mt-0.5">Envoyé automatiquement dès le déclencheur</p>
              </div>
              <button
                onClick={() => setActive(!active)}
                className={`relative w-12 h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
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
