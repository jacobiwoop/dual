import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Seulement connecter si authentifié
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Créer la connexion Socket.io
    const newSocket = io(SOCKET_URL, {
      auth: {
        token, // Envoyer le JWT dans le handshake
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Event: connexion réussie
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected:', newSocket.id);
      setIsConnected(true);
      setError(null);
      
      // Marquer l'utilisateur comme en ligne
      newSocket.emit('user:online');
    });

    // Event: déconnexion
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      setIsConnected(false);
    });

    // Event: erreur de connexion
    newSocket.on('connect_error', (err) => {
      console.error('🔴 Socket.io connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Event: erreur générale
    newSocket.on('error', (data: { code: string; message: string }) => {
      console.error('🔴 Socket.io error:', data);
      setError(data.message);
    });

    setSocket(newSocket);

    // Cleanup à la déconnexion
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  const value = {
    socket,
    isConnected,
    error,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
