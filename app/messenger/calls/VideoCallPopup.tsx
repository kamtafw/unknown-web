"use client";

import { useState, useEffect } from "react";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { IoMicOutline, IoMicOffOutline } from "react-icons/io5";
import { LuVolumeOff, LuVolume2 } from "react-icons/lu";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdCallEnd } from "react-icons/md";
import Image from "next/image";

interface VideoCallPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
  contact: {
    name: string;
    avatar: string;
    phone?: string;
  };
  onCallTypeChange?: (newType: "video" | "audio") => void; 
}

export function VideoCallPopup({
  isOpen,
  onEndCall,
  contact,
  onCallTypeChange,
}: VideoCallPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [callDuration, setCallDuration] = useState("00:00:00");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    setCallDuration(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    );
  }, [seconds]);

  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
      setIsVideoOn(true);
    }
  }, [isOpen]);

  const handleEndCall = () => {
    setSeconds(0);
    setIsMuted(true);
    setIsVideoOn(true);
    setIsVolumeOn(true);
    setIsExpanded(false);
    onEndCall();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (isVideoOn) {
      onCallTypeChange?.("audio");
    } else {
      setIsVideoOn(true);
    }
  };

  const toggleVolume = () => {
    setIsVolumeOn(!isVolumeOn);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div
        className={`rounded-xl shadow-2xl transition-all duration-300 p-2 sm:p-3 border-none bg-[#1F2937] ${
          isExpanded 
            ? "w-full h-full rounded-none" 
            : "w-full h-full sm:w-[90%] sm:h-[90%] lg:w-[700px] lg:h-[600px] sm:rounded-xl"
        } relative flex flex-col`}
      >
        <div className="p-1 border-none rounded-xl bg-[#111827] flex-1 relative">
          {/* Header */}
          <div className="flex items-center justify-center p-3 sm:p-4 lg:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-400">
              Video Call
            </h2>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
            {/* Main large picture */}
            <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-lg h-48 sm:h-64 lg:h-100 mb-4 sm:mb-6">
              <Image
                src="/videcall...png"
                alt={contact.name}
                fill
                className="object-contain rounded-lg"
              />
            </div>

            {/* Smaller picture top right */}
            <div className="absolute top-2 right-4 sm:right-6 lg:right-8 w-20 h-16 sm:w-24 sm:h-18 lg:w-32 lg:h-24 overflow-hidden rounded-lg border-2 border-white shadow-lg">
              <Image
                src={contact.avatar}
                alt="You"
                fill
                className="object-cover"
              />
            </div>

            {/* Contact Info */}
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">
                {contact.name}
              </h3>
              {contact.phone && (
                <p className="text-base sm:text-lg text-gray-300">{contact.phone}</p>
              )}
            </div>

            {/* Call Duration */}
            <div className="bg-[#1F2937] rounded-full px-4 py-2 sm:px-6 sm:py-3 flex items-center space-x-2 sm:space-x-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-base sm:text-lg font-mono text-gray-300">
                {callDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons - Mobile Layout */}
        <div className="p-3 sm:p-4 block lg:hidden">
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {/* End call - Primary action */}
            <button
              onClick={handleEndCall}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-500 hover:bg-gray-300"
              }`}
              title={isVideoOn ? "Switch to voice call" : "Turn on camera"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <BsCameraVideoOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              )}
            </button>

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-gray-500 hover:bg-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <IoMicOffOutline className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <IoMicOutline className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-gray-500 hover:bg-gray-300"
                  : "bg-red-100 hover:bg-red-200"
              }`}
              title={isVolumeOn ? "Mute volume" : "Unmute volume"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              )}
            </button>

            {/* Add person */}
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title="Add person"
            >
              <MdOutlinePersonAddAlt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Control Buttons - Desktop Layout (unchanged) */}
        <div className="p-4 hidden lg:block">
          <div className="flex justify-center space-x-4">
            {/* More options */}
            <button
              className="w-12 h-12 bg-gray-500 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              title="More options"
            >
              <HiDotsHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-500 hover:bg-gray-300"
              }`}
              title={isVideoOn ? "Switch to voice call" : "Turn on camera"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-5 w-5 text-white" />
              ) : (
                <BsCameraVideoOff className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-gray-500 hover:bg-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <IoMicOffOutline className="h-5 w-5 text-gray-600" />
              ) : (
                <IoMicOutline className="h-5 w-5 text-white" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className="w-12 h-12 bg-green-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-5 w-5 text-white" />
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-gray-500 hover:bg-gray-300"
                  : "bg-red-100 hover:bg-red-200"
              }`}
              title={isVolumeOn ? "Mute volume" : "Unmute volume"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-5 w-5 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-5 w-5 text-red-600" />
              )}
            </button>

            {/* Add person */}
            <button
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title="Add person"
            >
              <MdOutlinePersonAddAlt className="h-5 w-5 text-white" />
            </button>

            {/* Expand/Contract */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-12 h-12 bg-gray-500 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? (
                <BsArrowsAngleContract className="h-5 w-5 text-gray-600" />
              ) : (
                <BsArrowsAngleExpand className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}