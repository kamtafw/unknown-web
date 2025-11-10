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
import { AllMembersPopup } from "./AllMembersPopup";
// import { webrtcService } from '../../../services/calls/webrtcService';

interface Participant {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking?: boolean;
}

interface GroupCallPageProps {
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
  participants: Participant[];
  onAddParticipant?: () => void;
  groupName?: string;
}

export function GroupCallPage({
  isOpen,
  onEndCall,
  participants,
  groupName = "Group call",
}: GroupCallPageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [callDuration, setCallDuration] = useState("00:00:00");
  const [seconds, setSeconds] = useState(0);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);

  //   const toggleMute = () => {
  //   const newMutedState = !isMuted;
  //   setIsMuted(newMutedState);
  //   webrtcService.toggleAudio(newMutedState);
  // };

  // useEffect(() => {
  //   if (!isOpen) return;

  //   const timer = setInterval(() => {
  //     setSeconds((prev) => prev + 1);
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !callAnswered) return; // Only count when answered

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, callAnswered]);

  // useEffect(() => {
  //   if (isOpen) {
  //     setTimeout(() => {
  //       setCallAnswered(true);
  //     }, 3000);
  //   }
  // }, [isOpen]);

  useEffect(() => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    setCallDuration(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    );
  }, [seconds, setCallDuration]);

  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
    }
  }, [isOpen]);

  // const mockParticipants: Participant[] = [
  //   {
  //     id: "-1",
  //     name: "Me",
  //     phone: "",
  //     avatar: "/Rectangle 1.png",
  //     isMuted: true,
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "2",
  //     name: "Cameron Williamson",
  //     phone: "+234 8123456789",
  //     avatar: "/Rectangle 2.png",
  //     isMuted: false,
  //     isSpeaking: true,
  //   },
  //   {
  //     id: "3",
  //     name: "Jenny Wils",
  //     phone: "+234 8134567890",
  //     avatar: "/Rectangle 1.png",
  //     isMuted: true,
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "4",
  //     name: "Wade Warren",
  //     phone: "+234 8145678901",
  //     avatar: "/Rectangle 3.png",
  //     isMuted: false,
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "5",
  //     name: "Esther Howard",
  //     phone: "+234 8156789012",
  //     avatar: "/Rectangle 4.png",
  //     isMuted: true,
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "6",
  //     name: "Robert Fox",
  //     phone: "+234 8167890123",
  //     avatar: "/Rectangle5.png",
  //     isMuted: true,
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "7",
  //     name: "Jacob Jones",
  //     phone: "+234 8178901234",
  //     avatar: "/Rectangle 1.png",
  //     isMuted: true,
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "8",
  //     name: "Courtney Henry",
  //     phone: "+234 8189012345",
  //     avatar: "/Rectangle 2.png",
  //     isMuted: false,
  //     isSpeaking: false,
  //   },
  // ];

  // const displayedParticipants =
  //   participants.length > 0 ? participants : [];

  const displayedParticipants = participants;
  const visibleParticipants = displayedParticipants.slice(0, 8);
  const remainingCount = displayedParticipants.length - 8;

  const handleBackFromAllMembers = () => {
    setShowAllMembers(false);
  };
  const handleEndCall = () => {
    setSeconds(0);
    setIsMuted(true);
    setIsVideoOn(false);
    setIsVolumeOn(true);
    setIsExpanded(false);
    setShowAllMembers(false);

    onEndCall();
  };

  if (!isOpen) return null;

  if (showAllMembers) {
    return (
      <AllMembersPopup
        isOpen={showAllMembers}
        onClose={() => setShowAllMembers(false)}
        onBack={handleBackFromAllMembers}
        participants={displayedParticipants}
        onEndCall={handleEndCall}
      />
    );
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleVolume = () => {
    setIsVolumeOn(!isVolumeOn);
  };

  const handleAddParticipant = () => {
    setShowAllMembers(true);
  };

  const handleShowAllMembers = () => {
    setShowAllMembers(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          className={`rounded-xl lg:rounded-xl shadow-2xl transition-all duration-300 p-2 sm:p-3 border-none bg-[#1F2937] ${
            isExpanded
              ? "w-full h-full rounded-none lg:rounded-none"
              : "w-full h-full sm:w-[600px] sm:h-[550px] lg:w-[700px] lg:h-[550px] sm:rounded-xl"
          } relative flex flex-col`}
        >
          <div className="p-1 border-none rounded-xl bg-[#111827]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-6">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 sm:p-2 hover:bg-gray-600 rounded-full transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <BsArrowsAngleContract className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                ) : (
                  <BsArrowsAngleExpand className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                )}
              </button>

              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {groupName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">Group call</p>
              </div>

              <button
                onClick={handleAddParticipant}
                className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                title="Add person"
              >
                <MdOutlinePersonAddAlt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>

            {/* Participants Grid */}
            <div className="flex-1 p-2 sm:p-5">
              <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xs sm:max-w-md mx-auto">
                {/* First 6 participants (top 2 rows) */}
                {visibleParticipants
                  .slice(
                    0,
                    visibleParticipants.length > 8
                      ? 6
                      : Math.min(6, visibleParticipants.length)
                  )
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="flex flex-col items-center space-y-1 sm:space-y-2"
                    >
                      <div className="relative">
                        {/* <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={80}
                          height={80}
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover"
                        /> */}
                        participant.avatar ? (
                        <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={80}
                          height={80}
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover"
                        />
                        ) : (
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        )
                        {/* Mic status indicator */}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                            participant.isMuted ? "bg-white" : "bg-blue-900"
                          }`}
                        >
                          {participant.isMuted ? (
                            <IoMicOffOutline className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500" />
                          ) : (
                            <IoMicOutline className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <p
                          className="text-xs sm:text-sm font-medium text-white truncate max-w-[56px] sm:max-w-[80px]"
                          title={
                            participant.id === "-1" ? "Me" : participant.name
                          }
                        >
                          {participant.id === "-1" ? "Me" : participant.name}
                        </p>
                        {participant.id && (
                          <p
                            className="text-xs text-white truncate max-w-[56px] sm:max-w-[80px] hidden sm:block"
                            title={participant.phone}
                          >
                            {participant.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom row with 2 participants and others button */}
              {visibleParticipants.length > 6 && (
                <div className="flex justify-center items-center space-x-4 sm:space-x-8 mt-3 sm:mt-6">
                  {visibleParticipants.slice(6, 8).map((participant) => (
                    <div
                      key={participant.id}
                      className="flex flex-col items-center space-y-1 sm:space-y-2"
                    >
                      <div className="relative">
                        <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={80}
                          height={80}
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                            participant.isMuted ? "bg-white" : "bg-blue-900"
                          }`}
                        >
                          {participant.isMuted ? (
                            <IoMicOffOutline className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500" />
                          ) : (
                            <IoMicOutline className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <p
                          className="text-xs sm:text-sm font-medium text-white truncate max-w-[56px] sm:max-w-[80px]"
                          title={
                            participant.id === "-1" ? "Me" : participant.name
                          }
                        >
                          {participant.id === "-1" ? "Me" : participant.name}
                        </p>
                        <p
                          className="text-xs text-white truncate max-w-[56px] sm:max-w-[80px] hidden sm:block"
                          title={participant.phone}
                        >
                          {participant.phone}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Others button */}
                  {remainingCount > 0 && (
                    <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                      <button
                        onClick={handleShowAllMembers}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-blue-400 flex items-center justify-center transition-colors hover:bg-blue-500"
                      >
                        <span className="text-sm sm:text-lg font-semibold text-white">
                          {remainingCount}+
                        </span>
                      </button>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Others
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Call Duration */}
              {/* <div className="flex justify-center mt-4 sm:mt-8">
                <div className="bg-[#1F2937] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center space-x-1.5 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-mono text-gray-300">
                    {callDuration}
                  </span>
                </div>
              </div> */}

              <div className="flex justify-center mt-4 sm:mt-8">
                {!callAnswered ? (
                  <div className="bg-[#1F2937] rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-xs sm:text-sm font-mono text-gray-300 animate-pulse">
                      Ringing...
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#1F2937] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-mono text-gray-300">
                      {callDuration}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="p-2 sm:p-4">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {/* More options */}
              <button
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-500 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                title="More options"
              >
                <HiDotsHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>

              {/* Video toggle */}
              <button
                onClick={toggleVideo}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOn
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-500 hover:bg-gray-300"
                }`}
                title={isVideoOn ? "Turn off camera" : "Turn on camera"}
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

              {/* End call */}
              <button
                onClick={handleEndCall}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                title="End call"
              >
                <MdCallEnd className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
