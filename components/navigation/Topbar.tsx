"use client";

import {
  Search,
  Flame,
  Home,
  ChevronRight,
  Menu,
} from "lucide-react";
import { FaLink } from "react-icons/fa";
import { BsFillChatDotsFill } from "react-icons/bs";
import { GiPartyPopper } from "react-icons/gi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Logo from "@/assets/appcombohallogo.svg";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import NotificationPopover from "../NotificationPopover";

export default function Topbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("cameron");
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  const getCurrentSection = () => {
    if (pathname.startsWith("/social")) return "social";
    if (pathname.startsWith("/messenger")) return "messenger";
    if (pathname.startsWith("/events")) return "events";
    if (
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/market-vendor")
    )
      return "marketplace";
    return "social";
  };

  const currentSection = getCurrentSection();

  const navigationItems = [
    {
      key: "social",
      icon: Flame,
      href: "/home",
      label: "Social Media",
    },
    {
      key: "messenger",
      icon: BsFillChatDotsFill,
      href: "/messenger/chats",
      label: "Messages",
    },
    {
      key: "events",
      icon: GiPartyPopper,
      href: "/events/event",
      label: "Events",
    },
    {
      key: "marketplace",
      icon: Home,
      href: "/marketplace/homes",
      label: "Marketplace",
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleCreateNewAccount = () => {
    console.log("Create new account clicked");
    setIsProfilePopoverOpen(false);
  };

  const handleAddExistingAccount = () => {
    console.log("Add existing account clicked");
    setIsProfilePopoverOpen(false);
  };

  return (
    <header className="bg-white text-gray-900 border-b border-gray-200 h-16 flex items-center px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => router.push("/social/home")}
          >
            <Image
              src={Logo}
              alt="AppComboHal Logo"
              width={48}
              height={48}
              className="w-12 h-12"
              style={{ objectFit: "contain" }}
              priority
            />
          </Button>

          {/* Desktop Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="pl-4 pr-12 py-2 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[200px] md:w-[240px] lg:w-[276px] h-[40px] border border-gray-200"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full p-1.5">
              <Search className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={toggleMobileSearch}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Center Navigation Icons (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-center flex-1 space-x-6">
          {navigationItems.map((item) => {
            const isActive = currentSection === item.key;
            return (
              <Button
                key={item.key}
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                onClick={() => handleNavigation(item.href)}
                title={item.label}
              >
                <item.icon className="h-6 w-6" />
              </Button>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <NotificationPopover />

          <Popover
            open={isProfilePopoverOpen}
            onOpenChange={setIsProfilePopoverOpen}
          >
            <PopoverTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1">
                <div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 shrink-0">
                    <Image
                      src="/profilepic.jpg"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-medium truncate max-w-[120px] md:max-w-[150px]">
                    Cameron Willi...
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-[150px]">
                    @Ariene_mcCoy
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block shrink-0" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
              <div className="p-4">
                {/* Current Account */}
                <div
                  className="flex items-center space-x-3 mb-4 cursor-pointer"
                  onClick={() => setSelectedAccount("cameron")}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                    <Image
                      src="/profilepic.jpg"
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Cameron Williamson
                    </p>
                    <p className="text-sm text-gray-500">@Arlene_McCoy</p>
                  </div>
                  <FaLink className="h-5 w-5 text-black cursor-pointer hover:text-gray-600 mr-2" />
                  <div
                    className={`rounded-full w-5 h-5 flex items-center justify-center ${
                      selectedAccount === "cameron"
                        ? "bg-green-500"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {selectedAccount === "cameron" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center space-x-3 mb-6 cursor-pointer"
                  onClick={() => setSelectedAccount("lucas")}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                    <Image
                      src="/Rectangle 2.png"
                      alt="Lucas Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Lucas Jigsu</p>
                    <p className="text-sm text-gray-500">@Lucas_Jigsu</p>
                  </div>
                  <FaLink className="h-5 w-5 text-black cursor-pointer hover:text-gray-600 mr-2" />
                  <div
                    className={`rounded-full w-5 h-5 flex items-center justify-center ${
                      selectedAccount === "lucas"
                        ? "bg-green-500"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {selectedAccount === "lucas" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateNewAccount}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3"
                  >
                    Create a new account
                  </Button>
                  <Button
                    onClick={handleAddExistingAccount}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full py-3"
                  >
                    Add an existing account
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 sm:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full pl-4 pr-12 py-3 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full p-1.5">
              <Search className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
