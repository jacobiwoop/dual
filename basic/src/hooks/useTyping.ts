import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';

interface TypingUser {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

/**
 * Hook pour gérer les indicateurs "en train de taper"
 */
export function useTyping(conversationId: string | null) {
  const { socket, isConnected, on, emit } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Écouter les events de typing
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    const handleTyping = (data: TypingUser) => {
      if (data.conversationId !== conversationId) return;

      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });

      // Auto-remove après 3 secondes si pas de stop
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
        }, 3000);
      }
    };

    const unsubscribe = on('typing:user', handleTyping);

    return () => {
      unsubscribe?.();
    };
  }, [socket, isConnected, conversationId, on]);

  /**
   * Notifier qu'on commence à taper
   */
  const startTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;

    emit('typing:start', { conversationId });

    // Auto-stop après 3 secondes si pas d'activité
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [conversationId, isConnected, emit]);

  /**
   * Notifier qu'on arrête de taper
   */
  const stopTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;

    emit('typing:stop', { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, isConnected, emit]);

  /**
   * Handler pour input onChange (debounced)
   */
  const handleTyping = useCallback(() => {
    startTyping();
  }, [startTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    isAnyoneTyping: typingUsers.size > 0,
    startTyping,
    stopTyping,
    handleTyping,
  };
}
