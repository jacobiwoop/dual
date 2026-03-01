import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import {
  Home,
  User,
  Image as ImageIcon,
  MessageSquare,
  BookOpen,
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
  // Mobile overlay
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarLeft({
  activeTab,
  onTabChange,
  unreadMessages,
  unreadNotifications,
  balance,
  userAvatar,
  isOpen = false,
  onClose,
}: SidebarLeftProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard',     label: 'Dashboard',    icon: Home },
    { id: 'profile',      label: 'Profil',        icon: User },
    { id: 'media',        label: 'Médias',         icon: ImageIcon },
    { id: 'messages',     label: 'Messages',       icon: MessageSquare, badge: unreadMessages },
    { id: 'library',      label: 'Bibliothèque',   icon: BookOpen },
    { id: 'requests',     label: 'Demandes',       icon: ClipboardList },
    { id: 'notifications',label: 'Notifications',  icon: Bell, badge: unreadNotifications },
    { id: 'settings',     label: 'Paramètres',    icon: Settings },
  ];

  const handleNav = (id: string) => {
    onTabChange(id);
    onClose?.();
  };

  const sidebar = (
    <div className="w-[240px] h-full bg-[#1A1A1A] flex flex-col items-stretch py-6 shadow-xl relative text-left">
      {/* Close button (mobile only) */}
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      )}

      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
          B
        </div>
        <span className="text-white font-bold text-xl">Instinct</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "relative group w-full h-12 rounded-xl flex items-center px-4 transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white shadow-inner font-semibold"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200 font-medium"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0 mr-3" />
              <span className="truncate">{item.label}</span>

              {/* Badge */}
              {item.badge ? (
                <span className="ml-auto w-6 h-6 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full shadow-md">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3 w-full px-4 mt-auto">
        {/* Revenue Widget */}
        <div className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 transition-colors hover:bg-emerald-500/15">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5"><Euro size={12}/> Revenus (Mois)</p>
          <p className="text-xl font-bold text-emerald-400">{balance.toLocaleString('fr-FR')} €</p>
        </div>

        {/* Profile Card */}
        <button
          onClick={() => handleNav('settings')}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-800 text-left"
        >
          <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Mon Espace</p>
            <p className="text-xs text-gray-500 truncate">Créateur actif</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible fixed sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-[240px] z-50">
        {sidebar}
      </div>

      {/* Mobile: overlay drawer */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />
        {/* Sidebar panel */}
        <div
          className={cn(
            "md:hidden fixed left-0 top-0 h-full w-[240px] z-50 transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebar}
        </div>
      </>
    </>
  );
}
