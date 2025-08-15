"use client";

import { useState, useEffect } from "react";

interface PauseGroupTimePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime: (time: string) => void;
  selectedTime?: string;
}

export function PauseGroupTimePopup({
  isOpen,
  onClose,
  onSelectTime,
  selectedTime,
}: PauseGroupTimePopupProps) {
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");


  useEffect(() => {
    if (isOpen && selectedTime) {
      const timeMatch = selectedTime.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
      if (timeMatch) {
        setSelectedHour(timeMatch[1].padStart(2, '0'));
        setSelectedMinute(timeMatch[2]);
        setSelectedPeriod(timeMatch[3].toUpperCase() as "AM" | "PM");
      }
    } else if (isOpen) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      setSelectedHour((hour % 12 || 12).toString().padStart(2, '0'));
      setSelectedMinute(minute.toString().padStart(2, '0'));
      setSelectedPeriod(hour >= 12 ? "PM" : "AM");
    }
  }, [isOpen, selectedTime]);

  if (!isOpen) return null;

  const hours = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  const minutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  const handleSetTime = () => {
    const timeString = `${selectedHour}:${selectedMinute}:00 ${selectedPeriod}`;
    onSelectTime(timeString);
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[200px] mx-4 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Set time</h3>
        </div>

        {/* Time Picker */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {/* Hour Picker */}
          <div className="flex flex-col items-center">
            <div className="h-32 overflow-y-auto scrollbar-hide border rounded-lg w-16">
              <div className="py-2">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`w-full py-2 text-center transition-colors ${
                      selectedHour === hour
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-2xl font-bold text-gray-400 mx-1">:</div>

          {/* Minute Picker */}
          <div className="flex flex-col items-center">
            <div className="h-32 overflow-y-auto scrollbar-hide border rounded-lg w-16">
              <div className="py-2">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={`w-full py-2 text-center transition-colors ${
                      selectedMinute === minute
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AM/PM Picker */}
          <div className="flex flex-col items-center ml-4">
            <div className="flex flex-col border rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedPeriod("AM")}
                className={`px-4 py-3 transition-colors ${
                  selectedPeriod === "AM"
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                AM
              </button>
              <button
                onClick={() => setSelectedPeriod("PM")}
                className={`px-4 py-3 transition-colors ${
                  selectedPeriod === "PM"
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Set Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSetTime}
            className="w-full px-8 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}