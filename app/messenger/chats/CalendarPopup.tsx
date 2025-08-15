"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarPopup({ isOpen, onClose }: CalendarPopupProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (showYearMonthPicker) {
          setShowYearMonthPicker(false);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showYearMonthPicker && !target.closest('.relative')) {
        setShowYearMonthPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose, showYearMonthPicker]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; 

    const days = [];
    

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }


    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleYearMonthSelect = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1));
    setShowYearMonthPicker(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const handleSetDate = () => {
    if (selectedDate) {
      console.log('Selected date:', selectedDate);
      onClose();
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  if (!isOpen) return null;

  const days = getDaysInMonth(currentDate);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      
      {/* Calendar Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 relative">
            <span className="text-lg font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
              title="Select month/year"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Year/Month Picker Dropdown */}
            {showYearMonthPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 max-h-80 overflow-auto">
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Years Column */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Year</h4>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {generateYears().map((year) => (
                          <button
                            key={year}
                            className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                              year === currentDate.getFullYear() ? 'bg-blue-100 text-blue-600' : ''
                            }`}
                            onClick={() => handleYearMonthSelect(year, currentDate.getMonth())}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Months Column */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Month</h4>
                      <div className="space-y-1">
                        {monthNames.map((month, index) => (
                          <button
                            key={month}
                            className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                              index === currentDate.getMonth() ? 'bg-blue-100 text-blue-600' : ''
                            }`}
                            onClick={() => handleYearMonthSelect(currentDate.getFullYear(), index)}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <div key={index} className="aspect-square">
                {date ? (
                  <Button
                    variant="ghost"
                    className={`w-full h-full text-sm ${
                      isToday(date) 
                        ? 'bg-blue-100 text-blue-600 font-semibold' 
                        : isSelected(date)
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.getDate()}
                  </Button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            onClick={handleSetDate}
            disabled={!selectedDate}
          >
            Set
          </Button>
        </div>
      </div>
    </>
  );
}