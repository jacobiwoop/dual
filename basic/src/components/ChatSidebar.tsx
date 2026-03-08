import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Star, Heart, Paperclip, Send, MoreVertical, Phone, Video, X, Play, Gift } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useMessages, Message } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import { useAuth } from '../context/AuthContext';
import { showsService, ShowType } from '../services/shows';
import { Sparkles, Loader } from 'lucide-react';

// --- CONSTANTS: GIFTS ---
export const GIFTS = [
  { id: 'rose', name: 'Rose', emoji: '🌹', price: 10 },
  { id: 'chocolate', name: 'Chocolat', emoji: '🍫', price: 20 },
  { id: 'bear', name: 'Peluche', emoji: '🐻', price: 50 },
  { id: 'champagne', name: 'Champagne', emoji: '🍾', price: 100 },
  { id: 'ring', name: 'Bague', emoji: '💍', price: 500 },
  { id: 'crown', name: 'Couronne', emoji: '👑', price: 1000 },
];

// --- SUB-COMPONENT: MediaBubble ---
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
      className="relative w-full max-w-[240px] aspect-square bg-gray-100 overflow-hidden cursor-pointer group rounded-lg mb-2"
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-400 animate-spin opacity-20" />
        </div>
      )}

      <img
        src={thumbnail || src}
        alt="média"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {type === 'video' && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-blue-600">
            <Play size={20} className="fill-current ml-0.5" />
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </div>
  );
};

// --- SUB-COMPONENT: ChatMediaViewer ---
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

// --- SUB-COMPONENT: GiftSelectionModal ---
const GiftSelectionModal = ({
  isOpen,
  onClose,
  onSelectGift
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectGift: (gift: typeof GIFTS[0]) => void;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] cursor-pointer" onClick={onClose} />
      <div className="absolute bottom-16 right-4 lg:left-4 z-[101] mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 animate-in fade-in slide-in-from-bottom-5">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
          <span>Envoyer un cadeau</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
            <X size={16} />
          </button>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {GIFTS.map((gift) => (
            <button
              key={gift.id}
              onClick={() => {
                onSelectGift(gift);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all group"
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{gift.emoji}</span>
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-purple-600">{gift.name}</span>
              <span className="text-[10px] font-bold text-orange-500 mt-0.5 bg-orange-100 px-1.5 rounded">{gift.price} 🪙</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

interface ConversationItem {
  id: string; // conversation ID
  creatorId: string;
  creatorHasLeft: boolean;
  isOnline?: boolean;
  creatorDetails: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    isPayPerMessageEnabled?: boolean;
    messagePrice?: number;
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
  const { user, updateUser } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video'; thumbnail?: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatIndexStr = activeChatId ? activeChatId.toString() : null;

  // Récupérer la conversation associée au créateurId ou username sélectionné
  const currentConv = conversations.find(c => 
    c.creatorId === activeChatIndexStr || 
    c.id === activeChatIndexStr || 
    c.creatorDetails.username === activeChatIndexStr
  );
  
  // Utiliser le vrai ID de conversation, ou null si inexistante encore
  // IMPORTANT: On utilise currentConv?.id pour Fetcher les messages.
  const { messages, sendMessage, loadMessages, markAsRead, creatorInfo } = useMessages(currentConv?.id || null);
  const { isAnyoneTyping, handleTyping, stopTyping } = useTyping(currentConv?.id || null);

  // Si activeChatId existe mais pas de conversation, créer une temporaire pour afficher le chat
  const [tempCreatorInfo, setTempCreatorInfo] = useState<any>(null);
  const [loadingCreatorInfo, setLoadingCreatorInfo] = useState(false);
  
  useEffect(() => {
    // Si on a un activeChatId (qui peut être un username venant du feed) mais pas de conversation existante
    if (activeChatIndexStr && !currentConv && isOpen) {
      const fetchCreatorInfo = async () => {
        setLoadingCreatorInfo(true);
        try {
          // Fetch directement le créateur par username (l'API le supporte)
          const res = await api.get(`/api/client/creators/${activeChatIndexStr}`);
          const creator = res.data.creator;
          
          if (creator) {
            setTempCreatorInfo({
              id: 'temp-' + creator.id, // Un ID temporaire pour l'UI
              creatorId: creator.id, // LE VRAI ID DU CREATEUR
              creatorHasLeft: false,
              isOnline: creator.isOnline,
              creatorDetails: {
                username: creator.username,
                displayName: creator.displayName || creator.username,
                avatarUrl: creator.avatarUrl,
                isPayPerMessageEnabled: creator.isPayPerMessageEnabled,
                messagePrice: creator.messagePrice,
              },
            });
            
            // Re-fetch conversations just in case it was created in the background
            fetchConversations();
          }
        } catch (e) {
          console.error('Failed to fetch creator info', e);
        } finally {
          setLoadingCreatorInfo(false);
        }
      };
      fetchCreatorInfo();
    } else if (!activeChatIndexStr || currentConv) {
      setTempCreatorInfo(null);
      setLoadingCreatorInfo(false);
    }
  }, [activeChatIndexStr, currentConv, isOpen]);

  // Utiliser currentConv si existe, sinon tempCreatorInfo
  const displayConv = currentConv || tempCreatorInfo;

  // ---------- New logic for Special Requests Modal
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);

  const handleShowRequest = async (showId: string) => {
    if (!currentConv?.creatorId && !activeChatIndexStr) return;
    const cid = currentConv?.creatorId || activeChatIndexStr;
    if (!cid) return;

    try {
      const { newBalance } = await showsService.requestShow(showId, cid);
      // Mettre à jour le solde dans le context
      updateUser({ coinBalance: newBalance });
      // Rafraîchir les messages de la conversation
      if (currentConv?.creatorId) {
        loadMessages(currentConv.creatorId);
      } else if (activeChatIndexStr) {
        loadMessages(activeChatIndexStr);
      }
      setIsShowModalOpen(false);
      alert('Demande spéciale envoyée avec succès !');
      fetchConversations();
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Erreur lors de l\'envoi de la demande.');
      }
    }
  };
  // ------------------------------------------------

  // ---------- New logic for Gifts Modal
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const handleSendGift = async (gift: typeof GIFTS[0]) => {
    if (!currentConv?.id && !displayConv?.creatorId) return;
    
    // GIFT RULE: We don't charge the message fee for gifts
    const msgPrice = 0; 
    const totalCost = gift.price;

    // Check if the user has enough coins
    if (!user?.coinBalance || user.coinBalance < totalCost) {
      alert(`Vous n'avez pas assez de crédits pour envoyer ce cadeau. (${totalCost} 🪙 requis)`);
      return;
    }

    // Confirm sending gift
    if (!confirm(`Envoyer le cadeau "${gift.name} ${gift.emoji}" pour ${gift.price} 🪙 ?`)) return;

    if (currentConv?.id) {
       // Si la conversation existe déjà, on utilise simplement WebSocket (temps réel !)
       try {
           setIsGiftModalOpen(false);
           // On envoie un message via le socket
           sendMessage(`A envoyé un cadeau : ${gift.name} ${gift.emoji}`, undefined, true, gift.price);
           
           // Le backend va gérer la déduction et le crédit
           updateUser({ coinBalance: user.coinBalance - totalCost }); // Déduction optimiste
           
       } catch (error) {
           console.error("Erreur d'envoi du cadeau:", error);
           alert("Une erreur est survenue lors de l'envoi du cadeau.");
           // Revert balance
           updateUser({ coinBalance: user.coinBalance }); 
       }
    } else if (displayConv?.creatorId) {
       // Si c'est le premier message
       try {
           setIsGiftModalOpen(false);
           updateUser({ coinBalance: user.coinBalance - totalCost });
           await api.post(`/api/client/conversations/${displayConv.creatorId}/messages`, {
              content: `A envoyé un cadeau : ${gift.name} ${gift.emoji}`,
              tipCoins: gift.price
           });
           
           // Récupérer la nouvelle convo
           const convRes = await api.get('/api/client/conversations');
           const targetConv = convRes.data.conversations.find((c: any) => c.creator.id === displayConv.creatorId);
           if (targetConv) {
              setTimeout(() => {
                 fetchConversations();
                 onSelectChat(targetConv.id);
              }, 100);
           } else {
              fetchConversations();
           }
       } catch (error) {
           console.error("Erreur d'envoi du cadeau (premier message):", error);
           alert("Une erreur est survenue lors de l'envoi du cadeau.");
           updateUser({ coinBalance: user.coinBalance }); 
       }
    }
  };
  // ------------------------------------------------

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
          isPayPerMessageEnabled: conv.creator?.isPayPerMessageEnabled,
          messagePrice: conv.creator?.messagePrice,
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
    if (currentConv?.creatorId) {
      loadMessages(currentConv.creatorId);
    } else if (tempCreatorInfo?.creatorId && isOpen) {
      // Cas où l'on vient du profil ou du feed, on utilise le vrai creatorId fetché
      loadMessages(tempCreatorInfo.creatorId);
    }
  }, [currentConv?.creatorId, tempCreatorInfo?.creatorId, isOpen, loadMessages]);

  const { socket } = useSocket();

  // Écouter les nouveaux messages pour mettre à jour la liste des conversations (sidebar)
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = () => {
      fetchConversations();
    };
    socket.on('message:received', handleNewMessage);
    return () => {
      socket.off('message:received', handleNewMessage);
    };
  }, [socket]);

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
    
    // Check if the message will cost money
    const isPaidMsg = displayUser?.isPayPerMessageEnabled;
    const msgPrice = isPaidMsg ? (displayUser?.messagePrice || 0) : 0;
    
    if (isPaidMsg && msgPrice > 0) {
      if (!user?.coinBalance || user.coinBalance < msgPrice) {
        alert(`Vous n'avez pas assez de crédits pour envoyer un message à ce créateur. (${msgPrice} 🪙 requis)`);
        return;
      }
    }

    if (currentConv?.id) {
      sendMessage(inputValue.trim());
      if (isPaidMsg && msgPrice > 0) {
         updateUser({ coinBalance: (user?.coinBalance || 0) - msgPrice });
      }
      setInputValue('');
      setPreviewMedia(null);
      // Wait a tiny bit then refresh list
      setTimeout(fetchConversations, 300);
    } else if (displayConv?.creatorId) {
      try {
        // Premier message, on crée la conversation avec le creatorId
        const res = await api.post(`/api/client/conversations/${displayConv.creatorId}/messages`, { content: inputValue.trim() });
        if (isPaidMsg && msgPrice > 0) {
           updateUser({ coinBalance: (user?.coinBalance || 0) - msgPrice });
        }
        
        setInputValue('');
        setPreviewMedia(null);

        // Fetch explicitly to get the new conversation ID
        const convRes = await api.get('/api/client/conversations');
        // Find the newly created conv ID where we just sent the message
        const targetConv = convRes.data.conversations.find((c: any) => c.creator.id === displayConv.creatorId);
        
        if (targetConv) {
           // Wait a little bit over for states to settle, then select the new valid ID
           setTimeout(() => {
              fetchConversations();
              onSelectChat(targetConv.id);
           }, 100);
        } else {
           fetchConversations();
        }
      } catch (e) {
        console.error('Erreur premier message', e);
      }
    }

    stopTyping();
  };

  // Les infos à afficher (soit venant de la conversation, soit fetched par loadMessages)
  const displayUser = displayConv ? displayConv.creatorDetails : creatorInfo;

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
          ${!isOpen ? 'xl:hidden' : 'xl:translate-x-0'} xl:sticky xl:top-[92px] xl:h-[calc(100vh-92px)] xl:inset-auto
          w-full sm:w-[400px] ${activeChatId ? 'xl:w-[740px]' : 'xl:w-[380px]'}
        `}
      >
        {/* Left Side: Chat List */}
        <div className={`
          flex flex-col h-full border-r border-gray-100 w-full xl:w-[380px] flex-shrink-0 bg-white
          ${activeChatId ? 'hidden xl:flex' : 'flex'}
        `}>
          {/* Header Tabs */}
          <div className="flex items-center justify-between bg-black text-white h-14 px-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button className="relative p-1 hover:text-gray-300 transition-colors">
                <MessageCircle size={24} className="text-orange-500 fill-orange-500" />
                {conversations.filter(c => c.lastMessage && !c.lastMessage.isRead && c.lastMessage.senderId === c.creatorId).length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-lime-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                    {conversations.filter(c => c.lastMessage && !c.lastMessage.isRead && c.lastMessage.senderId === c.creatorId).length}
                  </span>
                )}
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
                  onClick={() => onSelectChat(conv.id)}
                  className={`flex items-start gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors group ${(activeChatIndexStr === conv.id || activeChatIndexStr === conv.creatorDetails.username) ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={conv.creatorDetails.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.creatorDetails.displayName)}&background=7c3aed&color=fff`} 
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
                      {conv.lastMessage ? (
                        <>
                          <span className="opacity-70">
                            {conv.lastMessage.senderId !== conv.creatorId ? "Vous : " : `${conv.creatorDetails.displayName} : `}
                          </span>
                          <span>{conv.lastMessage.isTip ? "🎁 Cadeau" : (conv.lastMessage.content || "📸 Média")}</span>
                        </>
                      ) : 'Nouvelle conversation'}
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
          ${activeChatId ? 'w-full xl:flex-1 flex flex-col' : 'w-0 xl:hidden'}
        `}>
          {loadingCreatorInfo ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Chargement de la conversation...</p>
              </div>
            </div>
          ) : displayUser ? (
            <div className="flex flex-col h-full bg-gray-50 w-full">
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
                    <img src={displayUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.displayName)}&background=7c3aed&color=fff`} alt={displayUser.displayName} className="w-8 h-8 rounded-full object-cover" />
                    {displayConv?.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-lime-500 border border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-none">{displayUser.displayName}</h3>
                    <span className="text-[10px] text-gray-400">
                      {displayConv?.isOnline ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <button 
                    onClick={() => setIsShowModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold hover:bg-purple-100 transition-colors"
                  >
                    <Sparkles size={14} />
                    Spé
                  </button>
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
                      <div className={`p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[75%] border ${msg.isTip ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 shadow-yellow-200 shadow-lg' : (msg.isPaid && !msg.isUnlocked ? 'bg-gray-900 border-none' : 'bg-white border-gray-100')}`}>
                        {msg.mediaAttachments?.map((att: any) => {
                          const libItem = att.libraryItem;
                          if (msg.isPaid && !msg.isUnlocked) {
                            return (
                              <div key={att.id} className="relative w-40 h-40 bg-gray-800 flex items-center justify-center rounded-lg mb-2">
                                <div className="text-center text-white">
                                  <span className="text-2xl">🔒</span>
                                  <p className="text-[10px] mt-1 font-bold">{msg.price}🪙</p>
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
                        {msg.content && <p className={`text-sm break-words whitespace-pre-wrap ${msg.isTip ? 'text-yellow-900 font-bold text-center' : (msg.isPaid && !msg.isUnlocked ? 'text-gray-400 italic' : 'text-gray-800')}`}>{msg.content}</p>}
                        <span className={`text-[9px] block mt-1 text-right ${msg.isTip ? 'text-yellow-700' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center self-end text-xs font-bold text-white flex-shrink-0">MOI</div>
                      <div className={`p-3 rounded-2xl rounded-br-none shadow-sm max-w-[75%] ${msg.isTip ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-2 border-yellow-300 shadow-yellow-500/30 shadow-lg' : 'bg-blue-500 text-white'}`}>
                        {msg.mediaAttachments?.map((att: any) => (
                           <MediaBubble 
                              key={att.id}
                              src={att.libraryItem?.url}
                              thumbnail={att.libraryItem?.thumbnailUrl}
                              type={att.libraryItem?.type as 'image' | 'video'}
                              onClick={() => setPreviewMedia({
                                url: att.libraryItem.url,
                                type: att.libraryItem.type as 'image' | 'video',
                                thumbnail: att.libraryItem.thumbnailUrl
                              })}
                            />
                        ))}
                        {msg.content && <p className={`text-sm break-words whitespace-pre-wrap ${msg.isTip ? 'font-bold text-center drop-shadow-md text-lg' : ''}`}>{msg.content}</p>}
                        <span className={`text-[9px] block mt-1 text-right flex items-center justify-end gap-1 ${msg.isTip ? 'text-yellow-100' : 'text-blue-100'}`}>
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
              <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0 relative">
                {displayUser?.isPayPerMessageEnabled && (
                  <div className="mb-2 text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
                    Coût du message : {displayUser.messagePrice || 0} 🪙
                  </div>
                )}
                
                <GiftSelectionModal 
                  isOpen={isGiftModalOpen}
                  onClose={() => setIsGiftModalOpen(false)}
                  onSelectGift={handleSendGift}
                />

                <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-2 py-2 border border-blue-100">
                  <button
                    onClick={() => setIsGiftModalOpen(!isGiftModalOpen)}
                    disabled={!isConnected}
                    className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors self-end mb-0.5"
                    title="Envoyer un cadeau"
                  >
                    <Gift size={20} className={isGiftModalOpen ? 'fill-pink-100' : ''} />
                  </button>
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
            <div className="flex flex-col h-full bg-gray-50 w-full items-center justify-center p-6 text-center text-gray-500">
              <MessageCircle size={48} className="text-gray-300 mb-4" />
              <p className="text-sm">Sélectionnez une conversation ou visitez le profil d'un créateur pour démarrer le chat.</p>
            </div>
          )}
        </div>
      </div>
      {previewMedia && (
        <ChatMediaViewer 
          media={previewMedia} 
          onClose={() => setPreviewMedia(null)} 
        />
      )}
      
      {/* Show Selection Modal */}
      <ShowSelectionModal 
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        creatorId={activeChatIndexStr || ''}
        onSelect={handleShowRequest}
      />
    </>
  );
}

// -----------------------------------------------------
// ShowSelectionModal Component
// -----------------------------------------------------
function ShowSelectionModal({ 
  isOpen, 
  onClose, 
  creatorId, 
  onSelect 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  creatorId: string;
  onSelect: (showId: string) => void;
}) {
  const [shows, setShows] = useState<ShowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !creatorId) return;
    
    const fetchShows = async () => {
      setLoading(true);
      try {
        const data = await showsService.getCreatorShows(creatorId);
        setShows(data);
      } catch (error) {
        console.error('Erreur chargement shows:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShows();
  }, [isOpen, creatorId]);

  if (!isOpen) return null;

  const handleSelect = async (showId: string) => {
    if (!confirm('Cette action débitera votre solde. Confirmer la demande ?')) return;
    setRequestingId(showId);
    await onSelect(showId);
    setRequestingId(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-50 w-[95%] sm:w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
          
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-purple-500" />
              Demandes Spéciales
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader className="animate-spin text-purple-500" size={32} />
              </div>
            ) : shows.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p>Ce créateur ne propose pas de demandes spéciales pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shows.map((show) => (
                  <div key={show.id} className="p-4 border border-purple-100 bg-purple-50/30 rounded-2xl flex flex-col gap-3 group hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{show.emoji || '🔥'}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 leading-tight">{show.title}</h4>
                          <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md whitespace-nowrap text-sm">
                            {show.priceCredits} 🪙
                          </span>
                        </div>
                        {show.description && (
                          <p className="text-sm text-gray-600 mb-2">{show.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                          {show.durationLabel && <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">⏱️ {show.durationLabel}</span>}
                          <span>
                            {show.availability === 'always' ? '✅ Toujours dispo' : 
                             show.availability === 'ondemand' ? '📅 Sur demande' : '❌ Désactivé'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleSelect(show.id)}
                      disabled={requestingId !== null}
                      className="w-full py-2.5 mt-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {requestingId === show.id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : 'Demander'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};
