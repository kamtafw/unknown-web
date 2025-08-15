"use client";

import Image from "next/image";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsSoundwave } from "react-icons/bs";

export function Listeners() {
  const participants = [
    {
      name: "Guy Guy",
      role: "Host",
      image: "/Rectangle5.png",
      isSpeaking: true,
    },
    {
      name: "Victoria Johnson",
      role: "Co host",
      image: "/Rectangle 2.png",
      isSpeaking: false,
    },
    {
      name: "Devon Lee",
      role: "Listener",
      image: "/Rectangle 3.png",
      isSpeaking: false,
    },
    {
      name: "Christopher Martinez",
      role: "Listener",
      image: "/Rectangle 4.png",
      isSpeaking: false,
    },
    {
      name: "Amanda Rodriguez",
      role: "Listener",
      image: "/Rectangle5.png",
      isSpeaking: false,
    },
    {
      name: "Michael Thompson",
      role: "Listener",
      image: "/Rectangle 2.png",
      isSpeaking: false,
    },
    {
      name: "Sarah Elizabeth",
      role: "Listener",
      image: "/Rectangle 3.png",
      isSpeaking: false,
    },
    {
      name: "David Alexander",
      role: "Listener",
      image: "/Rectangle 4.png",
      isSpeaking: false,
    },
    {
      name: "Jessica Williams",
      role: "Listener",
      image: "/Rectangle5.png",
      isSpeaking: false,
    },
    {
      name: "Robert Brown",
      role: "Listener",
      image: "/Rectangle 2.png",
      isSpeaking: false,
    },
    {
      name: "Emily Davis",
      role: "Listener",
      image: "/Rectangle 3.png",
      isSpeaking: false,
    },
    {
      name: "James Wilson",
      role: "Listener",
      image: "/Rectangle 4.png",
      isSpeaking: false,
    },
    {
      name: "Lisa Taylor",
      role: "Listener",
      image: "/Rectangle5.png",
      isSpeaking: false,
    },
    {
      name: "Mark Johnson",
      role: "Listener",
      image: "/Rectangle 2.png",
      isSpeaking: false,
    },
  ];

  const truncateName = (name: string): string => {
    return name.length > 12 ? `${name.substring(0, 12)}...` : name;
  };

  return (
    <div className="p-6">
      {/* Participants Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {participants.map((participant, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-18 h-18 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src={participant.image}
                  alt={participant.name}
                  width={58}
                  height={58}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                {participant.isSpeaking ? (
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
      </div>

      {/* Other Listeners Indicator */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xs font-medium">200+</span>
          </div>
          <p className="text-xs text-center font-medium text-gray-800">
            Other listeners
          </p>
        </div>
      </div>
    </div>
  );
}
