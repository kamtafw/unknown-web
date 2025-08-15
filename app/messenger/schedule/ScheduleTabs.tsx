"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessagesTab } from "./MessagesTab";
import { ReminderTab } from "./ReminderTab";
import { CallTab } from "./CallTab";

export function ScheduleTabs() {
  const [activeTab, setActiveTab] = useState<"messages" | "reminder" | "call">("messages");

  const tabs = [
    { id: "messages", label: "Messages" },
    { id: "reminder", label: "Reminder" },
    { id: "call", label: "Call" },
  ];

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Your Schedules</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-green-900 rounded-full bg-gray-300 py-1 px-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "messages" | "reminder" | "call")}
            className={cn(
              "flex-1 py-1 px-4 text-center text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-black border-2 rounded-full bg-white"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "reminder" && <ReminderTab />}
        {activeTab === "call" && <CallTab />}
      </div>
    </div>
  );
}