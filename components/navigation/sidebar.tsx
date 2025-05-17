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

export default function Sidebar() {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);

  return (
    <aside className="bg-white mt-4 h-screen fixed top-[68px] left-0 z-60 shadow-md flex flex-col min-h-screen">
      <nav className="pt-1 ml-5 flex-1 bg-gray-50">
        <div className="w-[192px] border-none mx-auto">
          <Link
            href="/home"
            className={cn(
              "flex items-center px-4 py-4 text-sm font-medium border border-transparent rounded-md mb-1 w-full",
              pathname === "/home"
                ? "bg-[#6A88D1] text-white"
                : "hover:bg-[#425483]  hover:text-accent-foreground"
            )}
          >
            <Home
              className={cn(
                "w-5 h-5 mr-3",
                pathname === "/home" ? "text-white" : "text-gray-800"
              )}
            />
            Home
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center px-4 py-4 text-sm font-medium border border-transparent rounded-md mb-1 w-full",
              pathname === "/settings"
                ? "bg-[#6A88D1] text-white"
                : "hover:bg-[#425483]  hover:text-accent-foreground"
            )}
          >
            <Settings
              className={cn(
                "w-5 h-5 mr-3",
                pathname === "/settings" ? "text-white" : "text-gray-800"
              )}
            />
            Settings
          </Link>
          <Link
            href="/bookmark"
            className={cn(
              "flex items-center px-4 py-4 text-sm font-medium border border-transparent rounded-md mb-1 w-full",
              pathname === "/bookmark"
                ? "bg-[#6A88D1] text-white"
                : "hover:bg-[#425483] hover:text-accent-foreground"
            )}
          >
            <Bookmark
              className={cn(
                "w-5 h-5 mr-3",
                pathname === "/bookmark" ? "text-white" : "text-gray-800"
              )}
            />
            Bookmark
          </Link>
          <Link
            href="/appscombo-ai"
            className={cn(
              "flex items-center px-4 py-4 text-sm font-medium border border-transparent rounded-md mb-1 w-full",
              pathname === "/appscombo-ai"
                ? "bg-[#6A88D1] text-white"
                : "hover:bg-[#425483]  hover:text-accent-foreground"
            )}
          >
            <Bot
              className={cn(
                "w-5 h-5 mr-3",
                pathname === "/appscombo-ai" ? "text-white" : "text-gray-800"
              )}
            />
            AppsCombo AI
          </Link>
          <Link
            href="/invite"
            className={cn(
              "flex items-center px-4 py-4 text-sm font-medium border border-transparent rounded-md mb-1 w-full",
              pathname === "/invite"
                ? "bg-[#6A88D1] text-white"
                : "hover:bg-[#425483]  hover:text-accent-foreground"
            )}
          >
            <UserPlus
              className={cn(
                "w-5 h-5 mr-3",
                pathname === "/invite" ? "text-white" : "text-gray-800"
              )}
            />
            Invite a Friend
          </Link>
          <Link href="/create-post">
            <div
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium bg-gray-100 text-[#6A88D1] hover:bg-[#425483]  border border-transparent rounded-md mb-[82px] w-full",
                pathname === "/create-post" ? "bg-[#6A88D1] text-white" : ""
              )}
            >
              <Plus
                className={cn(
                  "w-5 h-5 mr-3 ml-4",
                  pathname === "/create-post" ? "text-white" : "text-gray-800"
                )}
              />
              Create Post
            </div>
          </Link>
        </div>
        <Link href="/logout">
          <div
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium hover:bg-[#425483] mt-4 w-full text-[#EA5757]",
              "mt-auto"
            )}
          >
            <LogOut className="w-5 h-5 mr-3 ml-4 text-[#EA5757]" />
            Logout
          </div>
        </Link>
      </nav>
    </aside>
  );
}
