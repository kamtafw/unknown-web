"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";


interface TimeZonePageProps {
  onBack: () => void;
  onSave: () => void;
}

export default function TimeZonePage({ onBack, onSave }: TimeZonePageProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    "UTC-12:00 - Baker Island Time (BIT)"
  );

  const timeZones = [
    "UTC-12:00 - Baker Island Time (BIT)",
    "UTC-11:00 - Niue Time (NUT), Samoa Standard Time(SST)",
    "UTC-10:00 - Hawaii-Aleutian Standard Time (HAST), Tahiti Time (TAHT)",
    "UTC-09:00 - Alaska Standard Time (AKST)",
    "UTC-08:00 - Pacific Standard Time (PST), Clipperton Time (CLT)",
    "UTC-07:00 - Mountain Standard Time (MST)",
    "UTC-06:00 - Central Standard Time (CST), Easter Island Standard Time (EAST)",
    "UTC-05:00 - Eastern Standard Time (EST), Cuba Standard Time (CST)",
    "UTC+04:30 - Venezuela Time (VET)",
    "UTC+04:00 - Atlantic Standard Time (AST), Bolivia Time (BOT)",
  ];

  return (
    <div className="flex justify-center sm:justify-start w-full ml-3">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <ArrowLeft
              size={20}
              className="cursor-pointer text-gray-900"
              onClick={onBack}
              aria-label="Back to Account"
            />
            <h1 className="text-xl font-bold">Time Zone</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3">
          <div className="space-y-2">
            {timeZones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedTimeZone(zone)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedTimeZone === zone
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>

          <button
            onClick={onSave}
            className="mt-4 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm sm:text-base"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
