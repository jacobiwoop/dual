import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
type Filter = 'all' | 'unread' | 'plus' | 'normal' | 'vip';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',    label: 'Tous' },
  { id: 'unread', label: 'Non lus' },
  { id: 'plus',   label: '💎 Plus' },
  { id: 'normal', label: 'Normal' },
  { id: 'vip',    label: '⭐ VIP' },
];

interface RealConversation {
  id: string;
  clientId: string;
  isOnline: boolean;
  client: { id: string; username: string; displayName: string; avatarUrl: string | null; } | null;
  lastMessage?: { content: string; createdAt: string; senderId: string; isRead: boolean; } | null;
  unreadCount: number;
  updatedAt: string;
}

interface SidebarRightProps {
  activeTab: string;
  realConversations: RealConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  // Mobile overlay
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SidebarRight({
  activeTab,
  realConversations,
  selectedConversationId,
  onSelectConversation,
  isMobileOpen = false,
  onMobileClose,
}: SidebarRightProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  // ⚠️ Hooks MUST be called before any early return
  const filtered = useMemo(() => {
    return realConversations.filter(conv => {
      // 1. Appliquer le filtre de recherche (texte)
      const matchesSearch = !conv.client || search === '' ||
        conv.client.displayName.toLowerCase().includes(search.toLowerCase()) ||
        conv.client.username.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Appliquer les filtres spécifiques
      const tier = (conv.client as any)?.subscriptionTier || 'Normal'; // Fallback pour l'instant

      switch (filter) {
        case 'unread': return conv.unreadCount > 0;
        case 'plus':   return tier === 'Plus';
        case 'normal': return tier === 'Normal';
        case 'vip':    return tier === 'VIP';
        case 'all':
        default:       return true;
      }
    });
  }, [realConversations, filter, search]);

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onMobileClose?.();
  };

  const panelContent = (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
          <div className="flex items-center gap-2">
            {filtered.length !== realConversations.length && (
              <span className="text-xs text-purple-600 font-semibold">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
            )}
            {/* Close button (mobile) */}
            {onMobileClose && (
              <button onClick={onMobileClose} className="md:hidden p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                filter === f.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucune conversation
          </div>
        ) : (
          filtered.map(conv => {
            const isSelected = selectedConversationId === conv.id;
            const displayName = conv.client?.displayName || conv.client?.username || 'Client';
            const avatarUrl = conv.client?.avatarUrl;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={cn(
                  "w-full p-3 rounded-xl flex items-start gap-3 transition-all duration-200 group relative",
                  isSelected
                    ? "bg-purple-50 border border-purple-100 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <img src={avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=7c3aed&color=fff`} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                  <span className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full shadow-sm",
                    conv.isOnline ? "bg-lime-500" : "bg-gray-400"
                  )} />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={cn("font-semibold text-sm truncate", isSelected ? "text-purple-900" : "text-gray-900")}>
                      {displayName}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false, locale: fr })}
                      </span>
                    )}
                  </div>
                  <p className={cn("text-xs truncate leading-relaxed", conv.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500")}>
                    {conv.lastMessage ? conv.lastMessage.content : 'Nouvelle conversation'}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-md">
                    {conv.unreadCount}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  if (activeTab !== 'messages') return null;

  return (
    <>
      {/* Desktop: always fixed */}
      <div className="hidden md:block fixed right-0 top-0 h-screen w-[280px] z-40">
        {panelContent}
      </div>

      {/* Mobile: overlay from right */}
      <>
        <div
          className={cn(
            "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
            isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={onMobileClose}
        />
        <div
          className={cn(
            "md:hidden fixed right-0 top-0 h-full w-[280px] z-50 transition-transform duration-300 ease-in-out",
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {panelContent}
        </div>
      </>
    </>
  );
}
