"use client";

import {
  Search,
  Flame,
  MessageSquare,
  PartyPopper,
  Home,
  Bell,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/appcombohallogo.svg";

export default function Topbar() {
  return (
    <header className="bg-card text-card-foreground border-b border-border h-16 flex items-center px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[32px] mr-[220.51px]">
          <Button variant="ghost" size="icon">
            <Image
              src={Logo}
              alt="AppComboHal Logo"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </Button>
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="pl-4 pr-12 py-2 rounded-md bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[276px] h-[30px]"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full p-1">
              <Search className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <Flame className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <PartyPopper className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-3 ml-[300px]">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium"></div>
            <div>
              <p className="text-sm font-medium cursor-pointer">
                Cameron Willi...
              </p>
              <p className="text-xs text-muted-foreground cursor-pointer">
                @Ariene_mcCoy
              </p>
            </div>
            <ChevronRight className="h-4 w-4 cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
}


