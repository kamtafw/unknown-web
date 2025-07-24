"use client";

import { useState } from "react";
import {
  EllipsisVertical,
  Camera,
  Search,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusIndicator } from "@/components/StatusIndicator";

interface Status {
  id: string;
  name: string;
  avatar: string;
  time: string;
  count?: number;
  viewed?: boolean;
}

const recentStatuses: Status[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    time: "2 minutes ago",
    count: 2,
  },
  {
    id: "2",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    time: "5 minutes ago",
    count: 1,
  },
  {
    id: "3",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    time: "1 hour ago",
    count: 3,
  },
  {
    id: "4",
    name: "Darlene Robertson",
    avatar: "/Rectangle 3.png",
    time: "2 hours ago",
    count: 1,
  },
  {
    id: "5",
    name: "Kristin Watson",
    avatar: "/Rectangle 3.png",
    time: "3 hours ago",
    count: 2,
  },
];

const viewedStatuses: Status[] = [
  {
    id: "6",
    name: "Arlene McCoy",
    avatar: "/Rectangle 3.png",
    time: "Yesterday",
    viewed: true,
  },
  {
    id: "7",
    name: "Jane Cooper",
    avatar: "/Rectangle 3.png",
    time: "Yesterday",
    viewed: true,
  },
  {
    id: "8",
    name: "Robert Kim",
    avatar: "/Rectangle 3.png",
    time: "2 days ago",
    viewed: true,
  },
  {
    id: "9",
    name: "Arlene Cane",
    avatar: "/Rectangle 3.png",
    time: "2 days ago",
    viewed: true,
  },
  {
    id: "10",
    name: "Wade Warren",
    avatar: "/Rectangle 3.png",
    time: "3 days ago",
    viewed: true,
  },
];

const mutedStatuses: Status[] = [
  {
    id: "11",
    name: "Floyd Miles",
    avatar: "/Rectangle 3.png",
    time: "1 hour ago",
  },
  {
    id: "12",
    name: "Jenny Wilson",
    avatar: "/Rectangle 3.png",
    time: "4 hours ago",
  },
  {
    id: "13",
    name: "Devon Lane",
    avatar: "/Rectangle 3.png",
    time: "Yesterday",
  },
  {
    id: "14",
    name: "Courtney Henry",
    avatar: "/Rectangle 3.png",
    time: "2 days ago",
  },
  {
    id: "15",
    name: "Theresa Webb",
    avatar: "/Rectangle 3.png",
    time: "3 days ago",
  },
];

export function StatusList() {
  const [viewedExpanded, setViewedExpanded] = useState(false);
  const [mutedExpanded, setMutedExpanded] = useState(false);

  const StatusItem = ({
    status,
    showBorder = true,
    isViewedOrMuted = false,
  }: {
    status: Status;
    showBorder?: boolean;
    isViewedOrMuted?: boolean;
  }) => (
    <div className="flex items-center gap-3 py-3">
      <div className="relative">
        {isViewedOrMuted ? (
          <StatusIndicator variant="viewed">
            <Image
              src={status.avatar}
              alt={status.name}
              width={60}
              height={60}
              className="h-15 w-15 rounded-full object-cover"
            />
          </StatusIndicator>
        ) : (
          <>
            <Image
              src={status.avatar}
              alt={status.name}
              width={60}
              height={60}
              className="h-15 w-15 rounded-full object-cover"
            />
            {showBorder && !status.viewed && (
              <div className="absolute -inset-1 w-17 h-17">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 68 68"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="34"
                    cy="34"
                    r="32"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="25 8"
                  />
                </svg>
              </div>
            )}
            {status.viewed && (
              <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
            )}
          </>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{status.name}</p>
        <p className="text-sm text-gray-500">{status.time}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="flex items-center gap-3">
          <Camera className="h-5 w-5 cursor-pointer" />
          <Search className="h-5 w-5 cursor-pointer" />
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical className="h-5 w-5 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start">
                  Status Privacy
                </Button>
                <Button variant="ghost" className="justify-start">
                  Settings
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* My Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 py-2">
          <StatusIndicator variant="active">
            <Image
              src="/Rectangle 2.png"
              alt="My Status"
              width={60}
              height={60}
              className="h-15 w-15 rounded-full object-cover"
            />
          </StatusIndicator>
          <div className="flex-1">
            <p className="font-medium">My Status</p>
            <p className="text-sm text-gray-500">11:02</p>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 mb-4" />

      {/* Recent Updates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-600">
          Recent updates
        </h3>
        {recentStatuses.map((status) => (
          <StatusItem key={status.id} status={status} />
        ))}
      </div>
      <hr className="border-gray-200 mb-4" />
      {/* Viewed Updates */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => setViewedExpanded(!viewedExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-600">
            Viewed updates
          </h3>
          {viewedExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {viewedExpanded &&
          viewedStatuses.map((status) => (
            <StatusItem key={status.id} status={status} isViewedOrMuted={true} />
          ))}
      </div>
      <hr className="border-gray-200 mb-4" />
      {/* Muted Updates */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => setMutedExpanded(!mutedExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-600">Muted updates</h3>
          {mutedExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {mutedExpanded &&
          mutedStatuses.map((status) => (
            <StatusItem key={status.id} status={status} isViewedOrMuted={true} />
          ))}
      </div>
      {/* Floating Action Buttons */}
      <div className="absolute bottom-50 right-6 flex flex-col gap-3">
        <div className="bg-white rounded-full p-3 shadow-lg border cursor-pointer hover:shadow-xl transition-shadow">
          <Edit3 className="h-5 w-5 text-blue-500" />
        </div>
        <div className="bg-blue-500 rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
