"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowUp, ArrowDown } from "lucide-react";
import { FaCalendarDays } from "react-icons/fa6";

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendar: () => void;
}

export function SearchPopup({ isOpen, onClose, onOpenCalendar }: SearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the search input when popup opens
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Handle search logic here
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      
      {/* Search Popup */}
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-120">
        {/* Search Form */}
        <div className="p-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AI's"
                  className="w-full pl-10 pr-4 py-2 border-white/80 rounded-full"
                />
              </div>

              {/* Action Buttons */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
                title="Search up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
                title="Search down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={onOpenCalendar}
                title="Open calendar"
              >
                <FaCalendarDays className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}