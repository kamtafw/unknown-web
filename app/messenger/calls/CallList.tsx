"use client";

import { useState } from "react";
import {
  EllipsisVertical,
  Search,
  Phone,
  Video,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VideoCallPopup } from "./VideoCallPopup";
import { VoiceCallPopup } from "./VoiceCallPopup";

interface Call {
  id: string;
  name: string;
  avatar: string;
  date: string;
  time: string;
  type: "video" | "audio";
  direction: "incoming" | "outgoing";
  status: "answered" | "missed";
}

const calls: Call[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    date: "30 October",
    time: "11:02",
    type: "video",
    direction: "outgoing",
    status: "answered",
  },
  {
    id: "2",
    name: "Cameron Guy",
    avatar: "/Rectangle 1.png",
    date: "30 November",
    time: "11:02",
    type: "audio",
    direction: "outgoing",
    status: "missed",
  },
  {
    id: "3",
    name: "Mike Davis",
    avatar: "/Rectangle 2.png",
    date: "24 November",
    time: "14:15",
    type: "audio",
    direction: "incoming",
    status: "missed",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    avatar: "/Rectangle 4.png",
    date: "25 November",
    time: "09:30",
    type: "video",
    direction: "incoming",
    status: "answered",
  },
];

export function CallList() {
  const [callsData, setCallsData] = useState(calls);
  const [activeCall, setActiveCall] = useState<{
    contact: { name: string; avatar: string; phone?: string };
    type: "video" | "audio";
  } | null>(null);

  const clearCallLogs = () => {
    setCallsData([]);
  };

  const handleStartCall = (call: Call) => {
    setActiveCall({
      contact: {
        name: call.name,
        avatar: call.avatar,
        phone: "+234 8123456789", 
      },
      type: call.type,
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleCallTypeChange = (newType: "video" | "audio") => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        type: newType,
      });
    }
  };

  const getArrowIcon = (direction: string, status: string) => {
    const isGreen = status === "answered";
    const isRed = status === "missed";

    if (direction === "outgoing") {
      return (
        <ArrowUpRight
          className={`h-4 w-4 ${
            isGreen
              ? "text-green-500"
              : isRed
              ? "text-red-500"
              : "text-gray-500"
          }`}
        />
      );
    } else {
      return (
        <ArrowDownLeft
          className={`h-4 w-4 ${
            isGreen
              ? "text-green-500"
              : isRed
              ? "text-red-500"
              : "text-gray-500"
          }`}
        />
      );
    }
  };

  return (
    <>
      <div className="p-1 h-full flex flex-col ml-3 mr-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mt-3">
          <h2 className="text-xl font-bold">Calls</h2>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <Popover>
              <PopoverTrigger>
                <EllipsisVertical className="h-5 w-5" />
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" onClick={clearCallLogs}>
                    Clear call logs
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Call List */}
        <div className="flex-1 mt-3">
          {callsData.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No call logs available
            </div>
          ) : (
            callsData.map((call) => (
              <div key={call.id} className="flex items-center gap-3 py-3">
                <div className="relative">
                  <Image
                    src={call.avatar}
                    alt={call.name}
                    width={60}
                    height={60}
                    className="h-15 w-15 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{call.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getArrowIcon(call.direction, call.status)}
                    <p className="text-sm text-gray-500">
                      {call.date} {call.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {call.type === "video" ? (
                    <button
                      onClick={() => handleStartCall(call)}
                      className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      title={`Start video call with ${call.name}`}
                    >
                      <Video className="h-5 w-5 text-gray-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartCall(call)}
                      className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      title={`Start audio call with ${call.name}`}
                    >
                      <Phone className="h-5 w-5 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Call Components */}
      {activeCall && activeCall.type === "video" && (
        <VideoCallPopup
          isOpen={!!activeCall}
          onClose={handleEndCall}
          onEndCall={handleEndCall}
          contact={activeCall.contact}
          onCallTypeChange={handleCallTypeChange}
        />
      )}

      {activeCall && activeCall.type === "audio" && (
        <VoiceCallPopup
          isOpen={!!activeCall}
          onClose={handleEndCall}
          onEndCall={handleEndCall}
          contact={activeCall.contact}
          onCallTypeChange={handleCallTypeChange}
        />
      )}
    </>
  );
}
