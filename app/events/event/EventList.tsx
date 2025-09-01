// "use client";

// import { useState } from "react";
// import { Search, MapPin } from "lucide-react";
// import Image from "next/image";
// import { TbTimeDuration15 } from "react-icons/tb";

// export default function EventsList() {
//   const [activeTab, setActiveTab] = useState("events");

//   const events = [
//     {
//       id: 1,
//       title: "My cooking event tutorial",
//       location: "Amuwo, Lagos, Nigeria",
//       status: "LIVE NOW",
//       image: "/Events.jpg",
//       attendees: [
//         { id: 1, avatar: "/Rectangle 4.png" },
//         { id: 2, avatar: "/Rectangle 4.png" },
//         { id: 3, avatar: "/Rectangle 4.png" },
//       ],
//     },
//     {
//       id: 2,
//       title: "New Year Carnival",
//       location: "Amuwo, Lagos, Nigeria",
//       date: "May 19",
//       time: "10:00 - 20:00",
//       image: "/Events.jpg",
//       attendees: [
//         { id: 1, avatar: "/Rectangle 4.png" },
//         { id: 2, avatar: "/Rectangle 4.png" },
//         { id: 3, avatar: "/Rectangle 4.png" },
//       ],
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="px-4 py-3 ">
//         <div className="flex items-center justify-between mb-3">
//           <h1 className="text-xl font-semibold text-gray-600">Location</h1>

//           <div className="flex items-center gap-2 ">
//             <MapPin className="w-5 h-5 text-blue-500" />
//             <span className="text-base font-medium text-black">
//               Amuwo, Lagos, Nigeria
//             </span>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className="px-4 py-4">
//         <div className="flex bg-gray-100 rounded-full p-2 max-w-xs mx-auto">
//           <button
//             onClick={() => setActiveTab("events")}
//             className={`flex-1 px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
//               activeTab === "events"
//                 ? "bg-white text-black shadow-sm"
//                 : "text-gray-600 hover:text-gray-800"
//             }`}
//           >
//             Events
//           </button>
//           <button
//             onClick={() => setActiveTab("myevents")}
//             className={`flex-1 px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
//               activeTab === "myevents"
//                 ? "bg-white text-black shadow-sm"
//                 : "text-gray-600 hover:text-gray-800"
//             }`}
//           >
//             My events
//           </button>
//         </div>
//       </div>

//       {/* Events List */}
//       <div className="px-4 py-4 space-y-4">
//         {events.map((event) => (
//           <div
//             key={event.id}
//             className="border-b  overflow-hidden"
//           >
//             <div className="relative h-48 overflow-hidden">
//               <Image
//                 src={event.image}
//                 alt={event.title}
//                 fill
//                 className="object-cover"
//               />
//               {/* Concert crowd silhouette overlay for cooking event */}
//               {event.id === 1 && (
//                 <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent">
//                   <div className="absolute bottom-0 w-full flex justify-center items-end">
//                     <div className="w-8 h-12 bg-black opacity-60 rounded-t-full mx-1"></div>
//                     <div className="w-6 h-10 bg-black opacity-60 rounded-t-full mx-1"></div>
//                     <div className="w-10 h-14 bg-black opacity-60 rounded-t-full mx-1"></div>
//                     <div className="w-7 h-11 bg-black opacity-60 rounded-t-full mx-1"></div>
//                   </div>
//                 </div>
//               )}

//               {/* Live indicator */}
//             </div>

//             {/* Event Details */}
//             <div className="p-4">
//               <h3 className="font-semibold text-lg text-black mb-2">
//                 {event.title}
//               </h3>

//               <div className="relative mb-3">
//                 <div className="flex items-center gap-1 mb-3">
//                   <MapPin className="w-5 h-5 text-blue-600" />
//                   <span className="font-semibold text-base text-black">
//                     {event.location}
//                   </span>
//                 </div>

//                 {event.status === "LIVE NOW" && (
//                   <div className="absolute -top-2 right-3  px-2 py-1 rounded-full flex items-center gap-1">
//                     <TbTimeDuration15 className="w-7 h-7 text-blue-500 " />
//                     <span className="text-base font-medium text-red-500 ">
//                       LIVE NOW!
//                     </span>
//                   </div>
//                 )}

//                 {event.date && event.time && (
//                   <div className="absolute -top-2 right-3 px-2 py-1 rounded-full flex items-center gap-1">
//                     <TbTimeDuration15 className="w-6 h-6 text-blue-500 " />
//                     <span className="text-sm font-semibold text-black">
//                       {event.date}{" "}
//                       <span className="text-sm font-semibold text-gray-600">
//                         {event.time}
//                       </span>
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Attendees */}
//               <div className="flex items-center gap-3">
//                 <div className="flex -space-x-3">
//                   {event.attendees.map((attendee, index) => (
//                     <Image
//                       key={attendee.id}
//                       src={attendee.avatar}
//                       alt={`Attendee ${index + 1}`}
//                       width={32}
//                       height={32}
//                       className="w-11 h-11 rounded-full border-2 border-white object-cover"
//                     />
//                   ))}
//                   <div className="w-11 h-11 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white">
//                     +40
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { TbTimeDuration15 } from "react-icons/tb";

export default function EventsList({ onLiveEventClick }) {
  const [activeTab, setActiveTab] = useState("events");

  const events = [
    {
      id: 1,
      title: "My cooking event tutorial",
      location: "Amuwo, Lagos, Nigeria",
      status: "LIVE NOW",
      image: "/Events.jpg",
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
      image: "/Events.jpg",
      attendees: [
        { id: 1, avatar: "/Rectangle 4.png" },
        { id: 2, avatar: "/Rectangle 4.png" },
        { id: 3, avatar: "/Rectangle 4.png" },
      ],
    },
  ];

  const handleLiveEventClick = (event) => {
    if (event.status === "LIVE NOW" && onLiveEventClick) {
      onLiveEventClick(event);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 ">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-600">Location</h1>

          <div className="flex items-center gap-2 ">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="text-base font-medium text-black">
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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-4">
        <div className="flex bg-gray-100 rounded-full p-2 max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === "events"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("myevents")}
            className={`flex-1 px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
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
      <div className="px-4 py-4 space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border-b overflow-hidden ${
              event.status === "LIVE NOW" ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
            }`}
            onClick={() => handleLiveEventClick(event)}
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
              {/* Concert crowd silhouette overlay for cooking event */}
              {event.id === 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent">
                  <div className="absolute bottom-0 w-full flex justify-center items-end">
                    <div className="w-8 h-12 bg-black opacity-60 rounded-t-full mx-1"></div>
                    <div className="w-6 h-10 bg-black opacity-60 rounded-t-full mx-1"></div>
                    <div className="w-10 h-14 bg-black opacity-60 rounded-t-full mx-1"></div>
                    <div className="w-7 h-11 bg-black opacity-60 rounded-t-full mx-1"></div>
                  </div>
                </div>
              )}

              {/* Live indicator */}
            </div>

            {/* Event Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-black mb-2">
                {event.title}
              </h3>

              <div className="relative mb-3">
                <div className="flex items-center gap-1 mb-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-base text-black">
                    {event.location}
                  </span>
                </div>

                {event.status === "LIVE NOW" && (
                  <div className="absolute -top-2 right-3 px-2 py-1 rounded-full flex items-center gap-1">
                    <TbTimeDuration15 className="w-7 h-7 text-blue-500 " />
                    <span className="text-base font-medium text-red-500 ">
                      LIVE NOW!
                    </span>
                  </div>
                )}

                {event.date && event.time && (
                  <div className="absolute -top-2 right-3 px-2 py-1 rounded-full flex items-center gap-1">
                    <TbTimeDuration15 className="w-6 h-6 text-blue-500 " />
                    <span className="text-sm font-semibold text-black">
                      {event.date}{" "}
                      <span className="text-sm font-semibold text-gray-600">
                        {event.time}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {event.attendees.map((attendee, index) => (
                    <Image
                      key={attendee.id}
                      src={attendee.avatar}
                      alt={`Attendee ${index + 1}`}
                      width={32}
                      height={32}
                      className="w-11 h-11 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <div className="w-11 h-11 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                    +40
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
