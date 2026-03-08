import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Image as ImageIcon, Ban, StickyNote, Info, ChevronLeft, ChevronRight, Play, X, Video } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClientInfoDrawer } from '@/components/ClientInfoDrawer';
import { ClientNotesModal } from '@/components/ClientNotesModal';
import { MessageMediaModal } from '@/components/MessageMediaModal';
import { useSocket } from '@/hooks/useSocket';
import { useMessages } from '@/hooks/useMessages';
import { useTyping } from '@/hooks/useTyping';

// --- SUB-COMPONENT: MediaBubble ---
// Handles loading state with a skeleton pulse, shows thumbnail only.
const MediaBubble = ({ 
  src, 
  thumbnail, 
  type, 
  onClick 
}: { 
  src: string; 
  thumbnail?: string | null; 
  type: 'image' | 'video';
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="relative w-full max-w-[240px] aspect-square bg-gray-100 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* SKELETON (Pulse effect) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-400 animate-spin opacity-20" />
        </div>
      )}

      {/* THUMBNAIL / POSTER */}
      <img
        src={thumbnail || src}
        alt="média"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* VIDEO OVERLAY (Play icon) */}
      {type === 'video' && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-purple-600">
            <Play size={20} className="fill-current ml-0.5" />
          </div>
        </div>
      )}
      
      {/* HOVER OVERLAY */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </div>
  );
};

// --- SUB-COMPONENT: ChatMediaViewer ---
// Fullscreen viewer like the Library
const ChatMediaViewer = ({ 
  media, 
  onClose 
}: { 
  media: { url: string; type: 'image' | 'video'; thumbnail?: string | null }; 
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm" 
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent relative z-10" onClick={e => e.stopPropagation()}>
        <div className="text-white">
          <p className="font-semibold text-sm">{media.type === 'video' ? '🎬 Vidéo' : '🖼️ Image'}</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
          title="Fermer (Échap)"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="max-w-full max-h-full p-4 flex items-center justify-center w-full h-full">
          {media.type === 'video' ? (
            <video 
              src={media.url} 
              poster={media.thumbnail || undefined}
              controls 
              autoPlay 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl h-[85vh]" 
            />
          ) : (
            <img 
              src={media.url} 
              alt="Média" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl h-[85vh]" 
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface RealConversation {
  id: string;
  clientId: string;
  isOnline?: boolean;
  client: { id: string; username: string; displayName: string; avatarUrl: string | null; } | null;
  lastMessage?: { content: string; createdAt: string; senderId: string; isRead: boolean; } | null;
  unreadCount: number;
  updatedAt: string;
}

interface MessagesProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  realConversations: RealConversation[];
  onOpenClientList?: () => void;
}

export function Messages({ selectedConversationId, onSelectConversation, realConversations, onOpenClientList }: MessagesProps) {
  const [messageText, setMessageText]   = useState('');
  const [isInfoOpen, setIsInfoOpen]     = useState(false);
  const [isNotesOpen, setIsNotesOpen]   = useState(false);
  const [isMediaOpen, setIsMediaOpen]   = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video'; thumbnail?: string | null } | null>(null);
  const [notes, setNotes]               = useState<Record<string, string>>({});
  const messagesEndRef                  = useRef<HTMLDivElement>(null);

  // WebSocket hooks - on utilise le vrai UUID de conversation (pas le mock userId)
  const { isConnected } = useSocket();
  const { messages: realtimeMessages, sendMessage, sending, loadMessages } = useMessages(selectedConversationId);
  const { typingUsers, isAnyoneTyping, handleTyping, stopTyping } = useTyping(selectedConversationId);

  // Swipe / slide state
  const touchStartX  = useRef<number | null>(null);
  const [dragX, setDragX]         = useState(0);
  const [slideAnim, setSlideAnim] = useState<'idle' | 'out-left' | 'out-right' | 'in-left' | 'in-right'>('idle');

  // Conversation sélectionnée
  const realConv = realConversations.find(c => c.id === selectedConversationId);
  const currentIndex = realConversations.findIndex(c => c.id === selectedConversationId);

  // Charger l'historique de la conversation si elle existe
  useEffect(() => {
    if (realConv?.clientId) {
      loadMessages(realConv.clientId);
    }
  }, [realConv?.clientId, loadMessages]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < realConversations.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onSelectConversation(realConversations[currentIndex - 1].id);
  }, [hasPrev, currentIndex, realConversations, onSelectConversation]);

  const goNext = useCallback(() => {
    if (hasNext) onSelectConversation(realConversations[currentIndex + 1].id);
  }, [hasNext, currentIndex, realConversations, onSelectConversation]);

  // Keyboard navigation — désactivé quand input/textarea actif ou modal ouvert
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isInfoOpen || isNotesOpen) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight' && !e.shiftKey) { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft' && !e.shiftKey) { e.preventDefault(); goPrev(); }
      else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); goNext(); }
      else if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, isInfoOpen, isNotesOpen]);

  // Reset modals + scroll when conversation changes
  useEffect(() => {
    setIsInfoOpen(false);
    setIsNotesOpen(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realtimeMessages, isAnyoneTyping]);

  // Swipe handlers with live translateX effect
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setDragX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    // Resistance at edges (no more client in that direction)
    if ((diff > 0 && !hasPrev) || (diff < 0 && !hasNext)) {
      setDragX(diff * 0.15); // rubber-band
    } else {
      setDragX(diff * 0.6);  // natural drag
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diff) > 70) {
      // Trigger slide animation
      const dir = diff > 0 ? 'out-left' : 'out-right';
      setSlideAnim(dir);
      setDragX(0);

      setTimeout(() => {
        if (diff > 0) goNext(); else goPrev();
        setSlideAnim(dir === 'out-left' ? 'in-right' : 'in-left');
        setTimeout(() => setSlideAnim('idle'), 220);
      }, 180);
    } else {
      // Snap back
      setDragX(0);
    }
  };

  // Extrait les infos de l'utilisateur
  const displayUser = realConv?.client ? {
    id: realConv.client.id,
    username: realConv.client.username,
    displayName: realConv.client.displayName || realConv.client.username,
    avatar: realConv.client.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(realConv.client.displayName || realConv.client.username)}&background=7c3aed&color=fff`,
    isOnline: realConv?.isOnline ?? false,
    subscriptionTier: 'Normal', // TODO: Fetch real tier
    totalSpent: 0,              // TODO: Fetch real stats
    notes: '',
    joinDate: new Date(),       // Fallback for valid time value
    lastActive: new Date()      // Fallback for valid time value
  } : null;

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400 text-sm">
        Sélectionnez une conversation
      </div>
    );
  }

  const userNotes = notes[displayUser.id] ?? displayUser.notes ?? '';

  // CSS slide classes
  const slideClass = {
    idle:       'transition-none',
    'out-left':  'transition-transform duration-[180ms] ease-in-out translate-x-[-30%]',
    'out-right': 'transition-transform duration-[180ms] ease-in-out translate-x-[30%]',
    'in-left':   'transition-none  translate-x-[20%]',
    'in-right':  'transition-none  translate-x-[-20%]',
  }[slideAnim];

  // Calcul pour l'affichage X / N
  const displayIndex = currentIndex + 1;
  const totalCount = realConversations.length;

  return (
    <div
      className="flex flex-col h-screen bg-white relative select-none md:select-auto overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding inner wrapper — follows finger live */}
      <div
        className={`flex flex-col flex-1 min-h-0 will-change-transform ${slideAnim === 'idle' && dragX !== 0 ? '' : slideClass}`}
        style={{
          transform: dragX !== 0 && slideAnim === 'idle'
            ? `translateX(${dragX}px)`
            : undefined,
          transition: dragX !== 0 && slideAnim === 'idle'
            ? 'none'
            : undefined,
          opacity: (slideAnim === 'out-left' || slideAnim === 'out-right') ? 0.4 : 1,
        }}
      >

      {/* ══════════════════════════════════════
          HEADER CLIENT
      ══════════════════════════════════════ */}
      <div className="px-4 md:px-6 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-20 space-y-2">

        {/* Ligne 1 : Avatar + Nom + Statut + Actions */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img src={displayUser.avatar} alt={displayUser.username} className="w-10 h-10 rounded-full object-cover shadow-sm" />
            {displayUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          {/* Nom + tier + statut */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">{displayUser.displayName}</h2>
              {displayUser.subscriptionTier === 'Plus' && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-200 font-bold shrink-0">💎 Plus</span>
              )}
              {displayUser.subscriptionTier === 'VIP' && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 font-bold shrink-0">⭐ VIP</span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {displayUser.isOnline ? '🟢 En ligne' : '⚪ Hors ligne'}
              <span className="mx-1.5">·</span>
              <span className="font-semibold text-gray-600">{displayUser.totalSpent.toLocaleString('fr-FR')}🪙</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setIsInfoOpen(v => !v); setIsNotesOpen(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isInfoOpen ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Info size={12} />
              <span className="hidden sm:inline">Infos</span>
            </button>
            <button
              onClick={() => { setIsNotesOpen(v => !v); setIsInfoOpen(false); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors border border-amber-200"
            >
              <StickyNote size={12} />
              <span className="hidden sm:inline">Notes</span>
            </button>
            <button className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors" title="Bloquer">
              <Ban size={13} />
            </button>
          </div>
        </div>

        {/* Ligne 2 : Navigation ← [x/n] → */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-500 active:scale-95"
              title="Client précédent (← ou Shift+Tab)"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-bold text-gray-400 tabular-nums">{displayIndex} / {totalCount}</span>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-500 active:scale-95"
              title="Client suivant (→ ou Tab)"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Hint swipe mobile */}
          <span className="text-[10px] text-gray-300 md:hidden">← glisser →</span>

          {/* Kbd hint desktop */}
          <span className="text-[10px] text-gray-300 hidden md:inline">← → pour naviguer</span>
        </div>

        {/* Note rapide si existante */}
        {userNotes && (
          <button
            onClick={() => { setIsNotesOpen(true); setIsInfoOpen(false); }}
            className="w-full flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 hover:bg-amber-100 transition-colors text-left"
          >
            <StickyNote size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 font-medium line-clamp-1">{userNotes}</p>
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════
          MESSAGES
      ══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#F5F5F0]">
        <div className="text-center text-xs text-gray-400 my-2">Aujourd'hui</div>

        {realtimeMessages.map(msg => {
          const isMe = msg.senderId !== displayUser.id;
          const mediaAtts: any[] = (msg as any).mediaAttachments ?? [];
          const hasMedia = mediaAtts.length > 0;
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Bulle message */}
                <div className={`rounded-2xl shadow-sm text-sm overflow-hidden ${
                  isMe
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : msg.isTip ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-400 shadow-yellow-200 shadow-lg text-yellow-900 rounded-tl-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  
                  {/* Media preview */}
                  {hasMedia && mediaAtts.map((att: any) => {
                    const libItem = att.libraryItem;
                    const isVideo = libItem?.type === 'video';

                    if (msg.isPaid && !msg.isUnlocked) {
                      return (
                        <div key={att.id} className="relative w-48 h-48 bg-gray-900 flex items-center justify-center">
                          <div className="text-center text-white">
                            <span className="text-2xl">🔒</span>
                            <p className="text-xs mt-1 font-bold">{msg.price}🪙</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <MediaBubble 
                        key={att.id}
                        src={libItem?.url}
                        thumbnail={libItem?.thumbnailUrl}
                        type={libItem?.type as 'image' | 'video'}
                        onClick={() => setPreviewMedia({
                          url: libItem.url,
                          type: libItem.type as 'image' | 'video',
                          thumbnail: libItem.thumbnailUrl
                        })}
                      />
                    );
                  })}

                  {/* Texte (optionnel si il y a aussi un media) */}
                  {msg.content && (
                    <div className={`px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${!isMe && msg.isTip ? 'font-bold text-center text-lg drop-shadow-sm' : ''}`}>
                      {msg.content}
                    </div>
                  )}
                </div>

                <span className={`text-[10px] mt-1 px-1 ${!isMe && msg.isTip ? 'text-yellow-700 font-medium' : 'text-gray-400'}`}>
                  {format(msg.createdAt ? new Date(msg.createdAt) : new Date(), 'HH:mm')}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ══════════════════════════════════════
          SWITCH MOBILE + INPUT
      ══════════════════════════════════════ */}
      <div className="bg-white border-t border-gray-100">

        {/* Boutons switch mobile — visibles uniquement sur petit écran */}
        <div className="flex items-center justify-between px-4 py-2 md:hidden border-b border-gray-50">
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <ChevronLeft size={16} /> Préc.
          </button>
          <span className="text-xs text-gray-400 font-medium">{displayIndex} / {totalCount}</span>
          <button
            onClick={goNext}
            disabled={!hasNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Suiv. <ChevronRight size={16} />
          </button>
        </div>

        {/* Input */}
        <div className="p-3 md:p-4">
          <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl md:rounded-3xl border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all shadow-sm">
            <div className="flex gap-0.5 pb-1 pl-1">
              <button
                onClick={() => setIsMediaOpen(true)}
                className="p-1.5 md:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title="Envoyer un média"
              >
                <ImageIcon size={18} />
              </button>
            </div>
            <textarea
              value={messageText}
              onChange={e => {
                setMessageText(e.target.value);
                handleTyping();
                e.target.style.height = '40px';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (messageText.trim() && isConnected) {
                    sendMessage(messageText.trim());
                    setMessageText('');
                    stopTyping();
                    e.currentTarget.style.height = '40px';
                  }
                }
              }}
              placeholder="Écrire un message..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 max-h-32 text-sm text-gray-900 placeholder-gray-400"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            <div className="pb-1 pr-1">
              <button 
                onClick={() => {
                  if (messageText.trim() && isConnected) {
                    sendMessage(messageText.trim());
                    setMessageText('');
                    stopTyping();
                  }
                }}
                disabled={!isConnected || !messageText.trim()}
                className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>{/* end sliding wrapper */}
      {/* Drawer, Modal & MessageMediaModal — outside the sliding wrapper */}
      <ClientInfoDrawer user={displayUser as any} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      <ClientNotesModal
        user={displayUser as any}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        initialNotes={userNotes}
        onSave={(userId, n) => setNotes(prev => ({ ...prev, [userId]: n }))}
      />
      <MessageMediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSend={(media) => {
          sendMessage('', media.id, media.isPaid, media.price);
          setIsMediaOpen(false);
        }}
      />
      {/* Media Viewer Modal */}
      {previewMedia && (
        <ChatMediaViewer 
          media={previewMedia} 
          onClose={() => setPreviewMedia(null)} 
        />
      )}
    </div>
  );
}
