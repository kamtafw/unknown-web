"use client";

import { ArrowLeft, Search } from "lucide-react";
import { IoMicOutline, IoMicOffOutline } from "react-icons/io5";
import { LuVolumeOff, LuVolume2 } from "react-icons/lu";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdCallEnd } from "react-icons/md";
import { useState } from "react";
import Image from "next/image";

interface Participant {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking?: boolean;
}

interface AllMembersPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  participants: Participant[];
  onEndCall: () => void;
}

export function AllMembersPopup({
  isOpen,
  onBack,
  participants,
  onEndCall,
}: AllMembersPopupProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isVolumeOn, setIsVolumeOn] = useState(true);

  if (!isOpen) return null;

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.phone.includes(searchTerm)
  );

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleVolume = () => {
    setIsVolumeOn(!isVolumeOn);
  };

  const handleEndCall = () => {
    setIsMuted(true);
    setIsVideoOn(false);
    setIsVolumeOn(true);
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto">
      <div className="w-[320px] h-[500px] bg-[#111827] rounded-xl shadow-2xl p-3 border-none relative flex flex-col gap-3">
        {/* Header and Contacts Box */}
        <div className="flex-1 border-none rounded-xl bg-[#111827] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center p-4 flex-shrink-0">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-600 rounded-full transition-colors mr-2"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400" />
            </button>

            <h2 className="text-lg font-semibold text-gray-400">All members</h2>
          </div>

          {/* Search Box */}
          <div className="px-4 pb-3 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-[#1F2937] border border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400 text-sm"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="border-t border-gray-600 mx-4 flex-shrink-0" />

          {/* Participants List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-1">
              {filteredParticipants.map((participant) => (
                <div key={participant.id}>
                  <div className="flex items-center gap-3 py-2">
                    <div className="relative">
                      {/* <Image
                        src={participant.avatar}
                        alt={participant.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      /> */}
                      {participant.avatar ? (
                        <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm truncate">
                        {participant.name}
                      </h3>
                      {participant.phone && (
                        <p className="text-xs text-gray-400 truncate">
                          {participant.phone}
                        </p>
                      )}
                    </div>
                    {/* Mic status indicator - moved to the right */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        participant.isMuted ? "bg-white" : "bg-blue-900"
                      }`}
                    >
                      {participant.isMuted ? (
                        <IoMicOffOutline className="h-3 w-3 text-blue-500" />
                      ) : (
                        <IoMicOutline className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="border-2 w-full rounded-lg"></div>
        <div className="bg-[#111827] rounded-xl p-3 flex-shrink-0">
          <div className="flex justify-center space-x-3">
            {/* More options */}
            <button
              className="w-10 h-10 bg-gray-500 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              title="More options"
            >
              <HiDotsHorizontal className="h-4 w-4 text-gray-600" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-500 hover:bg-gray-300"
              }`}
              title={isVideoOn ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-4 w-4 text-white" />
              ) : (
                <BsCameraVideoOff className="h-4 w-4 text-gray-600" />
              )}
            </button>

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-gray-500 hover:bg-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <IoMicOffOutline className="h-4 w-4 text-gray-600" />
              ) : (
                <IoMicOutline className="h-4 w-4 text-white" />
              )}
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-gray-500 hover:bg-gray-300"
                  : "bg-red-100 hover:bg-red-200"
              }`}
              title={isVolumeOn ? "Mute volume" : "Unmute volume"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-4 w-4 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-4 w-4 text-red-600" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
