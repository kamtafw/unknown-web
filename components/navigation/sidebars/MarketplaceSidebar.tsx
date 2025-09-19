"use client";

import { cn } from "@/lib/utils";
import { Home, Heart, User, ShoppingCart, Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function MarketplaceSidebar({
  isCollapsed = false,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/marketplace/homes", label: "Homes", icon: Home },
    { href: "/marketplace/liked", label: "Liked", icon: Heart },
    { href: "/marketplace/account", label: "Account", icon: User },
    { href: "/marketplace/cart", label: "Cart", icon: ShoppingCart },
    { href: "/marketplace/alerts", label: "Alerts", icon: Bell },
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

            {/* Vendor Dashboard Button */}
            <div className="pt-4">
              <Link
                href="/market-vendor/setup"
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 group",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? "Vendor Dashboard" : undefined}
              >

                <div
                  className={cn(
                    "w-full h-auto overflow-hidden bg-green-200 flex items-center justify-center",
                    isCollapsed ? "mr-0" : "mr-3"
                  )}
                >
                  <Image
                    src="/marketvendor.png"
                    alt="Vendor"
                    width={500}
                    height={0} 
                    className="w-full h-auto object-cover"
                  />
                </div>
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
        <div
          className={cn(
            "w-2 h-2 border-r-2 border-b-2 border-gray-400 transform transition-transform",
            isCollapsed ? "rotate-45" : "-rotate-135"
          )}
        />
      </button>
    </aside>
  );
}
