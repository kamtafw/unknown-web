import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface PeoplePopupProps {
  onClose: () => void;
}

interface Person {
  id: number;
  name: string;
  username: string;
  image: string;
  isHost: boolean;
}

export function PeoplePopup({ onClose }: PeoplePopupProps) {
  const [activeTab, setActiveTab] = useState<"all" | "hosts" | "guest">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const people: Person[] = [
    {
      id: 1,
      name: "Victoria adhs",
      username: "@Victoria_adhs",
      image: "/Rectangle 3.png",
      isHost: true,
    },
    {
      id: 2,
      name: "Devon Lane",
      username: "@Devon_Lane",
      image: "/Rectangle 4.png",
      isHost: false,
    },
    {
      id: 3,
      name: "Darlene Robertson",
      username: "@Darlene_Robertson",
      image: "/Rectangle 4.png",
      isHost: false,
    },
  ];

  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "hosts") {
      return matchesSearch && person.isHost;
    }
    if (activeTab === "guest") {
      return matchesSearch && !person.isHost;
    }
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Leave
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search guest"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium mr-2 ${
              activeTab === "all"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("hosts")}
            className={`px-4 py-2 rounded-full text-sm font-medium mr-2 ${
              activeTab === "hosts"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Hosts
          </button>
          <button
            onClick={() => setActiveTab("guest")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === "guest"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Guest
          </button>
        </div>

        {/* People List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPeople.map((person) => (
            <div key={person.id} className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={person.image}
                  alt={person.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {person.name}
                  </span>
                  {person.isHost && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Host
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{person.username}</p>
              </div>
            </div>
          ))}

          {filteredPeople.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No people found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
