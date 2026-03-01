import { useState } from 'react';
import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import { Dashboard } from '@/components/Dashboard';
import { Profile } from '@/components/Profile';
import { Media } from '@/components/Media';
import { Messages } from '@/components/Messages';
import { Requests } from '@/components/Requests';
import { Settings } from '@/components/Settings';
import { Library } from '@/components/Library';
import { CURRENT_USER, CONVERSATIONS } from '@/data/mockData';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(CONVERSATIONS[0]?.userId || null);

  // Mobile overlay states
  const [isSidebarOpen, setIsSidebarOpen]           = useState(false);
  const [isSidebarRightOpen, setIsSidebarRightOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'media':
        return <Media />;
      case 'messages':
        return (
          <Messages
            selectedConversationId={selectedConversationId}
            conversations={CONVERSATIONS}
            onSelectConversation={setSelectedConversationId}
            onOpenClientList={() => setIsSidebarRightOpen(true)}
          />
        );
      case 'requests':
        return <Requests />;
      case 'library':
        return <Library />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F0] font-sans text-gray-900">

      {/* ── Left Sidebar ── */}
      <SidebarLeft
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadMessages={2}
        unreadNotifications={3}
        balance={CURRENT_USER.balance}
        userAvatar={CURRENT_USER.avatar}
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

        {renderContent()}
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
