import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatSidebar } from './ChatSidebar';

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeChatId, setActiveChatId]         = useState<string | number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const [isChatOpen, setIsChatOpen]             = useState(window.innerWidth >= 1280);
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen font-sans flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onNavigate={(path) => navigate(path)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onNavigateCredits={() => navigate('/credits')}
        />

        <div className="flex flex-1 relative">
          {/* Outlet = zone qui change selon la route */}
          <main className="flex-1 p-8 pt-0 min-h-[calc(100vh-92px)] overflow-x-hidden">
            <div className="max-w-5xl mx-auto">
              <Outlet context={{ openChat: (id: string | number) => { setActiveChatId(id); setIsChatOpen(true); }, isChatOpen, activeChatId }} />
            </div>
          </main>

          <ChatSidebar
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};
