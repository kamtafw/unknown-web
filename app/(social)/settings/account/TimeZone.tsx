"use client";

import { ArrowLeft } from "lucide-react";
import {
  useGetCurrentTimezone,
  useGetAvailableTimezones,
  useChangeTimezone,
} from "@/services/account/useAccountService";
import { useAccountStore } from "@/store/accountStore";

interface TimeZonePageProps {
  onBack: () => void;
  onSave: () => void;
}

export default function TimeZonePage({ onBack, onSave }: TimeZonePageProps) {
  const currentTimezone = useAccountStore((state) => state.currentTimezone);
  const setCurrentTimezone = useAccountStore(
    (state) => state.setCurrentTimezone
  );

const { isLoading: isLoadingCurrent } = useGetCurrentTimezone();
const { data: timezonesData, isLoading: isLoadingTimezones } = useGetAvailableTimezones("en");
const { mutate: changeTimezone, isPending } = useChangeTimezone();

  const handleSave = () => {
    if (currentTimezone) {
      changeTimezone(
        { timezone: currentTimezone },
        {
          onSuccess: () => {
            onSave();
          },
        }
      );
    }
  };

  const timeZones = timezonesData?.data?.timezones || [];

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
          {isLoadingTimezones || isLoadingCurrent ? (
            <p className="text-center">Loading timezones...</p>
          ) : (
            <div className="space-y-2">
              {timeZones.map((zone: { value: string; label: string }) => (
                <button
                  key={zone.value}
                  onClick={() => setCurrentTimezone(zone.value)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    currentTimezone === zone.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || !currentTimezone}
            className="mt-4 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm sm:text-base disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
