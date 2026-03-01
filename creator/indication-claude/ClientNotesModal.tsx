import { useState, useEffect } from 'react';
import { X, Save, StickyNote } from 'lucide-react';
import { User } from '@/data/mockData';

interface ClientNotesModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  initialNotes: string;
  onSave: (userId: string, notes: string) => void;
}

export function ClientNotesModal({ user, isOpen, onClose, initialNotes, onSave }: ClientNotesModalProps) {
  const [notes, setNotes] = useState(initialNotes);

  // Reset quand on change de client ou qu'on ouvre le modal
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, user?.id]);

  if (!user || !isOpen) return null;

  const handleSave = () => {
    onSave(user.id, notes);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
                <StickyNote size={16} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Notes privées</h3>
                <p className="text-xs text-gray-500">@{user.username} — jamais visible par le client</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={`Notes sur ${user.displayName}...\n\nEx: aime les vidéos perso, appeler par prénom, anniversaire 12/03...`}
              rows={7}
              className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all resize-none leading-relaxed"
              autoFocus
            />
            <p className="text-right text-xs text-gray-400 mt-1">{notes.length} caractères</p>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20">
              <Save size={16} /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
