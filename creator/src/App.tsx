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
import { CURRENT_USER, CONVERSATIONS } from '@/data/mockData';
import { Menu } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Afficher un loader pendant la vérification
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

  // Si pas authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => window.location.reload()} />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(CONVERSATIONS[0]?.userId || null);

  // Mobile overlay states
  const [isSidebarOpen, setIsSidebarOpen]           = useState(false);
  const [isSidebarRightOpen, setIsSidebarRightOpen] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;
  const activeTab = currentPath === '/' ? 'dashboard' : currentPath.substring(1).split('/')[0];

  return (
    <div className="flex min-h-screen bg-[#F5F5F0] font-sans text-gray-900">

      {/* ── Left Sidebar ── */}
      <SidebarLeft
        unreadMessages={2}
        unreadNotifications={3}
        balance={user?.balance || 0}
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
          {/* Right hamburger (Messages only) — on mobile topbar too */}
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
              conversations={CONVERSATIONS}
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
        conversations={CONVERSATIONS}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        isMobileOpen={isSidebarRightOpen}
        onMobileClose={() => setIsSidebarRightOpen(false)}
      />
    </div>
  );
}
