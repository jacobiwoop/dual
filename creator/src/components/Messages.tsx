import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon, Ban, StickyNote, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { CONVERSATIONS, Conversation } from '@/data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClientInfoDrawer } from '@/components/ClientInfoDrawer';
import { ClientNotesModal } from '@/components/ClientNotesModal';
import { MessageMediaModal } from '@/components/MessageMediaModal';

interface MessagesProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  conversations: Conversation[];
  onOpenClientList?: () => void;
}

export function Messages({ selectedConversationId, onSelectConversation, conversations, onOpenClientList }: MessagesProps) {
  const [messageText, setMessageText]   = useState('');
  const [isInfoOpen, setIsInfoOpen]     = useState(false);
  const [isNotesOpen, setIsNotesOpen]   = useState(false);
  const [isMediaOpen, setIsMediaOpen]   = useState(false);
  const [notes, setNotes]               = useState<Record<string, string>>({});
  const messagesEndRef                  = useRef<HTMLDivElement>(null);

  // Swipe / slide state
  const touchStartX  = useRef<number | null>(null);
  const [dragX, setDragX]         = useState(0);          // live offset in px while dragging
  const [slideAnim, setSlideAnim] = useState<'idle' | 'out-left' | 'out-right' | 'in-left' | 'in-right'>('idle');

  const currentIndex = conversations.findIndex(c => c.userId === selectedConversationId);
  const conversation = conversations[currentIndex] ?? conversations[0];
  const hasPrev      = currentIndex > 0;
  const hasNext      = currentIndex < conversations.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onSelectConversation(conversations[currentIndex - 1].userId);
  }, [hasPrev, currentIndex, conversations, onSelectConversation]);

  const goNext = useCallback(() => {
    if (hasNext) onSelectConversation(conversations[currentIndex + 1].userId);
  }, [hasNext, currentIndex, conversations, onSelectConversation]);

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
  }, [conversation?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

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

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400 text-sm">
        Sélectionnez une conversation
      </div>
    );
  }

  const { user } = conversation;
  const userNotes = notes[user.id] ?? user.notes ?? '';

  // CSS slide classes
  const slideClass = {
    idle:       'transition-none',
    'out-left':  'transition-transform duration-[180ms] ease-in-out translate-x-[-30%]',
    'out-right': 'transition-transform duration-[180ms] ease-in-out translate-x-[30%]',
    'in-left':   'transition-none  translate-x-[20%]',
    'in-right':  'transition-none  translate-x-[-20%]',
  }[slideAnim];

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
            <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover shadow-sm" />
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          {/* Nom + tier + statut */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">{user.displayName}</h2>
              {user.subscriptionTier === 'Plus' && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-200 font-bold shrink-0">💎 Plus</span>
              )}
              {user.subscriptionTier === 'VIP' && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 font-bold shrink-0">⭐ VIP</span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {user.isOnline ? '🟢 En ligne' : '⚪ Hors ligne'}
              <span className="mx-1.5">·</span>
              <span className="font-semibold text-gray-600">{user.totalSpent.toLocaleString('fr-FR')}🪙</span>
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
            <span className="text-xs font-bold text-gray-400 tabular-nums">{currentIndex + 1} / {conversations.length}</span>
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

        {conversation.messages.map(msg => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  isMe
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {format(msg.timestamp, 'HH:mm')}
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
          <span className="text-xs text-gray-400 font-medium">{currentIndex + 1} / {conversations.length}</span>
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
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  // TODO: envoyer
                }
              }}
              placeholder="Écrire... (Ctrl+Enter)"
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 max-h-32 text-sm text-gray-900 placeholder-gray-400"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            <div className="pb-1 pr-1">
              <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20">
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>{/* end sliding wrapper */}
      {/* Drawer, Modal & MessageMediaModal — outside the sliding wrapper */}
      <ClientInfoDrawer user={user} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      <ClientNotesModal
        user={user}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        initialNotes={userNotes}
        onSave={(userId, n) => setNotes(prev => ({ ...prev, [userId]: n }))}
      />
      <MessageMediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSend={(media) => {
          console.log('Media to send:', media);
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
