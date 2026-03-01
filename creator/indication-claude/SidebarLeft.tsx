import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Home,
  User,
  Image as ImageIcon,
  MessageSquare,
  ClipboardList,
  Bell,
  Settings,
  Euro,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

interface SidebarLeftProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessages: number;
  unreadNotifications: number;
  balance: number;
  userAvatar: string;
}

export function SidebarLeft({
  activeTab,
  onTabChange,
  unreadMessages,
  unreadNotifications,
  balance,
  userAvatar,
}: SidebarLeftProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'media', label: 'Médias', icon: ImageIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'requests', label: 'Demandes', icon: ClipboardList },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-[72px] h-screen bg-[#1A1A1A] flex-col items-center py-6 fixed left-0 top-0 z-50 shadow-xl">
      {/* Logo */}
      <div className="mb-8 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
        B
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto",
                isActive
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
              title={item.label}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Badge */}
              {item.badge ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#1A1A1A]">
                  {item.badge}
                </span>
              ) : null}

              {/* Tooltip */}
              <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-gray-700">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 items-center w-full px-2 mt-auto">
        {/* Revenue Widget */}
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex flex-col items-center justify-center text-[10px] font-bold cursor-help group relative border border-emerald-500/20">
          <Euro size={18} />
          <div className="absolute left-14 bottom-0 bg-gray-900 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-gray-700 shadow-xl">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Revenus du mois</p>
            <p className="text-xl font-bold text-emerald-400">{balance.toLocaleString('fr-FR')} €</p>
          </div>
        </div>

        {/* Avatar */}
        <button 
          onClick={() => onTabChange('settings')}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 hover:border-white transition-colors"
        >
          <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>

    {/* ── Mobile bottom nav ── */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-white/10 flex items-center justify-around px-2 py-2 safe-area-pb">
      {navItems.slice(0, 5).map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
              isActive ? "text-white" : "text-gray-500"
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-medium">{item.label.split(' ')[0]}</span>
            {item.badge ? (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
