"use client";

import MarketplaceSidebar from '@/components/navigation/sidebars/MarketplaceSidebar';
import MobileSidebar from '@/components/navigation/MobileSidebar';
import Topbar from '@/components/navigation/Topbar';
import { ReactNode, useState } from 'react';

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
      
      {/* Desktop Sidebar */}
      <MarketplaceSidebar 
        isCollapsed={isDesktopSidebarCollapsed} 
        onToggleCollapse={toggleDesktopSidebar}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isDesktopSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[240px]'
      }`}>
        <Topbar onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 px-4 lg:px-6 pb-6 pt-20 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}