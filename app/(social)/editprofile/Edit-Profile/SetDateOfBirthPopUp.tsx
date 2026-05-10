"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useUpdateDob } from "@/services/profile/useProfileService";
import { useAuthStore } from "@/store/userStore";
import { toast } from "sonner";

interface SetDateOfBirthPopupProps {
  onClose: () => void;
}

export default function SetDateOfBirthPopup({
  onClose,
}: SetDateOfBirthPopupProps) {
  const user = useAuthStore((state) => state.user?.user);
  const updateDobMutation = useUpdateDob();

  const existingDob = user?.dob ? new Date(user.dob) : null;
  const [month, setMonth] = useState(
    existingDob
      ? existingDob.toLocaleString("en-US", { month: "short" })
      : "Jan"
  );
  const [day, setDay] = useState(
    existingDob ? existingDob.getDate().toString().padStart(2, "0") : "01"
  );
  const [year, setYear] = useState(
    existingDob ? existingDob.getFullYear().toString() : "2000"
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const years = Array.from({ length: 100 }, (_, i) => (2025 - i).toString());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Set Date of Birth</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1">
            <label
              htmlFor="month-select"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Month
            </label>
            <select
              id="month-select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="day-select"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Day
            </label>
            <select
              id="day-select"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="year-select"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Year
            </label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* <button
          onClick={() => {
            const monthIndex = months.indexOf(month) + 1;
            const dob = `${year}-${monthIndex
              .toString()
              .padStart(2, "0")}-${day}`;
            updateDobMutation.mutate({ dob }, { onSuccess: () => onClose() });
          }}
          disabled={updateDobMutation.isPending}
          className="mt-4 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm disabled:opacity-50"
        >
          {updateDobMutation.isPending ? "Saving..." : "Save"}
        </button> */}
        <button
          onClick={() => {
            const monthIndex = months.indexOf(month) + 1;
            const dob = `${year}-${monthIndex
              .toString()
              .padStart(2, "0")}-${day}`;
            const selectedDate = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - selectedDate.getFullYear();
            const monthDiff = today.getMonth() - selectedDate.getMonth();
            const dayDiff = today.getDate() - selectedDate.getDate();

            // Check if date is in the future
            if (selectedDate > today) {
              toast.error("Date of birth cannot be in the future.", {
                style: { background: "red", color: "white" },
              });
              return;
            }

            // Check if user is at least 13 years old
            const actualAge =
              age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
            if (actualAge < 13) {
              toast.error("You must be at least 13 years old.", {
                style: { background: "red", color: "white" },
              });
              return;
            }

            updateDobMutation.mutate({ dob }, { onSuccess: () => onClose() });
          }}
          disabled={updateDobMutation.isPending}
          className="mt-4 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm disabled:opacity-50"
        >
          {updateDobMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
