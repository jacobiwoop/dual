import React from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import { CURRENT_USER } from '../lib/constants';

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Profile Dropdown Trigger */}
        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-colors">
          <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 leading-none">{CURRENT_USER.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-none">{CURRENT_USER.role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 hidden md:block" />
        </button>
      </div>
    </header>
  );
}
