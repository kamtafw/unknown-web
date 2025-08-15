"use client";

import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsSoundwave } from "react-icons/bs";

interface JoinPopupProps {
  onClose: () => void;
  onStartListening: (data: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
}

export function JoinPopup({ onClose, onStartListening }: JoinPopupProps) {
  const participants = [
    {
      name: "Guy Guy",
      role: "Host",
      image: "/Rectangle5.png",
      hasWave: true,
    },
    {
      name: "Victoria Johnson",
      role: "Co host",
      image: "/Rectangle 2.png",
      hasWave: false,
    },
    {
      name: "Devon lee",
      role: "Listener",
      image: "/Rectangle 3.png",
      hasWave: false,
    },
    {
      name: "Christopher Martinez",
      role: "Listener",
      image: "/Rectangle 4.png",
      hasWave: false,
    },
    {
      name: "Amanda Rodriguez",
      role: "Listener",
      image: "/Rectangle5.png",
      hasWave: false,
    },
    {
      name: "Michael Thompson",
      role: "Listener",
      image: "/Rectangle 2.png",
      hasWave: false,
    },
    {
      name: "Sarah Elizabeth",
      role: "Listener",
      image: "/Rectangle 3.png",
      hasWave: false,
    },
    {
      name: "David Alexander",
      role: "Listener",
      image: "/Rectangle 4.png",
      hasWave: false,
    },
  ];

  const truncateName = (name: string): string => {
    return name.length > 10 ? `${name.substring(0, 10)}...` : name;
  };

  const handleStartListening = () => {
    const sessionData = {
      title: "Today Today",
      description: "Lorem ipsum sit amet, consectetur adipiscing elit, sed do eiusmod",
      tags: ["#Invest", "#Money", "#Future", "#Mindset"]
    };
    onStartListening(sessionData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Session Info */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <h2 className="text-lg font-semibold mr-2">Today Today</h2>
            <Image
              src="/live.png"
              alt="Live"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Lorem ipsum sit amet, consectetur adipiscing elit, sed do eiusmod
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-blue-500 text-sm">#Invest</span>
            <span className="text-blue-500 text-sm">#Money</span>
            <span className="text-blue-500 text-sm">#Future</span>
            <span className="text-blue-500 text-sm">#Mindset</span>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            {participants.map((participant, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    <Image
                      src={participant.image}
                      alt={participant.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                    {participant.hasWave ? (
                      <BsSoundwave className="text-green-500 text-xs" />
                    ) : (
                      <FaMicrophoneAlt className="text-red-500 text-xs" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-center font-medium text-gray-800 mb-1">
                  {truncateName(participant.name)}
                </p>
                <p className="text-xs text-center text-gray-500">
                  {participant.role}
                </p>
              </div>
            ))}

            {/* Additional listeners indicator */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xs font-medium">200+</span>
              </div>
              <p className="text-xs text-center font-medium text-gray-800">
                Other lis..
              </p>
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartListening}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-full font-medium transition-colors"
          >
            Start Listening
          </button>
        </div>
      </div>
    </div>
  );
}
