"use client";

import MobileSidebar from "@/components/navigation/MobileSidebar";
import Topbar from "@/components/navigation/Topbar";
import { ReactNode, useState } from "react";

export default function EventsLayout({ children }: { children: ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />
        <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-[240px]">
        <Topbar onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 px-4 lg:px-6 pb-6 pt-20 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
