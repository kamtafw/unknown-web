"use client";

import { cn } from "@/lib/utils";
import {
  Phone,
  Settings,
  AlignJustify,
  X,
} from "lucide-react";
import { PiChatCircleTextBold } from "react-icons/pi";
import { FaUserGroup } from "react-icons/fa6";
import { IoMdMicrophone } from "react-icons/io";
import { SiCircle } from "react-icons/si";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MessengerSidebar({
  isCollapsed = true,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/messenger/chats", label: "Chats", icon: PiChatCircleTextBold },
    { href: "/messenger/groups", label: "Groups", icon: FaUserGroup },
    { href: "/messenger/live", label: "Live", icon: IoMdMicrophone },
    { href: "/messenger/status", label: "Status", icon: SiCircle },
    { href: "/messenger/calls", label: "Calls", icon: Phone },
    { href: "/messenger/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "bg-white fixed top-16 left-0 z-30 shadow-lg border-r border-gray-200 hidden lg:flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-[240px]"
      )}
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800"></h2>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <AlignJustify className="w-5 h-5 text-gray-600" />
          ) : (
            <X className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.href} className="mt-2">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                    pathname === item.href
                      ? "bg-blue-400 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      pathname === item.href ? "text-white" : "text-blue-black",
                      isCollapsed ? "mr-0" : "mr-3"
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
