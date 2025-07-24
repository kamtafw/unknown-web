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
  Flame,
  // MessageSquare,
  // PartyPopper,
  ChevronDown,
  ChevronRight,
  X,
  MessageCircle,
  Users,
  Video,
  Phone,
  Heart,
  ShoppingCart,
  Bell,
  User,
  Package,
//   History,
//   ShoppingBag,
  Calendar,
  Camera,
} from "lucide-react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { GiPartyPopper } from "react-icons/gi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function MobileSidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen?: boolean; 
  onClose?: () => void 
}) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen &&
        onClose
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setOpenDropdowns({});
    }
  }, [isOpen]);

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 1024) { 
      onClose();
    }
  };

  const mobileNavItems = [
    {
      key: "social",
      title: "Social Media",
      icon: Flame,
      items: [
        { href: "/home", label: "Home", icon: Home },
        { href: "/settings", label: "Settings", icon: Settings },
        { href: "/bookmark", label: "Bookmark", icon: Bookmark },
        { href: "/appscombo-ai", label: "AppsCombo AI", icon: Bot },
        { href: "/invite", label: "Invite a Friend", icon: UserPlus },
        { href: "/create-post", label: "Create Post", icon: Plus },
        { href: "/logout", label: "Logout", icon: LogOut },
      ]
    },
    {
      key: "messenger",
      title: "Messages",
      icon: BsFillChatDotsFill ,
      items: [
        { href: "/messenger/chats", label: "Chats", icon: MessageCircle },
        { href: "/messenger/groups", label: "Groups", icon: Users },
        { href: "/messenger/live", label: "Live", icon: Video },
        { href: "/messenger/status", label: "Status", icon: Camera },
        { href: "/messenger/calls", label: "Calls", icon: Phone },
        { href: "/messenger/settings", label: "Settings", icon: Settings },
        { href: "/logout", label: "Logout", icon: LogOut },
      ]
    },
    {
      key: "events",
      title: "Events",
      icon: GiPartyPopper,
      items: [
        { href: "/events/event", label: "Event", icon: Calendar },
      ]
    },
    {
      key: "marketplace",
      title: "Marketplace",
      icon: Home,
      items: [
        { href: "/marketplace/homes", label: "Home", icon: Home },
        { href: "/marketplace/liked", label: "Liked", icon: Heart },
        { href: "/marketplace/account", label: "Account", icon: User },
        { href: "/marketplace/cart", label: "Cart", icon: ShoppingCart },
        { href: "/marketplace/alerts", label: "Alerts", icon: Bell },
        { href: "/market-vendor/goods", label: "Vendor Dashboard", icon: Package },
        { href: "/logout", label: "Logout", icon: LogOut },
      ]
    }
  ];

  return (
    <>
      <aside 
        ref={sidebarRef}
        className={cn(
          "bg-white h-screen fixed top-16 left-0 z-40 shadow-lg flex flex-col transition-transform duration-300 ease-in-out border-r border-gray-200",
          "lg:hidden",
          "w-[280px] sm:w-[320px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Mobile Navigation with Dropdowns */}
            <div className="space-y-2">
              {mobileNavItems.map((navItem) => (
                <div key={navItem.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleDropdown(navItem.key)}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <navItem.icon className="w-5 h-5 mr-3 text-blue-400" />
                      <span className="text-gray-700">{navItem.title}</span>
                    </div>
                    {navItem.items.length > 0 && (
                      openDropdowns[navItem.key] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )
                    )}
                  </button>
                  
                  {openDropdowns[navItem.key] && navItem.items.length > 0 && (
                    <div className="bg-white border-t border-gray-100">
                      {navItem.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-b-0 transition-colors",
                            item.href.includes("/create") || item.href.includes("/list-product")
                              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                              : item.href === "/logout"
                              ? "text-red-600 hover:bg-red-50"
                              : pathname === item.href
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <item.icon 
                            className={cn(
                              "w-5 h-5 mr-3",
                              item.href.includes("/create") || item.href.includes("/list-product")
                                ? "text-blue-600"
                                : item.href === "/logout"
                                ? "text-red-600"
                                : pathname === item.href 
                                ? "text-white" 
                                : "text-blue-600"
                            )} 
                          />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}