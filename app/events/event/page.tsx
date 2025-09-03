"use client";

import { useState } from "react";
import EventsList from "./EventList";
import LiveEventPage from "./LiveEventPage";

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

export default function EventPage() {
  const [selectedLiveEvent, setSelectedLiveEvent] = useState<Event | null>(
    null
  );

  const handleLiveEventClick = (event: Event) => {
    setSelectedLiveEvent(event);
  };

  const handleLeaveLiveEvent = () => {
    setSelectedLiveEvent(null);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:hidden">
        {selectedLiveEvent ? (
          <LiveEventPage onLeave={handleLeaveLiveEvent} />
        ) : (
          <EventsList onLiveEventClick={handleLiveEventClick} />
        )}
      </div>
      <div className="hidden lg:flex w-full">
        {/* Events List Sidebar */}
        <div className="w-[380px] xl:w-[420px] border-r border-gray-200 flex-shrink-0">
          <EventsList onLiveEventClick={handleLiveEventClick} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {selectedLiveEvent ? (
            <LiveEventPage onLeave={handleLeaveLiveEvent} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No live event selected
                </h3>
                <p className="text-gray-500">
                  Select a live event from the sidebar to join
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

