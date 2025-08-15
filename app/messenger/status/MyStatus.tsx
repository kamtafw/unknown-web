"use client";

import { useState } from "react";
import Image from "next/image";
import { HiDotsVertical } from "react-icons/hi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusActionsPopup } from "./StatusActionsPopup";
import { ViewersPopup } from "./ViewersPopup";
import { ForwardPopup } from "./ForwardPopup";
import EditStory from "./EditStory";
import { PiEyesFill } from "react-icons/pi";

interface StatusStory {
  id: string;
  image: string;
  text: string;
  emoji: string;
  viewers: number;
}

const statusStories: StatusStory[] = [
  {
    id: "1",
    image: "/Status.png",
    text: "New house launched",
    emoji: "🏠",
    viewers: 12,
  },
  {
    id: "2",
    image: "/Status.png",
    text: "Beautiful sunset today",
    emoji: "🌅",
    viewers: 8,
  },
  {
    id: "3",
    image: "/Status.png",
    text: "Coffee time",
    emoji: "☕",
    viewers: 15,
  },
  {
    id: "4",
    image: "/Status.png",
    text: "Weekend vibes",
    emoji: "😎",
    viewers: 20,
  },
  {
    id: "5",
    image: "/Status.png",
    text: "Working late",
    emoji: "💻",
    viewers: 6,
  },
  {
    id: "6",
    image: "/Status.png",
    text: "Good morning!",
    emoji: "🌞",
    viewers: 25,
  },
];

export function MyStatus() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [showViewersPopup, setShowViewersPopup] = useState(false);
  const [showForwardPopup, setShowForwardPopup] = useState(false);
  const [showEditStory, setShowEditStory] = useState(false);

  const currentStory = statusStories[currentStoryIndex];

  const nextStory = () => {
    setCurrentStoryIndex((prev) =>
      prev < statusStories.length - 1 ? prev + 1 : prev
    );
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToStory = (index: number) => {
    setCurrentStoryIndex(index);
  };

  const handleForwardClick = () => {
    console.log("Forward action triggered - showing ForwardPopup");
    setShowForwardPopup(true);
  };

  const handleForwardClose = () => {
    console.log("Forward popup closing");
    setShowForwardPopup(false);
  };

  const handleEditStoryClick = () => {
    console.log("Edit story action triggered - showing EditStory");
    setShowEditStory(true);
  };

  const handleEditStoryClose = () => {
    console.log("Edit story popup closing");
    setShowEditStory(false);
  };

  return (
    <>
      <div className="w-2/3 flex flex-col h-full bg-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/Rectangle 2.png"
              alt="My Profile"
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-lg text-white">My status</h2>
              <p className="text-sm text-white">1st December 2024, 14:25</p>
            </div>
          </div>
          <div className="relative">
            <HiDotsVertical
              className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-500"
              onClick={() => setShowActionsPopup(true)}
            />
            {showActionsPopup && (
              <StatusActionsPopup 
                onClose={() => setShowActionsPopup(false)}
                onForward={handleForwardClick}
                onEditStory={handleEditStoryClick}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2 px-6">
          {/* Progress Indicators */}
          <div className="flex gap-2 mb-6">
            {statusStories.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full cursor-pointer transition-all duration-300 ${
                  index === currentStoryIndex
                    ? "bg-blue-500 w-15"
                    : index < currentStoryIndex
                    ? "bg-gray-400 w-10"
                    : "bg-gray-200 w-10"
                }`}
                onClick={() => goToStory(index)}
              />
            ))}
          </div>

          {/* Image Container */}
          <div className="relative mb-6 px-16">
            <div className="relative w-96 h-[35rem] rounded-lg overflow-hidden">
              <Image
                src={currentStory.image}
                alt="Status Image"
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {currentStoryIndex > 0 && (
              <button
                onClick={prevStory}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border rounded-full p-2 transition-colors"
                title="Previous story"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {currentStoryIndex < statusStories.length - 1 && (
              <button
                onClick={nextStory}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border rounded-full p-2 transition-colors"
                title="Next story"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mb-4">
            <p className="text-lg font-medium text-white">
              {currentStory.text}{" "}
              <span className="text-xl">{currentStory.emoji}</span>
            </p>
          </div>

          {/* Viewers Button */}
          <div className="relative">
            <button
              onClick={() => setShowViewersPopup(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
            >
              <PiEyesFill className="h-4 w-4 text-white" />
              <span className="font-medium text-white">
                {currentStory.viewers}
              </span>
            </button>

            {showViewersPopup && (
              <ViewersPopup
                viewers={currentStory.viewers}
                onClose={() => setShowViewersPopup(false)}
              />
            )}
          </div>
        </div>
      </div>

      {showForwardPopup && (
        <ForwardPopup onClose={handleForwardClose} />
      )}

      {/* Add EditStory popup */}
      <EditStory 
        isOpen={showEditStory} 
        onClose={handleEditStoryClose} 
      />
    </>
  );
}
