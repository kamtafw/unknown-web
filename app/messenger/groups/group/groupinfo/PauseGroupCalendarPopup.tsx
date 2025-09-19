"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PauseGroupCalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export function PauseGroupCalendarPopup({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
}: PauseGroupCalendarPopupProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"days" | "months" | "years">("days");

  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentDate(new Date(selectedDate));
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getYearRange = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateString = newDate.toISOString().split("T")[0];
    onSelectDate(dateString);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setView("days");
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setView("months");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (view === "days") {
      const newDate = new Date(currentDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
    } else if (view === "years") {
      const currentYear = currentDate.getFullYear();
      const startYear = Math.floor(currentYear / 12) * 12;
      const newStartYear =
        direction === "prev" ? startYear - 12 : startYear + 12;
      setCurrentDate(new Date(newStartYear, currentDate.getMonth(), 1));
    } else if (view === "months") {
      const newDate = new Date(currentDate);
      if (direction === "prev") {
        newDate.setFullYear(newDate.getFullYear() - 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
      setCurrentDate(newDate);
    }
  };

  const renderDaysView = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date();
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    return (
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-xs text-gray-500 text-center py-1 font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="aspect-square">
              {day && (
                <button
                  onClick={() => handleDateSelect(day)}
                  className={`w-full h-full text-sm rounded-lg transition-colors ${
                    isCurrentMonth && day === today.getDate()
                      ? "bg-blue-500 text-white font-medium"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthsView = () => (
    <div className="grid grid-cols-3 gap-2">
      {months.map((month, index) => (
        <button
          key={month}
          onClick={() => handleMonthSelect(index)}
          className={`p-3 text-sm rounded-lg transition-colors ${
            index === currentDate.getMonth()
              ? "bg-blue-500 text-white font-medium"
              : "hover:bg-gray-100 text-gray-900"
          }`}
        >
          {month.substring(0, 3)}
        </button>
      ))}
    </div>
  );

  const renderYearsView = () => {
    const years = getYearRange();

    return (
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            className={`p-3 text-sm rounded-lg transition-colors ${
              year === currentDate.getFullYear()
                ? "bg-blue-500 text-white font-medium"
                : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (view === "days") {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === "months") {
      return currentDate.getFullYear().toString();
    } else {
      const years = getYearRange();
      return `${years[0]} - ${years[years.length - 1]}`;
    }
  };

  const handleHeaderClick = () => {
    if (view === "days") {
      setView("months");
    } else if (view === "months") {
      setView("years");
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[200px] mx-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigateMonth("prev")}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={handleHeaderClick}
            className="text-sm font-medium text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          >
            {getHeaderTitle()}
          </button>

          <button
            type="button"
            onClick={() => navigateMonth("next")}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Content */}
        <div className="mb-4">
          {view === "days" && renderDaysView()}
          {view === "months" && renderMonthsView()}
          {view === "years" && renderYearsView()}
        </div>

        {/* Set Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-full px-8 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
