"use client";

import { useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { PauseGroupCalendarPopup } from "./PauseGroupCalendarPopup";
import { PauseGroupTimePopup } from "./PauseGroupTimePopup";

interface PauseGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (settings: { duration?: { date: string; time: string } }) => void;
}

export function PauseGroupPopup({
  isOpen,
  onClose,
  onConfirm,
}: PauseGroupPopupProps) {
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");
  const [addDuration, setAddDuration] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
    // Reset state
    setSelectedOption("yes");
    setAddDuration(false);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleOk = () => {
    const settings =
      addDuration && selectedDate && selectedTime
        ? { duration: { date: selectedDate, time: selectedTime } }
        : {};

    onConfirm?.(settings);
    onClose();
    // Reset state
    setSelectedOption("yes");
    setAddDuration(false);
    setSelectedDate("");
    setSelectedTime("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Set date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Set time";
    return timeString;
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
        <div className="relative bg-white rounded-2xl shadow-xl w-[350px] mx-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pause group</h3>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Pausing this group will automatically suspend all activity, do you
              wish to continue?
            </p>

            {/* Yes/No Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pauseOption"
                  value="yes"
                  checked={selectedOption === "yes"}
                  onChange={(e) =>
                    setSelectedOption(e.target.value as "yes" | "no")
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">Yes</span>
              </label>

              {/* Add duration toggle */}
              {selectedOption === "yes" && (
                <div className="ml-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Add duration (optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddDuration(!addDuration)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        addDuration ? "bg-green-500" : "bg-gray-300"
                      }`}
                      aria-label={`${
                        addDuration ? "Disable" : "Enable"
                      } duration setting`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          addDuration ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Date and Time pickers */}
                  {addDuration && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCalendar(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiCalendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          {formatDate(selectedDate)}
                        </span>
                      </button>

                      <button
                        onClick={() => setShowTimePicker(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiClock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          {formatTime(selectedTime)}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pauseOption"
                  value="no"
                  checked={selectedOption === "no"}
                  onChange={(e) =>
                    setSelectedOption(e.target.value as "yes" | "no")
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">No</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOk}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ok
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Popup */}
      <PauseGroupCalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setShowCalendar(false);
        }}
        selectedDate={selectedDate}
      />

      {/* Time Picker Popup */}
      <PauseGroupTimePopup
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={(time) => {
          setSelectedTime(time);
          setShowTimePicker(false);
        }}
        selectedTime={selectedTime}
      />
    </>
  );
}
