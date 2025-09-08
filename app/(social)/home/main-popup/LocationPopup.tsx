"use client";

import { X, Search, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface LocationPopupProps {
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

interface Location {
  id: string;
  name: string;
  description: string;
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Jos, Plateau State, Nigeria",
    description: "City in Nigeria",
  },
  {
    id: "2",
    name: "Abuja, Federal Capital Territory, Nigeria",
    description: "Capital of Nigeria",
  },
  {
    id: "3",
    name: "Lagos, Lagos State, Nigeria",
    description: "Commercial hub of Nigeria",
  },
  {
    id: "4",
    name: "Port Harcourt, Rivers State, Nigeria",
    description: "Oil city in Nigeria",
  },
  {
    id: "5",
    name: "Kano, Kano State, Nigeria",
    description: "Northern Nigeria",
  },
  {
    id: "6",
    name: "New York, NY, USA",
    description: "City in United States",
  },
  { id: "7", name: "London, UK", description: "Capital of United Kingdom" },
  { id: "8", name: "Paris, France", description: "Capital of France" },
  { id: "9", name: "Tokyo, Japan", description: "Capital of Japan" },
  {
    id: "10",
    name: "Dubai, UAE",
    description: "City in United Arab Emirates",
  },
];

export default function LocationPopup({
  onClose,
  onLocationSelect,
}: LocationPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);

      const timer = setTimeout(() => {
        const filteredLocations = mockLocations.filter(
          (location) =>
            location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setLocations(filteredLocations);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setLocations([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location.name);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold">Tag Location</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close location popup"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search location"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Searching locations...</div>
            </div>
          ) : searchQuery.trim() && locations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">No locations found</div>
            </div>
          ) : searchQuery.trim() ? (
            <div className="py-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
                  aria-label={`Select ${location.name}`}
                >
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {location.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {location.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">
                Start typing to search locations
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
