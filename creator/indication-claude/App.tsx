import { useState } from 'react';
import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import { Dashboard } from '@/components/Dashboard';
import { Profile } from '@/components/Profile';
import { Media } from '@/components/Media';
import { Messages } from '@/components/Messages';
import { Requests } from '@/components/Requests';
import { Settings } from '@/components/Settings';
import { CURRENT_USER, CONVERSATIONS } from '@/data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(CONVERSATIONS[0]?.userId || null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'media':
        return <Media />;
      case 'messages':
        return <Messages selectedConversationId={selectedConversationId} conversations={CONVERSATIONS} onSelectConversation={setSelectedConversationId} />;
      case 'requests':
        return <Requests />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F0] font-sans text-gray-900">
      <SidebarLeft 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadMessages={2}
        unreadNotifications={3}
        balance={CURRENT_USER.balance}
        userAvatar={CURRENT_USER.avatar}
      />

      <main 
        className={`flex-1 ml-0 md:ml-[72px] transition-all duration-300 ${
          activeTab === 'messages' ? 'md:mr-[280px]' : ''
        }`}
      >
        {renderContent()}
      </main>

      <SidebarRight 
        activeTab={activeTab}
        conversations={CONVERSATIONS}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />
    </div>
  );
}
