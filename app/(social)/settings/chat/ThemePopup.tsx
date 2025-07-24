"use client";

import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

interface ThemePopupProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ThemePopup({ onCancel, onConfirm }: ThemePopupProps) {
  const [selectedTheme, setSelectedTheme] = useState("System default");

  const themes = ["System default", "Light", "Dark"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] h-[250px] shadow-lg">
        <h2 className="text-lg font-semibold text-[16px]">Choose theme</h2>
        <RadioGroup
          value={selectedTheme}
          onValueChange={setSelectedTheme}
          className="mt-4 space-y-2"
        >
          {themes.map((theme, index) => (
            <div key={index} className="flex items-center gap-3 ">
              <RadioGroupItem
                value={theme}
                id={`theme-${index}`}
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor={`theme-${index}`} className="text-sm text-[16px]">
                {theme}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="mt-18 md:mt-30 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-red-400 mr-5 text-sm hover:text-red-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className="text-[#6A88D1] text-sm hover:text-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}