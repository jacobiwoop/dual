import { X, Crown, ShoppingBag, Gift, MessageSquare, Clock } from 'lucide-react';
import { User } from '@/data/mockData';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientInfoDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock purchase history per user
const PURCHASE_HISTORY: Record<string, { label: string; amount: number; date: Date }[]> = {
  u1: [
    { label: '🔥 Pack Intense',  amount: 800, date: new Date(Date.now() - 30 * 86400000) },
    { label: 'Tip 200🪙',       amount: 200, date: new Date(Date.now() - 14 * 86400000) },
    { label: 'Tip 100🪙',       amount: 100, date: new Date(Date.now() - 7  * 86400000) },
    { label: '🎭 Pack Cosplay', amount: 500, date: new Date(Date.now() - 2  * 86400000) },
  ],
  u2: [
    { label: '📸 Photos perso', amount: 300, date: new Date(Date.now() - 20 * 86400000) },
    { label: 'Tip 50🪙',        amount: 50,  date: new Date(Date.now() - 5  * 86400000) },
  ],
  u3: [
    { label: '👑 Galerie Abonnés', amount: 0,    date: new Date(Date.now() - 100 * 86400000) },
    { label: 'Tip 500🪙',         amount: 500,  date: new Date(Date.now() - 60  * 86400000) },
    { label: '🔥 Pack Intense',   amount: 800,  date: new Date(Date.now() - 30  * 86400000) },
    { label: '🎭 Pack Cosplay',   amount: 500,  date: new Date(Date.now() - 10  * 86400000) },
    { label: 'Tip 200🪙',         amount: 200,  date: new Date(Date.now() - 3   * 86400000) },
    { label: '📸 Photos pieds',   amount: 500,  date: new Date(Date.now() - 1   * 86400000) },
  ],
};

const TIER_STYLES: Record<string, string> = {
  Free:   'bg-gray-100 text-gray-600 border-gray-200',
  Normal: 'bg-blue-50 text-blue-700 border-blue-200',
  Plus:   'bg-purple-50 text-purple-700 border-purple-200',
  VIP:    'bg-amber-50 text-amber-700 border-amber-200',
};

export function ClientInfoDrawer({ user, isOpen, onClose }: ClientInfoDrawerProps) {
  if (!user) return null;

  const purchases = PURCHASE_HISTORY[user.id] ?? [];
  const tips = purchases.filter(p => p.label.startsWith('Tip'));
  const totalTipAmount = tips.reduce((sum, t) => sum + t.amount, 0);
  const packs = purchases.filter(p => !p.label.startsWith('Tip'));

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[360px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.avatar} alt={user.displayName} className="w-12 h-12 rounded-full object-cover shadow-sm" />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{user.displayName}</h2>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border mt-0.5 ${TIER_STYLES[user.subscriptionTier] ?? TIER_STYLES.Free}`}>
                {user.subscriptionTier === 'VIP' && '⭐ '}{user.subscriptionTier === 'Plus' && '💎 '}
                {user.subscriptionTier}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
          {[
            { label: 'Total dépensé', value: `${user.totalSpent.toLocaleString('fr-FR')}🪙`, icon: Crown },
            { label: 'Abonné depuis', value: formatDistanceToNow(user.joinDate, { locale: fr }), icon: Clock },
            { label: 'Tips envoyés',  value: `${tips.length} (${totalTipAmount}🪙)`,         icon: Gift },
            { label: 'Messages',      value: '–',                                               icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white px-5 py-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Icon size={13} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
              </div>
              <p className="font-bold text-gray-900 text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Packs achetés */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <ShoppingBag size={12} /> Packs achetés
            </h3>
          </div>
          <div className="px-4 pb-2 space-y-1">
            {packs.length === 0 ? (
              <p className="text-sm text-gray-400 px-2 py-3">Aucun pack acheté.</p>
            ) : (
              packs.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700 font-medium">{p.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{p.amount}🪙</p>
                    <p className="text-[10px] text-gray-400">{format(p.date, 'd MMM', { locale: fr })}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-6 pt-4 pb-2 border-t border-gray-50 mt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Gift size={12} /> Tips
            </h3>
          </div>
          <div className="px-4 pb-4 space-y-1">
            {tips.length === 0 ? (
              <p className="text-sm text-gray-400 px-2 py-3">Aucun tip envoyé.</p>
            ) : (
              tips.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-amber-600 font-medium">{t.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{t.amount}🪙</p>
                    <p className="text-[10px] text-gray-400">{format(t.date, 'd MMM', { locale: fr })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer : dernière activité */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-400">
            Dernière activité : <span className="font-semibold text-gray-600">{formatDistanceToNow(user.lastActive, { locale: fr, addSuffix: true })}</span>
          </p>
        </div>
      </div>
    </>
  );
}
