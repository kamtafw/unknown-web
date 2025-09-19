"use client";

import { useState } from "react";
import Image from "next/image";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsSoundwave } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import { JoinPopup } from "./JoinPopup";
import { CreateLivePopup } from "../host/CreateLivePop";

interface LiveProps {
  onStartListening: (data: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
  onStartHosting: (data: {
    title: string;
    description: string;
    tags: string[];
    visibility: string;
    isScheduled: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
  }) => void;
}

export function Live({ onStartListening, onStartHosting }: LiveProps) {
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showCreateLivePopup, setShowCreateLivePopup] = useState(false);

  const handleJoinClick = () => {
    setShowJoinPopup(true);
  };

  const handleClosePopup = () => {
    setShowJoinPopup(false);
  };

  const handleMicrophoneClick = () => {
    setShowCreateLivePopup(true);
  };

  const handleCloseCreatePopup = () => {
    setShowCreateLivePopup(false);
  };

  const handleListeningClick = () => {
    const sessionData = {
      title: "Today Today",
      description: "Exploring the future of technology and its impact on daily life",
      tags: ["#Technology", "#Innovation", "#Future", "#AI"]
    };
    onStartListening(sessionData);
  };

  const handleStartListening = (data: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    setShowJoinPopup(false);
    onStartListening(data);
  };

  const handleGoLive = (data: {
    title: string;
    description: string;
    tags: string[];
    visibility: string;
    coHost?: string;
    isScheduled: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
  }) => {
    setShowCreateLivePopup(false);
    onStartHosting(data);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header Section */}
      <div className="p-6 ">
        <div className="flex items-center justify-between mb-4">
          <div className="mb-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold mr-3">Happening Now!</h1>
              <Image
                src="/live.png"
                alt="Live"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <p className="text-gray-600">Voice live going on right now</p>
          </div>

          <div className="relative">
            <button
              onClick={handleMicrophoneClick}
              className="w-15 h-15 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <FaMicrophoneAlt className="text-white text-4xl" />
              <div className="absolute top-1 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-blue-500">
                <span className="text-blue-500 text-sm font-bold">+</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="What are you looking for"
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <IoSearchOutline className="text-white text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Sessions*/}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* First Live Session */}
        <div className="bg-[#2D3B5D] rounded-lg p-4">
          <div className="flex items-start mb-3">
            <div className="relative mr-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src="/Rectangle 1.png"
                  alt="Host"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <BsSoundwave className="text-green-500 text-lg" />
              </div>
            </div>
            <div>
              <p className="text-white text-sm text-[12px]">Host:</p>
              <p className="text-white font-semibold text-[18px]">Devon Lane</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-white text-sm mb-1 text-[18px]">Today Today</p>
            <p className="text-white text-sm mb-3 text-[14px]">
              Lorem ipsum sit amet, consectetur adipiscing elit, sed do eiusmod
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-blue-400 text-sm text-[14px]">
                #Mindset
              </span>
              <span className="text-blue-400 text-sm text-[14px]">#Future</span>
              <span className="text-blue-400 text-sm text-[14px]">#Money</span>
              <span className="text-blue-400 text-sm text-[14px]">#Invest</span>
            </div>
          </div>
          <div className=" -mx-4 -mb-4 flex items-center justify-between p-5 rounded-b-lg border-t border-gray-600 bg-[#1E2B47] ">
            <div className="flex items-center">
              <div className="flex -space-x-5 mr-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="/Rectangle 2.png"
                    alt="Listener"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="/Rectangle 2.png"
                    alt="Listener"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="/Rectangle 2.png"
                    alt="Listener"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-white text-sm">200+ listening</span>
            </div>
            <button
              onClick={handleJoinClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Join
            </button>
          </div>
        </div>

        {/* Second Live Session */}
        <div className="bg-[#2D3B5D] rounded-lg p-4">
          <div className="flex items-start mb-3">
            <div className="relative mr-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src="/Rectangle 4.png"
                  alt="Host"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <BsSoundwave className="text-green-500 text-xs" />
              </div>
            </div>
            <div>
              <p className="text-white text-sm text-[12px]">Host:</p>
              <p className="text-white font-semibold text-[18px]">Sarah Chen</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-gray-300 text-sm mb-1 text-[18px]">
              Today Today
            </p>
            <p className="text-white text-sm mb-3 text-[14px]">
              Exploring the future of technology and its impact on daily life
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-blue-400 text-sm text-[14px]">
                #Technology
              </span>
              <span className="text-blue-400 text-sm text-[14px]">
                #Innovation
              </span>
              <span className="text-blue-400 text-sm text-[14px]">#Future</span>
              <span className="text-blue-400 text-sm text-[14px]">#AI</span>
            </div>
          </div>
          <div className=" -mx-4 -mb-4 flex items-center justify-between p-5 rounded-b-lg border-t border-gray-600 bg-[#1E2B47] ">
            <div className="flex items-center">
              <div className="flex -space-x-5 mr-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="/Rectangle 2.png"
                    alt="Listener"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="/Rectangle 2.png"
                    alt="Listener"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src="/Rectangle 2.png"
                    alt="Listener"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-white text-sm">150+ listening</span>
            </div>
            <button 
              onClick={handleListeningClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Listening
            </button>
          </div>
        </div>
      </div>

      {/* Join Popup */}
      {showJoinPopup && (
        <JoinPopup 
          onClose={handleClosePopup} 
          onStartListening={handleStartListening}
        />
      )}

      {/* Create Live Popup */}
      {showCreateLivePopup && (
        <CreateLivePopup 
          onClose={handleCloseCreatePopup} 
          onGoLive={handleGoLive}
        />
      )}
    </div>
  );
}