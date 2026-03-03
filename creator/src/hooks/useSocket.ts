import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

/**
 * Hook pour gérer les events Socket.io génériques
 */
export function useSocket() {
  const { socket, isConnected, error } = useSocketContext();

  /**
   * Écouter un event Socket.io
   */
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (!socket) return;

    socket.on(event, callback);

    // Retourner une fonction de cleanup
    return () => {
      socket.off(event, callback);
    };
  };

  /**
   * Émettre un event Socket.io
   */
  const emit = (event: string, data?: any) => {
    if (!socket) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }

    socket.emit(event, data);
  };

  /**
   * Rejoindre une conversation
   */
  const joinConversation = (conversationId: string) => {
    emit('conversation:join', { conversationId });
  };

  /**
   * Quitter une conversation
   */
  const leaveConversation = (conversationId: string) => {
    emit('conversation:leave', { conversationId });
  };

  return {
    socket,
    isConnected,
    error,
    on,
    emit,
    joinConversation,
    leaveConversation,
  };
}
