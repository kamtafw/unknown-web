"use client";

import Image from "next/image";
import { PiPencilSimpleLineBold } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";

const scheduledCalls = [
  {
    id: "1",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    date: "1 December 2024, 14.25",
    reason: "Discuss project timeline and deliverables",
  },
  {
    id: "2",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    date: "2 December 2024, 10.30",
    reason: "Review quarterly performance metrics",
  },
  {
    id: "3",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    date: "3 December 2024, 16.45",
    reason: "Follow up on client requirements",
  },
  {
    id: "4",
    name: "Darlene Robertson",
    avatar: "/Rectangle 3.png",
    date: "5 December 2024, 09.15",
    reason: "Birthday wishes and catch up",
  },
];

export function CallTab() {
  return (
    <div className="space-y-4">
      {scheduledCalls.map((call, index) => (
        <div key={call.id}>
          <div className="flex items-start gap-3 p-4">
            <Image
              src={call.avatar}
              alt={call.name}
              width={50}
              height={50}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{call.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{call.date}</p>
              <p className="text-sm text-gray-700">{call.reason}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="pen"
              >
                <PiPencilSimpleLineBold className="h-6 w-6 text-gray-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="delete"
              >
                <RiDeleteBin5Line className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
          {index < scheduledCalls.length - 1 && (
            <hr className="border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}
