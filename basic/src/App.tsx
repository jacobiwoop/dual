import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Stories } from './components/Stories';
import { Feed } from './components/Feed';
import { ChatSidebar } from './components/ChatSidebar';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen font-sans flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onNavigate={() => {}}
      />
      
      {/* Right Column: Header + Content/Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
        />
        
        <div className="flex flex-1 relative">
          {/* Main Content Area */}
          <main className="flex-1 p-8 pt-0 min-h-[calc(100vh-92px)] transition-all duration-300 overflow-x-hidden">
            <div className="max-w-5xl mx-auto">
              <Stories />
              <Feed onOpenChat={(id) => {
                setActiveChatId(id);
                setIsChatOpen(true);
              }} isChatActive={!!activeChatId} />
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
}
