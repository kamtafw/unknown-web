"use client";

import { useState } from "react";
import Image from "next/image";
import { HiDotsVertical } from "react-icons/hi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContactStatusActionsPopup } from "./ContactStatusActionsPopup";
import { ForwardPopup } from "./ForwardPopup";

interface StatusStory {
  id: string;
  image: string;
  text: string;
  emoji: string;
}

interface ContactStatusProps {
  contact: {
    id: string;
    name: string;
    avatar: string;
    time: string;
    date: string;
  };
  stories: StatusStory[];
  onClose?: () => void;
}

export function ContactStatus({ contact, stories }: ContactStatusProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [showForwardPopup, setShowForwardPopup] = useState(false); // Add this state

  const currentStory = stories[currentStoryIndex];

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
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

  return (
    <>
      <div className="w-2/3 flex flex-col h-full bg-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src={contact.avatar}
              alt={contact.name}
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-lg text-white">{contact.name}</h2>
              <p className="text-sm text-white">{contact.date}, {contact.time}</p>
            </div>
          </div>
          <div className="relative">
            <HiDotsVertical
              className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-500"
              onClick={() => setShowActionsPopup(true)}
            />
            {showActionsPopup && (
              <ContactStatusActionsPopup 
                onClose={() => setShowActionsPopup(false)}
                onForward={handleForwardClick}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2 px-6">
          {/* Progress Indicators */}
          <div className="flex gap-2 mb-6">
            {stories.map((_, index) => (
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

            {currentStoryIndex < stories.length - 1 && (
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
        </div>
      </div>
      {showForwardPopup && (
        <ForwardPopup onClose={handleForwardClose} />
      )}
    </>
  );
}