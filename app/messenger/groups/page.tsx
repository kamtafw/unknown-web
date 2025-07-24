"use client";

import { useState } from "react";
import Image from "next/image";
import { GroupList } from "./GroupList";
import { Community } from "./CommunityList";

export default function Home() {
  const [activeView, setActiveView] = useState("groups");

  return (
   <div className="flex min-h-screen">
      <div className="w-[480px] border-r bg-white overflow-hidden">
        {activeView === "groups" ? (
          <GroupList onTabChange={setActiveView} />
        ) : (
          <Community onTabChange={setActiveView} />
        )}
      </div>
      <div className="w-2/3 flex flex-col items-center justify-center">
        <Image
          src="/appcombo.svg" 
          alt="Logo"
          width={50}
          height={50}
          className="mb-4 object-contain"
        />
        <p className="text-lg text-gray-600">
          Send and receive messages with your laptop
        </p>
      </div>
    </div>
  );
}