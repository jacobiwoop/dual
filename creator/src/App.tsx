import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import { Dashboard } from '@/components/Dashboard';
import { Profile } from '@/components/Profile';
import { Media } from '@/components/Media';
import { Messages } from '@/components/Messages';
import { Requests } from '@/components/Requests';
import { Settings } from '@/components/Settings';
import { Library } from '@/components/Library';
import { Auth } from '@/components/Auth';
import { api } from '@/services/api';
import { Menu } from 'lucide-react';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => window.location.reload()} />;
  }

  return <AuthenticatedApp />;
}

// Type pour les conversations réelles de l'API
interface RealConversation {
  id: string;           // UUID de la conversation (pour socket)
  clientId: string;     // UUID du client
  isOnline: boolean;    // Statut de présence depuis Redis
  client: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  lastMessage?: { content: string; createdAt: string; senderId: string; isRead: boolean; } | null;
  unreadCount: number;
  updatedAt: string;
}

function AuthenticatedApp() {
  const { user } = useAuth();
  // selectedConversationId = conversation UUID (pas user ID)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [realConversations, setRealConversations] = useState<RealConversation[]>([]);

  const [isSidebarOpen, setIsSidebarOpen]           = useState(false);
  const [isSidebarRightOpen, setIsSidebarRightOpen] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;
  const activeTab = currentPath === '/' ? 'dashboard' : currentPath.substring(1).split('/')[0];

  // Charger les vraies conversations depuis l'API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/api/creator/conversations');
        const convs: RealConversation[] = res.data.conversations || [];
        setRealConversations(convs);
        // Sélectionner la première conversation par défaut
        if (convs.length > 0 && !selectedConversationId) {
          setSelectedConversationId(convs[0].id);
        }
      } catch (e) {
        console.error('Erreur chargement conversations créateur:', e);
      }
    };
    fetchConversations();
  }, []);

  // Marquer la conversation comme lue lorsqu'elle est sélectionnée
  useEffect(() => {
    if (!selectedConversationId) return;
    
    const conv = realConversations.find(c => c.id === selectedConversationId);
    if (conv && conv.unreadCount > 0) {
      api.put(`/api/creator/conversations/${conv.clientId}/read`)
        .then(() => {
          setRealConversations(prev => prev.map(c => 
            c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c
          ));
        })
        .catch(e => console.error('Erreur marquer comme lu:', e));
    }
  }, [selectedConversationId, realConversations]);

  // Écouter les événements de présence WebSocket globalement
  const { on } = useSocket();
  useEffect(() => {
    const unsubOnline = on('user:online', (data: { userId: string }) => {
      setRealConversations(prev => prev.map(c => 
        c.clientId === data.userId ? { ...c, isOnline: true } : c
      ));
    });

    const unsubOffline = on('user:offline', (data: { userId: string }) => {
      setRealConversations(prev => prev.map(c => 
        c.clientId === data.userId ? { ...c, isOnline: false } : c
      ));
    });

    const unsubNewMessage = on('message:new', (data: { message: any }) => {
      const msg = data.message;
      if (msg.senderId === user?.id) return;
      
      setRealConversations(prev => {
        const exists = prev.some(c => c.id === msg.conversationId);
        
        if (!exists) {
          // Nouvelle conversation détectée : on recharge la liste depuis le serveur
          api.get('/api/creator/conversations').then(res => {
            const convs: RealConversation[] = res.data.conversations || [];
            setRealConversations(convs);
          }).catch(console.error);
          return prev;
        }

        // Mise à jour d'une conversation existante
        return prev.map(c => {
          if (c.id === msg.conversationId) {
            return {
              ...c,
              unreadCount: c.id === selectedConversationId ? 0 : (c.unreadCount || 0) + 1,
              lastMessage: msg,
              updatedAt: msg.createdAt
            };
          }
          return c;
        });
      });
    });

    return () => {
      unsubOnline?.();
      unsubOffline?.();
      unsubNewMessage?.();
    };
  }, [on, selectedConversationId, user?.id]);

  // Écouter les nouveaux messages (pour incrémenter badge si pas dans la bonne conversation)
  const totalUnreadMessages = realConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#F5F5F0] font-sans text-gray-900">

      {/* ── Left Sidebar ── */}
      <SidebarLeft
        unreadMessages={totalUnreadMessages}
        unreadNotifications={3}
        balance={user?.coinBalance || 0}
        userAvatar={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Main content ── */}
      <main
        className={`flex-1 md:ml-[240px] transition-all duration-300 ${
          activeTab === 'messages' ? 'md:mr-[280px]' : ''
        }`}
      >
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-gray-900 text-sm capitalize">
            {activeTab === 'dashboard' ? 'Accueil' :
             activeTab === 'profile' ? 'Profil' :
             activeTab === 'media' ? 'Médias' :
             activeTab === 'messages' ? 'Messages' :
             activeTab === 'requests' ? 'Demandes' :
             activeTab === 'settings' ? 'Paramètres' : ''}
          </span>
          {activeTab === 'messages' && (
            <button
              onClick={() => setIsSidebarRightOpen(true)}
              className="ml-auto p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Liste des clients"
            >
              <Menu size={22} />
            </button>
          )}
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/media" element={<Media />} />
          <Route path="/messages" element={
            <Messages
              selectedConversationId={selectedConversationId}
              realConversations={realConversations}
              onSelectConversation={setSelectedConversationId}
              onOpenClientList={() => setIsSidebarRightOpen(true)}
            />
          } />
          <Route path="/requests" element={<Requests />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ── Right Sidebar ── */}
      <SidebarRight
        activeTab={activeTab}
        realConversations={realConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        isMobileOpen={isSidebarRightOpen}
        onMobileClose={() => setIsSidebarRightOpen(false)}
      />
    </div>
  );
}

