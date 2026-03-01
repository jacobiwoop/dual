import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Conversation } from '@/data/mockData';

type Filter = 'all' | 'unread' | 'plus' | 'normal' | 'vip';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',    label: 'Tous' },
  { id: 'unread', label: 'Non lus' },
  { id: 'plus',   label: '💎 Plus' },
  { id: 'normal', label: 'Normal' },
  { id: 'vip',    label: '⭐ VIP' },
];

interface SidebarRightProps {
  activeTab: string;
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function SidebarRight({ activeTab, conversations, selectedConversationId, onSelectConversation }: SidebarRightProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  if (activeTab !== 'messages') return null;

  const filtered = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = search === '' ||
        conv.user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        conv.user.username.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === 'all'    ? true :
        filter === 'unread' ? conv.unreadCount > 0 :
        filter === 'plus'   ? conv.user.subscriptionTier === 'Plus' :
        filter === 'normal' ? conv.user.subscriptionTier === 'Normal' :
        filter === 'vip'    ? conv.user.subscriptionTier === 'VIP' :
        true;

      return matchesSearch && matchesFilter;
    });
  }, [conversations, filter, search]);

  return (
    <div className="hidden md:flex md:flex-col w-[280px] h-screen bg-white border-l border-gray-100 fixed right-0 top-0 z-40 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
          {filtered.length !== conversations.length && (
            <span className="text-xs text-purple-600 font-semibold">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
          )}
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
              {f.id === 'unread' && conversations.filter(c => c.unreadCount > 0).length > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-[9px]">
                  {conversations.filter(c => c.unreadCount > 0).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucune conversation
          </div>
        ) : (
          filtered.map(conv => {
            const isSelected = selectedConversationId === conv.userId;
            return (
              <button
                key={conv.userId}
                onClick={() => onSelectConversation(conv.userId)}
                className={cn(
                  "w-full p-3 rounded-xl flex items-start gap-3 transition-all duration-200 group relative",
                  isSelected
                    ? "bg-purple-50 border border-purple-100 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <img src={conv.user.avatar} alt={conv.user.username} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                  {conv.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className={cn("font-semibold text-sm truncate", isSelected ? "text-purple-900" : "text-gray-900")}>
                        {conv.user.displayName}
                      </span>
                      {conv.user.subscriptionTier === 'Plus' && <span className="text-[9px] text-purple-500 flex-shrink-0">💎</span>}
                      {conv.user.subscriptionTier === 'VIP'  && <span className="text-[9px] text-amber-500 flex-shrink-0">⭐</span>}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                      {formatDistanceToNow(conv.lastMessage.timestamp, { addSuffix: false, locale: fr })}
                    </span>
                  </div>
                  <p className={cn("text-xs truncate leading-relaxed", conv.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500")}>
                    {conv.lastMessage.senderId === 'me' && <span className="text-purple-500 mr-1">Vous:</span>}
                    {conv.lastMessage.text}
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
}
