import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../lib/constants';

export default function Layout() {
  const location = useLocation();
  
  // Find current page title
  const currentSection = NAV_ITEMS.find(section => 
    section.items.some(item => item.path === location.pathname)
  );
  const currentItem = currentSection?.items.find(item => item.path === location.pathname);
  const title = currentItem?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Topbar title={title} />
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
