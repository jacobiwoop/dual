import { Search, MessageCircle, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onToggleChat: () => void;
  onNavigateCredits?: () => void;
}

export const Header = ({ onOpenMobileMenu, onToggleChat }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between py-6 px-8 h-[92px] border-b border-gray-100 bg-white sticky top-0 z-10">

      {/* Gauche : burger (mobile) + nom */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        <span className="text-xl font-bold tracking-tight whitespace-nowrap">
          <span className="text-gray-900">Basic</span>{' '}
          <span className="text-gray-500">Instinct</span>
        </span>
      </div>

      {/* Logo centré — mobile seulement */}
      <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
        <img src="/logo.png" alt="Basic Instinct" className="h-10 object-contain" />
      </div>

      {/* Droite : tous les boutons */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">

        {/* Coins */}
        <button
          onClick={() => navigate('/credits')}
          className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <span className="text-base leading-none">🪙</span>
          <span>850</span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Search size={22} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <User size={22} className="text-gray-600" />
        </button>
        <button
          onClick={onToggleChat}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <MessageCircle size={22} className="text-gray-600" />
          <span className="absolute top-2 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </button>
      </div>

    </header>
  );
};
