import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS, CURRENT_USER } from '../lib/constants';
import { clsx } from 'clsx';
import { LogOut } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[240px] bg-[#18181b] text-white flex flex-col h-screen fixed left-0 top-0 z-50 shadow-xl hidden lg:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="font-bold text-xl tracking-tight">BI Admin</span>
        <span className="ml-2 text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">v1.0</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        {NAV_ITEMS.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3 px-3">
              {section.label}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative",
                        isActive 
                          ? "bg-white/10 text-white font-medium" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon size={18} className={clsx(isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 bg-[#18181b]">
        <div className="flex items-center gap-3 px-2 mb-3">
          <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{CURRENT_USER.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <p className="text-xs text-gray-400 truncate">{CURRENT_USER.role}</p>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:text-white transition-colors w-full">
          <LogOut size={14} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
