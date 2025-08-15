"use client";

import { useState } from "react";
import { ArrowLeft, Search, Smile } from "lucide-react";
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { IoAlarmSharp } from "react-icons/io5";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CallSchedulePopup } from "./CallSchedulePopup";

interface AddCallReminderPopupProps {
  onClose: () => void;
}

export function AddCallReminderPopup({ onClose }: AddCallReminderPopupProps) {
  const [reason, setReason] = useState("");
  const [scheduledDate, setScheduledDate] = useState("DD - MM - YYYY");
  const [scheduledTime, setScheduledTime] = useState("8:00");
  const [showEmojiPopover, setShowEmojiPopover] = useState(false);
  const [showCallSchedulePopup, setShowCallSchedulePopup] = useState(false);

  const emojis = ["😀", "😂", "😍", "🤔", "😎", "🎉", "💡", "🔥"];

  const addEmoji = (emoji: string) => {
    setReason((prev) => prev + " " + emoji);
    setShowEmojiPopover(false);
  };

  const handleCreateSchedule = () => {
    setShowCallSchedulePopup(true);
  };

  if (showCallSchedulePopup) {
    return (
      <CallSchedulePopup
        onClose={onClose}
        onBack={() => setShowCallSchedulePopup(false)}
        callReason={reason}
        scheduledDate={scheduledDate}
        scheduledTime={scheduledTime}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] h-[500px] flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="close"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Call Schedule</h2>
          </div>
          <Search className="h-7 w-7 text-black" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Reason to Call */}
          <div>
            <p className="text-black mb-3">Reason to call</p>
            <div className="border rounded-lg p-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full resize-none border-none outline-none mb-2"
                rows={3}
                placeholder="Type the reason for your call..."
                maxLength={100}
              />
              <div className="flex items-center justify-end">
                <Popover
                  open={showEmojiPopover}
                  onOpenChange={setShowEmojiPopover}
                >
                  <PopoverTrigger asChild>
                    <button
                      className="text-black mr-2 hover:text-gray-600"
                      aria-label="smile"
                    >
                      <Smile size={20} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="grid grid-cols-4 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className="text-xl hover:bg-gray-100 p-2 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <span className="text-gray-400 text-sm">
                  {reason.length}/100
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Date and Time */}
          <div className="flex gap-8">
            <div className="flex-1">
              <p className="text-gray-700 mb-3">Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full border rounded-full p-3 flex items-center justify-between bg-gray-100">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt size={16} className="text-black" />
                      <span className="text-black">{scheduledDate}</span>
                    </div>
                    <FaCaretDown size={16} className="text-black" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                  <input
                    type="date"
                    value={
                      scheduledDate === "DD - MM - YYYY" ? "" : scheduledDate
                    }
                    onChange={(e) =>
                      setScheduledDate(e.target.value || "DD - MM - YYYY")
                    }
                    className="w-full border rounded p-2"
                    aria-label="Select scheduled date"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <p className="text-gray-700 mb-3">Time</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full border rounded-full p-3 flex items-center justify-between bg-gray-100">
                    <div className="flex items-center gap-2">
                      <IoAlarmSharp size={16} className="text-black" />
                      <span className="text-black">{scheduledTime}</span>
                    </div>
                    <FaCaretDown size={16} className="text-black" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-4">
                  <input
                    type="time"
                    value={scheduledTime === "8:00" ? "" : scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value || "8:00")}
                    className="w-full border rounded p-2"
                    aria-label="Select scheduled time"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Create Schedule Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleCreateSchedule}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full font-medium transition-colors"
          >
            Create schedule
          </button>
        </div>
      </div>
    </div>
  );
}
