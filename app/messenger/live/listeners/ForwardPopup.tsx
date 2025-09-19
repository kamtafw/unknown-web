"use client";

import Image from "next/image";
import { useState } from "react";
import { IoArrowBack, IoSearch } from "react-icons/io5";

interface Person {
  id: number;
  name: string;
  number: string;
  profilePicture: string;
}

interface ForwardPopupProps {
  onBack: () => void;
  onSelect: () => void;
}

export function ForwardPopup({ onBack, onSelect }: ForwardPopupProps) {
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);

  const people: Person[] = [
    {
      id: 1,
      name: "John Doe",
      number: "+234 901 234 5678",
      profilePicture: "/Rectangle 4.png",
    },
    {
      id: 2,
      name: "Jane Smith",
      number: "+234 802 345 6789",
      profilePicture: "/Rectangle 1.png",
    },
    {
      id: 3,
      name: "Mike Johnson",
      number: "+234 703 456 7890",
      profilePicture: "/Rectangle 2.png",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      number: "+234 804 567 8901",
      profilePicture: "/Rectangle 3.png",
    },
    {
      id: 5,
      name: "David Brown",
      number: "+234 905 678 9012",
      profilePicture: "/Rectangle5.png",
    },
    {
      id: 6,
      name: "Emma Davis",
      number: "+234 706 789 0123",
      profilePicture: "/Rectangle 2.png",
    },
    {
      id: 7,
      name: "James Miller",
      number: "+234 807 890 1234",
      profilePicture: "/Rectangle 3.png",
    },
    {
      id: 8,
      name: "Lisa Anderson",
      number: "+234 908 901 2345",
      profilePicture: "/Rectangle 4.png",
    },
    {
      id: 9,
      name: "Robert Taylor",
      number: "+234 709 012 3456",
      profilePicture: "/Rectangle5.png",
    },
    {
      id: 10,
      name: "Maria Garcia",
      number: "+234 810 123 4567",
      profilePicture: "/Rectangle 1.png",
    },
    {
      id: 11,
      name: "William Jones",
      number: "+234 911 234 5678",
      profilePicture: "/Rectangle 2.png",
    },
    {
      id: 12,
      name: "Jennifer Lee",
      number: "+234 712 345 6789",
      profilePicture: "/Rectangle 3.png",
    },
    {
      id: 13,
      name: "Thomas Wilson",
      number: "+234 813 456 7890",
      profilePicture: "/Rectangle 4.png",
    },
    {
      id: 14,
      name: "Ashley Moore",
      number: "+234 914 567 8901",
      profilePicture: "/Rectangle5.png",
    },
    {
      id: 15,
      name: "Christopher White",
      number: "+234 715 678 9012",
      profilePicture: "/Rectangle 4.png",
    },
  ];

  const handlePersonToggle = (personId: number) => {
    setSelectedPeople((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  return (
    <div className="w-[300px] h-[450px] bg-white rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <IoArrowBack className="text-gray-600 text-xl" />
          </button>
          <h3 className="text-lg font-medium">Send to</h3>
        </div>

        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Search"
        >
          <IoSearch className="text-gray-600 text-xl" />
        </button>
      </div>

      {/* People List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="p-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Profile Picture */}
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                 <Image
                  src={person.profilePicture}
                  alt={person.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name and Number */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {person.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {person.number}
                </p>
              </div>

              {/* Checkbox */}
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(person.id)}
                  onChange={() => handlePersonToggle(person.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  title={`Select ${person.name}`}
                  placeholder={`Select ${person.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Select Button */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={onSelect}
          disabled={selectedPeople.length === 0}
          className={`w-full py-2 px-4 rounded-full text-sm font-medium transition-colors ${
            selectedPeople.length > 0
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Select ({selectedPeople.length})
        </button>
      </div>
    </div>
  );
}