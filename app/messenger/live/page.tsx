"use client";

import { useState } from "react";
import Image from "next/image";
import { Live } from "./listeners/Live";
import { LiveListening } from "./listeners/LiveListening";
import { HostLive } from "./host/HostLive";
import { HostListeners } from "./host/HostListeners";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isHosting, setIsHosting] = useState(false);
  const [isHostingActive, setIsHostingActive] = useState(false);
  const [sessionData, setSessionData] = useState<{
    title: string;
    description: string;
    tags: string[];
  } | null>(null);
  const [hostSessionData, setHostSessionData] = useState<{
    title: string;
    description: string;
    tags: string[];
    visibility: string;
    isScheduled: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
  } | null>(null);

  const handleStartListening = (data: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    setSessionData(data);
    setIsListening(true);
    setIsHosting(false);
    setIsHostingActive(false);
  };

  const handleStartHosting = (data: {
    title: string;
    description: string;
    tags: string[];
    visibility: string;
    isScheduled: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
  }) => {
    setHostSessionData(data);
    setIsHosting(true);
    setIsListening(false);
    setIsHostingActive(false);
  };

  const handleHostJoin = () => {
    if (hostSessionData) {
      const sessionForHost = {
        title: hostSessionData.title,
        description: hostSessionData.description,
        tags: hostSessionData.tags,
      };
      setSessionData(sessionForHost);
      setIsHostingActive(true);
    }
  };

  const handleLeave = () => {
    setIsListening(false);
    setSessionData(null);
  };

  const handleEndHosting = () => {
    setIsHostingActive(false);
    setSessionData(null);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[480px] border-r bg-white overflow-hidden mr-6">
        {isHosting ? (
          <HostLive
            onStartHosting={handleStartHosting}
            onJoin={handleHostJoin}
          />
        ) : (
          <Live
            onStartListening={handleStartListening}
            onStartHosting={handleStartHosting}
          />
        )}
      </div>
      <div
        className={`w-2/3 ${
          isListening || isHostingActive
            ? ""
            : " flex flex-col items-center justify-center"
        }`}
      >
        {isListening && sessionData ? (
          <LiveListening sessionData={sessionData} onLeave={handleLeave} />
        ) : isHostingActive && sessionData ? (
          <HostListeners sessionData={sessionData} onLeave={handleEndHosting} />
        ) : (
          <>
            <Image
              src="/appcombo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="mb-4 object-contain"
            />
            <p className="text-lg text-gray-600">
              You have not joined any live yet
            </p>
          </>
        )}
      </div>
    </div>
  );
}
