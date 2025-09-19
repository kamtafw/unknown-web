"use client";

import { PiPencilSimpleLineBold } from "react-icons/pi";
import { IoAlarmSharp } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";

const scheduledReminders = [
  {
    id: "1",
    date: "1 December 2024, 14.25",
    message: "Team meeting at 3 PM - prepare presentation slides"
  },
  {
    id: "2",
    date: "2 December 2024, 10.30",
    message: "Call dentist to schedule appointment"
  },
  {
    id: "3",
    date: "3 December 2024, 16.45",
    message: "Submit expense reports before deadline"
  },
  {
    id: "4",
    date: "5 December 2024, 09.15",
    message: "Buy groceries for weekend party"
  }
];

export function ReminderTab() {
  return (
    <div className="space-y-4">
      {scheduledReminders.map((reminder, index) => (
        <div key={reminder.id}>
          <div className="flex items-start gap-3 p-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <IoAlarmSharp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">{reminder.date}</p>
              <p className="text-sm text-gray-700">{reminder.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="pen">
                <PiPencilSimpleLineBold className="h-6 w-6 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="delete">
                <RiDeleteBin5Line className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
          {index < scheduledReminders.length - 1 && (
            <hr className="border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}