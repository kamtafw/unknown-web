"use client";

import { cn } from "@/lib/utils";
import {
  Package,
  History,
  Bell,
  ShoppingBag,
  User,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarketVendorSidebar({ 
  isCollapsed = false,
  onToggleCollapse 
}: { 
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/market-vendor/goods", label: "Goods", icon: Package },
    { href: "/market-vendor/history", label: "History", icon: History },
    { href: "/market-vendor/alerts", label: "Alerts", icon: Bell },
    { href: "/market-vendor/orders", label: "Orders", icon: ShoppingBag },
    { href: "/market-vendor/account", label: "Account", icon: User },
  ];

  return (
    <aside 
      className={cn(
        "bg-white h-screen fixed top-16 left-0 z-30 shadow-lg flex-col transition-all duration-300 ease-in-out border-r border-gray-200 hidden lg:flex",
        isCollapsed ? "w-16" : "w-[240px]"
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
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    pathname === item.href ? "text-white" : "text-blue-600",
                    isCollapsed ? "mr-0" : "mr-3"
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
            
            {/* List Product Button */}
            <div className="pt-4">
              <Link
                href="/market-vendor/list-product"
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 group",
                  pathname === "/market-vendor/list-product" ? "bg-green-600 text-white" : "",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? "List Product" : undefined}
              >
                <Plus
                  className={cn(
                    "w-5 h-5 shrink-0",
                    pathname === "/market-vendor/list-product" ? "text-white" : "text-green-600",
                    isCollapsed ? "mr-0" : "mr-3"
                  )}
                />
                {!isCollapsed && <span>List Product</span>}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <Link
            href="/logout"
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group",
              isCollapsed ? "justify-center" : ""
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut 
              className={cn(
                "w-5 h-5 text-red-600 shrink-0",
                isCollapsed ? "mr-0" : "mr-3"
              )} 
            />
            {!isCollapsed && <span>Logout</span>}
          </Link>
        </div>
      </nav>
      
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-50 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className={cn(
          "w-2 h-2 border-r-2 border-b-2 border-gray-400 transform transition-transform",
          isCollapsed ? "rotate-45" : "-rotate-135"
        )} />
      </button>
    </aside>
  );
}