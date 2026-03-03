import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Star, Heart, Paperclip, Send, MoreVertical, Phone, Video, X } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useMessages, Message } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import { useAuth } from '../context/AuthContext';

interface ConversationItem {
  id: string; // conversation ID
  creatorId: string;
  creatorHasLeft: boolean;
  isOnline?: boolean;
  creatorDetails: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
}

interface ChatSidebarProps {
  activeChatId: string | number | null; // Accepte string (backend) ou number (frontend)
  onSelectChat: (id: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar = ({ activeChatId, onSelectChat, isOpen, onClose }: ChatSidebarProps) => {
  const { isConnected } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatIndexStr = activeChatId ? activeChatId.toString() : null;

  // Récupérer la conversation associée au créateurId sélectionné
  const currentConv = conversations.find(c => c.creatorId === activeChatIndexStr || c.id === activeChatIndexStr);
  
  // Utiliser le vrai ID de conversation, ou null si inexistante encore
  const { messages, sendMessage, loadMessages, markAsRead, creatorInfo } = useMessages(currentConv?.id || null);
  const { isAnyoneTyping, handleTyping, stopTyping } = useTyping(currentConv?.id || null);

  // Charger les conversations du client
  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/client/conversations');
      // L'API retourne { conversations: [{id, creator: {...}, lastMessage, ...}] }
      // On mappe vers le format ConversationItem attendu par la Sidebar
      const mapped: ConversationItem[] = (res.data.conversations || []).map((conv: any) => ({
        id: conv.id,
        creatorId: conv.creator?.id || '',
        creatorHasLeft: false,
        isOnline: conv.isOnline,
        creatorDetails: {
          username: conv.creator?.username || '',
          displayName: conv.creator?.displayName || conv.creator?.username || 'Créateur',
          avatarUrl: conv.creator?.avatarUrl || null,
        },
        lastMessage: conv.lastMessage ? {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          senderId: conv.lastMessage.senderId,
          isRead: conv.lastMessage.isRead,
        } : undefined,
      }));
      setConversations(mapped);
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Quand une conversation s'ouvre, on charge ses messages
  useEffect(() => {
    if (activeChatIndexStr) {
      loadMessages(activeChatIndexStr);
    }
  }, [activeChatIndexStr, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnyoneTyping]);

  useEffect(() => {
    // Si on a des messages non lus dans la convo actuelle, on les marque
    if (currentConv?.id && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.readAt && lastMsg.senderId !== user?.id && lastMsg.senderId !== null) {
        markAsRead(lastMsg.id); // On assume que markAsRead gère l'envoi propre
      }
    }
  }, [messages, currentConv?.id, markAsRead, user?.id]);

  // Écouter les événements de présence pour les créateurs
  const { on } = useSocket();
  useEffect(() => {
    const unsubOnline = on('user:online', (data: { userId: string }) => {
      setConversations(prev => prev.map(c => 
        c.creatorId === data.userId ? { ...c, isOnline: true } : c
      ));
    });
    const unsubOffline = on('user:offline', (data: { userId: string }) => {
      setConversations(prev => prev.map(c => 
        c.creatorId === data.userId ? { ...c, isOnline: false } : c
      ));
    });
    return () => {
      unsubOnline?.();
      unsubOffline?.();
    };
  }, [on]);

  const handleSend = async () => {
    if (!inputValue.trim() || (!currentConv?.id && !activeChatIndexStr)) return;
    
    if (currentConv?.id) {
      sendMessage(inputValue.trim());
    } else {
      try {
        // Premier message, on crée la conversation
        await api.post(`/api/client/conversations/${activeChatIndexStr}/messages`, { content: inputValue.trim() });
        fetchConversations();
      } catch (e) {
        console.error('Erreur premier message', e);
      }
    }

    setInputValue('');
    stopTyping();
    
    // Optimistic UI updates / Force refresh conversations
    setTimeout(fetchConversations, 500); 
  };

  // Les infos à afficher (soit venant de la conversation, soit fetched par loadMessages)
  const displayUser = currentConv ? currentConv.creatorDetails : creatorInfo;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-x-0 bottom-0 top-[92px] bg-black/50 z-20 xl:hidden"
          onClick={onClose}
        />
      )}

      <div 
        className={`
          fixed bottom-0 right-0 top-[92px] bg-white border-l border-gray-200 shadow-xl z-30 transition-all duration-300 flex
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          xl:translate-x-0 xl:sticky xl:top-[92px] xl:h-[calc(100vh-92px)] xl:inset-auto
          w-full sm:w-[400px] xl:w-auto
          ${activeChatId ? 'xl:w-[640px]' : 'xl:w-80'}
        `}
      >
        {/* Left Side: Chat List */}
        <div className={`
          flex flex-col h-full border-r border-gray-100 w-full xl:w-80 flex-shrink-0 bg-white
          ${activeChatId ? 'hidden xl:flex' : 'flex'}
        `}>
          {/* Header Tabs */}
          <div className="flex items-center justify-between bg-black text-white h-14 px-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button className="relative p-1 hover:text-gray-300 transition-colors">
                <MessageCircle size={24} className="text-orange-500 fill-orange-500" />
                <span className="absolute -top-1 -right-2 bg-lime-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                  {conversations.length}
                </span>
              </button>
              
              {!isConnected && (
                <div className="flex items-center text-xs text-yellow-400 bg-yellow-400/20 px-2 py-0.5 border border-yellow-400/50 rounded-md">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping mr-1.5"></span>
                  Connexion...
                </div>
              )}
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="xl:hidden p-1 hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-4 pr-4 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {conversations.length === 0 ? (
              <p className="p-4 text-center text-gray-500 text-sm mt-8">Vous n'avez aucune conversation en cours.</p>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  onClick={() => onSelectChat(conv.creatorId)}
                  className={`flex items-start gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors group ${activeChatIndexStr === conv.creatorId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={conv.creatorDetails.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} 
                      alt={conv.creatorDetails.displayName} 
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    {conv.isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-lime-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-orange-500 text-sm truncate">{conv.creatorDetails.displayName}</h3>
                      {conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId === conv.creatorId && (
                        <span className="text-xs font-bold text-lime-600">NEW</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-800 font-medium truncate mt-0.5 flex items-center gap-1">
                      {conv.lastMessage ? conv.lastMessage.content : 'Nouvelle conversation'}
                    </p>
                    
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window — animated wrapper */}
        <div className={`
          overflow-x-hidden transition-[width] duration-300 flex-shrink-0 h-full
          ${activeChatId ? 'w-full xl:w-80' : 'w-0 xl:w-0'}
        `}>
          {displayUser ? (
            <div className="flex flex-col h-full bg-gray-50 xl:w-80 w-full">
              {/* Chat Header */}
              <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back Button (Mobile only) */}
                  <button 
                    onClick={() => onSelectChat(null)}
                    className="p-1 -ml-2 hover:bg-gray-100 rounded-full xl:hidden"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="relative">
                    <img src={displayUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} alt={displayUser.displayName} className="w-8 h-8 rounded-full object-cover" />
                    {currentConv?.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-lime-500 border border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-none">{displayUser.displayName}</h3>
                    <span className="text-[10px] text-gray-400">
                      {currentConv?.isOnline ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <MoreVertical size={20} className="hover:text-gray-800 cursor-pointer" />
                  <button onClick={() => onSelectChat(null)} className="hover:text-red-500 hidden xl:block">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">Conversation chiffrée de bout en bout</span>
                </div>

                {messages.map((msg) => (
                  msg.senderId === (currentConv?.creatorId || activeChatIndexStr) ? (
                    <div key={msg.id} className="flex gap-3">
                      <img src={displayUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} alt="Creator" className="w-8 h-8 rounded-full object-cover self-end flex-shrink-0" />
                      <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[75%] border border-gray-100">
                        <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[9px] text-gray-400 block mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center self-end text-xs font-bold text-white flex-shrink-0">MOI</div>
                      <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none shadow-sm max-w-[75%]">
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[9px] text-blue-100 block mt-1 text-right flex items-center justify-end gap-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.readAt && <span className="text-white text-[10px]">✓✓</span>}
                        </span>
                      </div>
                    </div>
                  )
                ))}

                {isAnyoneTyping && (
                  <div className="flex gap-2">
                    <img src={displayUser.avatarUrl || ''} className="w-8 h-8 rounded-full opacity-50 block" alt="" />
                    <div className="bg-gray-200 p-2 px-3 rounded-2xl rounded-bl-none inline-flex gap-1 h-8 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-3 py-2 border border-blue-100">
                  <textarea
                    rows={1}
                    placeholder="Message..."
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      handleTyping();
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                    onBlur={stopTyping}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 bg-transparent focus:outline-none text-sm resize-none pt-1 max-h-[100px] scrollbar-hide"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || !isConnected}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-0.5 shadow-sm"
                  >
                    <Send size={15} className="mr-[1px]" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-gray-50 xl:w-80 w-full items-center justify-center p-6 text-center text-gray-500">
              <MessageCircle size={48} className="text-gray-300 mb-4" />
              <p className="text-sm">Sélectionnez une conversation ou visitez le profil d'un créateur pour démarrer le chat.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
