"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { TbTimeDuration15 } from "react-icons/tb";
import { FaRegPenToSquare, FaCalendarPlus } from "react-icons/fa6";
import CreateEventPopup from "./CreateEventPopup";

interface Event {
  id: number;
  title: string;
  location: string;
  status?: string;
  date?: string;
  time?: string;
  image: string;
  attendees: Array<{ id: number; avatar: string }>;
}

export default function EventsList({
  onLiveEventClick,
}: {
  onLiveEventClick?: (event: Event) => void;
}) {
  const [activeTab, setActiveTab] = useState("events");
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const events = [
    {
      id: 1,
      title: "My cooking event tutorial",
      location: "Amuwo, Lagos, Nigeria",
      status: "LIVE NOW",
      image: "/Events.svg",
      attendees: [
        { id: 1, avatar: "/Rectangle 4.png" },
        { id: 2, avatar: "/Rectangle 4.png" },
        { id: 3, avatar: "/Rectangle 4.png" },
      ],
    },
    {
      id: 2,
      title: "New Year Carnival",
      location: "Amuwo, Lagos, Nigeria",
      date: "May 19",
      time: "10:00 - 20:00",
      image: "/Events.svg",
      attendees: [
        { id: 1, avatar: "/Rectangle 4.png" },
        { id: 2, avatar: "/Rectangle 4.png" },
        { id: 3, avatar: "/Rectangle 4.png" },
      ],
    },
  ];

  const myEvents = [
    {
      ...events[0],
      status: undefined,
      date: "May 19",
      time: "10:00 - 20:00",
    },
    {
      ...events[1],
      date: undefined,
      time: undefined,
      status: "LIVE NOW",
    },
  ];

  const currentEvents = activeTab === "events" ? events : myEvents;

  const handleLiveEventClick = (event: Event) => {
    if (event.status === "LIVE NOW" && onLiveEventClick) {
      onLiveEventClick(event);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="px-3 py-3 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-600">Location</h1>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
            <span className="text-sm sm:text-base font-medium text-black truncate">
              Amuwo, Lagos, Nigeria
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-3 py-3 sm:px-4 md:px-6 sm:py-4">
        <div className="flex bg-gray-100 rounded-full p-1.5 sm:p-2 max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 px-4 py-1.5 sm:px-6 sm:py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === "events"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("myevents")}
            className={`flex-1 px-4 py-1.5 sm:px-6 sm:py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === "myevents"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            My events
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="px-3 py-2 sm:px-4 sm:py-4 md:px-6 space-y-3 sm:space-y-4 pb-20 sm:pb-24">
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className={`border-b overflow-hidden rounded-lg sm:rounded-xl shadow-sm bg-white ${
              event.status === "LIVE NOW"
                ? "cursor-pointer hover:shadow-lg transition-shadow"
                : ""
            }`}
            onClick={() => handleLiveEventClick(event)}
          >
            <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden rounded-t-lg sm:rounded-t-xl">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
              {/* Concert crowd silhouette overlay for cooking event */}
              {event.id === 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-black to-transparent">
                  <div className="absolute bottom-0 w-full flex justify-center items-end">
                    <div className="w-6 h-8 sm:w-8 sm:h-12 bg-black opacity-60 rounded-t-full mx-0.5 sm:mx-1"></div>
                    <div className="w-4 h-6 sm:w-6 sm:h-10 bg-black opacity-60 rounded-t-full mx-0.5 sm:mx-1"></div>
                    <div className="w-7 h-10 sm:w-10 sm:h-14 bg-black opacity-60 rounded-t-full mx-0.5 sm:mx-1"></div>
                    <div className="w-5 h-7 sm:w-7 sm:h-11 bg-black opacity-60 rounded-t-full mx-0.5 sm:mx-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-black leading-tight flex-1">
                  {event.title}
                </h3>

                {/* Edit icon for My events tab when event has date/time */}
                {activeTab === "myevents" && event.date && event.time && (
                  <FaRegPenToSquare className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800 flex-shrink-0 mt-0.5" />
                )}
              </div>

              <div className="relative mb-3">
                <div className="flex items-center gap-1 mb-2 sm:mb-3 pr-16 sm:pr-20">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base text-black truncate">
                    {event.location}
                  </span>
                </div>

                {event.status === "LIVE NOW" && (
                  <div className="absolute -top-1 sm:-top-2 right-0 px-1.5 py-1 sm:px-2 rounded-full flex items-center gap-1">
                    <TbTimeDuration15 className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
                    <span className="text-sm sm:text-base font-medium text-red-500 whitespace-nowrap">
                      LIVE NOW!
                    </span>
                  </div>
                )}

                {event.date && event.time && (
                  <div className="absolute -top-1 sm:-top-2 right-0 px-1.5 py-1 sm:px-2 rounded-full flex items-center gap-1">
                    <TbTimeDuration15 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    <div className="flex flex-col sm:flex-row sm:gap-1 text-xs sm:text-sm">
                      <span className="font-semibold text-black whitespace-nowrap">
                        {event.date}
                      </span>
                      <span className="font-semibold text-gray-600 whitespace-nowrap">
                        {event.time}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex -space-x-3 sm:-space-x-5">
                  {event.attendees.map((attendee, index) => (
                    <Image
                      key={attendee.id}
                      src={attendee.avatar}
                      alt={`Attendee ${index + 1}`}
                      width={32}
                      height={32}
                      className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <div className="w-8 h-8 sm:w-11 sm:h-11 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                    +40
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Calendar Plus Button - Only show in My events tab */}
      {activeTab === "myevents" && (
        <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50">
          <button
            onClick={() => setShowCreatePopup(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors hover:scale-105 active:scale-95"
            aria-label="Add new event"
            title="Add new event"
          >
            <FaCalendarPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      )}

      {/* Add this popup component */}
      {showCreatePopup && (
        <CreateEventPopup onClose={() => setShowCreatePopup(false)} />
      )}
    </div>
  );
}
