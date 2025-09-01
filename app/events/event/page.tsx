// "use client";

// import EventsList from "./EventList";

// export default function EventPage() {
//   return (
//     <div className="flex min-h-screen">
//       <div className="w-[380px] border-r border-gray-200">
//         <EventsList />
//       </div>
//       <div className="flex-1">
//         {/* Space for the other page/component */}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import EventsList from "./EventList";
import LiveEventPage from "./LiveEventPage";

export default function EventPage() {
  const [selectedLiveEvent, setSelectedLiveEvent] = useState(null);

  const handleLiveEventClick = (event) => {
    setSelectedLiveEvent(event);
  };

  const handleLeaveLiveEvent = () => {
    setSelectedLiveEvent(null);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[380px] border-r border-gray-200">
        <EventsList onLiveEventClick={handleLiveEventClick} />
      </div>
      <div className="flex-1">
        {selectedLiveEvent ? (
          <LiveEventPage 
            event={selectedLiveEvent}
            onLeave={handleLeaveLiveEvent}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a live event to join</p>
          </div>
        )}
      </div>
    </div>
  );
}
