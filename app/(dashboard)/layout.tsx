import Sidebar from '@/components/navigation/sidebar';
import Topbar from '@/components/navigation/topbar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[216px]">
        <Topbar />
        <main className="flex-1 pr-6 pb-6 pt-20">
          {children || <div>No content available for this route</div>}
        </main>
      </div>
    </div>
  );
}