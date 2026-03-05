import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from '../context/AuthContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: string;
  isPaid: boolean;
  price?: number;
  isUnlocked: boolean;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  mediaAttachments?: any[];
  isPaid: boolean;
  price?: number;
  isUnlocked: boolean;
}

/**
 * Hook pour gérer les messages d'une conversation
 */
export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const { socket, isConnected, on, emit, joinConversation, leaveConversation } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Rejoindre/quitter la conversation
  useEffect(() => {
    if (!conversationId || !isConnected) return;

    console.log('🔌 Joining conversation:', conversationId);
    joinConversation(conversationId);

    // Cleanup - quitter la conversation
    return () => {
      console.log('🔌 Leaving conversation:', conversationId);
      leaveConversation(conversationId);
    };
  }, [conversationId, isConnected]);

  // Écouter les nouveaux messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data: { message: Message }) => {
      console.log('📨 New message received:', data.message);
      
      // Ajouter le message s'il appartient à cette conversation
      if (data.message.conversationId === conversationId) {
        setMessages((prev) => {
          // Éviter les doublons exacts
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }

          // Si c'est notre propre message, nettoyer le message temporaire (optimistic)
          if (data.message.senderId === user?.id) {
             const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
             return [...withoutTemp, data.message];
          }

          return [...prev, data.message];
        });
      }
    };

    const handleMessageRead = (data: { messageId: string; readAt: string; conversationId: string }) => {
      console.log('✅ Message read:', data.messageId);
      
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg
          )
        );
      }
    };

    const handleConversationJoined = (data: { conversationId: string }) => {
      console.log('✅ Conversation joined:', data.conversationId);
    };

    // S'abonner aux events
    const unsubscribeNewMessage = on('message:new', handleNewMessage);
    const unsubscribeMessageRead = on('message:read', handleMessageRead);
    const unsubscribeJoined = on('conversation:joined', handleConversationJoined);

    // Cleanup
    return () => {
      unsubscribeNewMessage?.();
      unsubscribeMessageRead?.();
      unsubscribeJoined?.();
    };
  }, [socket, isConnected, conversationId, on]);

  /**
   * Envoyer un message
   */
  const sendMessage = useCallback(
    (content: string, mediaId?: string) => {
      if (!conversationId || !isConnected) {
        console.warn('Cannot send message: not connected or no conversation');
        return;
      }

      setSending(true);
      
      // Optimistic update: ajouter le message immédiatement
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user?.id || 'me',
        recipientId: 'other', // ID temporaire
        content,
        type: mediaId ? 'media' : 'text',
        isPaid: false,
        isUnlocked: true,
        createdAt: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, optimisticMsg]);

      emit('message:send', {
        conversationId,
        content,
        mediaId,
      });

      // Le vrai message remplacera l'optimistic, ou s'ajoutera et on nettoiera (le cleanup strict sera géré par l'event)
      setSending(false);
    },
    [conversationId, isConnected, emit]
  );

  /**
   * Marquer un message comme lu
   */
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!isConnected) return;
      emit('message:read', { messageId });
    },
    [isConnected, emit]
  );

  const [creatorInfo, setCreatorInfo] = useState<{ id: string; username: string; displayName: string; avatarUrl: string | null } | null>(null);

  /**
   * Charger les messages initiaux (via REST API)
   */
  const loadMessages = useCallback(
    async (creatorId: string) => {
      setLoading(true);
      try {
        const { default: api } = await import('../services/api');
        const response = await api.get(`/api/client/conversations/${creatorId}/messages`);
        
        // Le backend renvoie { conversationId, creator, messages }
        if (response.data.messages) {
          setMessages(response.data.messages);
        }
        if (response.data.creator) {
          setCreatorInfo(response.data.creator);
        }
      } catch (error) {
        console.error('Error loading messages API:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    messages,
    setMessages,
    creatorInfo,
    loading,
    sending,
    sendMessage,
    markAsRead,
    loadMessages,
  };
}
