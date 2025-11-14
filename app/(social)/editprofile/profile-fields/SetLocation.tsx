"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useUpdateLocation } from "@/services/profile/useProfileService";
import { useAuthStore } from "@/store/userStore";

interface SetLocationPageProps {
  onBack: () => void;
  onSave: () => void;
}

export default function SetLocationPage({
  onBack,
  onSave,
}: SetLocationPageProps) {
  const user = useAuthStore((state) => state.user?.user);
  const [country, setCountry] = useState(user?.country || "Nigeria");
  const [state, setState] = useState(user?.state || "Lagos");
  const updateLocationMutation = useUpdateLocation();

  const countries = ["Nigeria", "United States", "United Kingdom"];
  const states: { [key: string]: string[] } = {
    Nigeria: ["Lagos", "Abuja", "Rivers"],
    "United States": ["California", "New York", "Texas"],
    "United Kingdom": ["London", "Manchester", "Birmingham"],
  };

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] bg-white overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-2">
            <ArrowLeft
              size={20}
              className="cursor-pointer text-gray-900 sm:w-6 sm:h-6"
              onClick={onBack}
            />
            <h1 className="text-base font-bold sm:text-lg">Set Location</h1>
          </div>
        </div>
        <div className=" mt-7 px-3 py-3 sm:px-4 sm:py-4">
          <div className="mb-4">
            <label
              htmlFor="country-select"
              className="block text-gray-900 text-sm sm:text-base font-semibold mb-2"
            >
              Country
            </label>
            <div className="relative">
              <select
                id="country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base appearance-none bg-white"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
            <label
              htmlFor="state-select"
              className="block text-gray-900 text-sm sm:text-base font-semibold mb-2 mt-4"
            >
              State
            </label>
            <div className="relative">
              <select
                id="state-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base appearance-none bg-white"
              >
                {states[country]?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>
          <button
            onClick={() => {
              updateLocationMutation.mutate(
                { country, state },
                { onSuccess: () => onSave() }
              );
            }}
            disabled={updateLocationMutation.isPending}
            className=" mt-160 md:mt-170 w-full h-[30px] py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm sm:text-base disabled:opacity-50"
          >
            {updateLocationMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
