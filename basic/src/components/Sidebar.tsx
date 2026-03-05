import React from 'react';
import { 
  Settings, 
  LogOut, 
  BarChart2, 
  Send, 
  Bell, 
  Compass, 
  Grid,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Instagram
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onNavigate: (path: string) => void;
}

export const Sidebar = ({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen, onNavigate }: SidebarProps) => {
  const { logout } = useAuth();
  
  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    } else if (!collapsed) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Placeholder pour réserver l'espace de la sidebar rétractée dans le flux (Desktop only) */}
      <div className="w-20 flex-shrink-0 hidden md:block" />

      <div 
        className={`
          h-screen fixed left-0 top-0 flex flex-col bg-gradient-to-b from-[#FFF5E1] via-[#FFE1E1] to-[#FAD0F3] 
          text-gray-800 shadow-xl z-50 transition-all duration-300
          ${mobileMenuOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-20 md:p-4' : 'md:w-80 md:p-8'}
          w-80 p-8
        `}
      >
        {/* Toggle Button (Desktop only) */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50 z-50 hidden md:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo */}
        <div className={`mb-10 flex ${collapsed ? 'md:justify-center' : ''}`}>
          {collapsed ? (
            <>
              <img src="/logo.png" alt="Basic Instinct" className="hidden md:block w-10 h-10 object-contain" />
              <img src="/logo.png" alt="Basic Instinct" className="md:hidden h-10 object-contain" />
            </>
          ) : (
            <img src="/logo.png" alt="Basic Instinct" className="h-14 object-contain" />
          )}
        </div>



        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <NavItem icon={<Grid size={20} />} label="Feed" active collapsed={collapsed} onClick={() => { onNavigate('/'); handleItemClick(); }} />
          <NavItem icon={<Compass size={20} />} label="Explore" collapsed={collapsed} onClick={() => { onNavigate('/explore'); handleItemClick(); }} />
          <NavItem icon={<Bell size={20} />} label="Notifications" collapsed={collapsed} onClick={() => { onNavigate('/notifications'); handleItemClick(); }} />
          <NavItem icon={<Send size={20} />} label="Messages" collapsed={collapsed} onClick={() => { onNavigate('/messages'); handleItemClick(); }} />
          <NavItem icon={<BarChart2 size={20} />} label="Acheter 🪙" collapsed={collapsed} onClick={() => { onNavigate('/credits'); handleItemClick(); }} />
          <NavItem icon={<Settings size={20} />} label="Settings" collapsed={collapsed} onClick={() => { onNavigate('/settings'); handleItemClick(); }} />
          <NavItem icon={<LogOut size={20} />} label="Logout" collapsed={collapsed} onClick={() => { logout(); handleItemClick(); }} />
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-300/30">
          <button 
            onClick={() => { logout(); handleItemClick(); }}
            className={`flex items-center gap-4 text-gray-700 hover:text-black transition-colors px-4 py-2 w-full ${collapsed ? 'md:justify-center' : ''}`}
          >
            <LogOut size={20} />
            <span className={`font-medium ${collapsed ? 'md:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, active = false, collapsed = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, collapsed?: boolean, onClick?: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all duration-200 ${
        active 
          ? 'text-[#E1306C] font-bold bg-white/40 shadow-sm' 
          : 'text-gray-700 hover:bg-white/20 hover:text-black'
      } ${collapsed ? 'md:justify-center' : ''}`}
      title={collapsed ? label : ''}
    >
      <span className={active ? 'text-[#E1306C]' : ''}>{icon}</span>
      <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
    </button>
  );
};
