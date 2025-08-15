"use client";

import Image from "next/image";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";

const scheduledMessages = [
  {
    id: "1",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    date: "1 December 2024, 14.25",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
  },
  {
    id: "2",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    date: "2 December 2024, 10.30",
    message: "Meeting reminder for tomorrow's project discussion"
  },
  {
    id: "3",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    date: "3 December 2024, 16.45",
    message: "Don't forget to submit the quarterly report"
  },
  {
    id: "4",
    name: "Darlene Robertson",
    avatar: "/Rectangle 3.png",
    date: "5 December 2024, 09.15",
    message: "Happy birthday! Hope you have a wonderful day"
  }
];

export function MessagesTab() {
  return (
    <div className="space-y-4">
      {scheduledMessages.map((message, index) => (
        <div key={message.id}>
          <div className="flex items-start gap-3 p-4">
            <Image
              src={message.avatar}
              alt={message.name}
              width={50}
              height={50}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{message.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{message.date}</p>
              <p className="text-sm text-gray-700">{message.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="pen">
                <PiPencilSimpleLineBold className="h-6 w-6 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="delete">
                <RiDeleteBin5Line className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
          {index < scheduledMessages.length - 1 && (
            <hr className="border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}