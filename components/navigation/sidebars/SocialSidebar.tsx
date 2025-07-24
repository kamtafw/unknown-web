"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  Bookmark,
  Bot,
  UserPlus,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SocialSidebar() {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/bookmark", label: "Bookmark", icon: Bookmark },
    { href: "/appscombo-ai", label: "AppsCombo AI", icon: Bot },
    { href: "/invite", label: "Invite a Friend", icon: UserPlus },
  ];

  return (
    <aside 
      className={cn(
        "bg-white h-screen fixed top-16 left-0 z-30 shadow-lg flex-col border-r border-gray-200 hidden lg:flex w-[240px]"
      )}
    >
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 mr-3",
                    pathname === item.href ? "text-white" : "text-blue-600"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-4">
              <Link
                href="/create-post"
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 group",
                  pathname === "/create-post" ? "bg-blue-600 text-white" : ""
                )}
              >
                <Plus
                  className={cn(
                    "w-5 h-5 shrink-0 mr-3",
                    pathname === "/create-post" ? "text-white" : "text-blue-600"
                  )}
                />
                <span>Create Post</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-gray-200">
          <Link
            href="/logout"
            className="flex items-center px-4 py-3 text-sm font-2 medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <LogOut className="w-5 h-5 text-red-600 shrink-0 mr-3" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}