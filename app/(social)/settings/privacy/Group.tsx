"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import MyContactExceptGroupPage from "./MyContactExpectGroup";

interface GroupPageProps {
  activeView: string;
  onBack: () => void;
  onNavigate?: (view: string) => void;
  onUpdateText: (text: string) => void;
  initialOption?: string;
  initialExcludedCount?: number;
}

export default function GroupPage({
  activeView,
  onBack,
  onNavigate,
  onUpdateText,
  initialOption = "Everyone",
  initialExcludedCount = 47,
}: GroupPageProps) {
  const [selectedOption, setSelectedOption] = useState<string>(initialOption);
  const [excludedCount, setExcludedCount] = useState(initialExcludedCount);

  useEffect(() => {
    setSelectedOption(initialOption);
  }, [initialOption]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    const groupText = value === "My contact except" ? `My contact except, ${excludedCount} excluded` : value;
    onUpdateText(groupText);
  };

  const handleBack = () => {
    const groupText = selectedOption === "My contact except" ? `My contact except, ${excludedCount} excluded` : selectedOption;
    onUpdateText(groupText);
    onBack();
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-full bg-gray-100"
              aria-label="Back to Privacy"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Groups</h1>
          </div>
        </div>
        <div className="px-4 py-2">
          <p className="text-[14px] text-gray-600 mb-6">Who can add me to groups</p>
          <RadioGroup
            value={selectedOption}
            onValueChange={handleOptionChange}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Everyone"
                id="group-everyone"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="group-everyone" className="text-sm">Everyone</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="My contacts"
                id="group-my-contacts"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="group-my-contacts" className="text-sm">My contacts</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="My contact except"
                id="group-my-contact-except"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="group-my-contact-except" className="text-sm">My contact except</Label>
              <button
                onClick={() => onNavigate && onNavigate("myContactExceptGroup")}
                className="ml-auto text-[14px] text-blue-500"
              >
                {excludedCount} excluded
              </button>
            </div>
          </RadioGroup>
          <p className="text-[14px] text-gray-600 mt-8">
            Admins who can&#39;t add you to a group have the option of inviting you privately instead
          </p>
          <p className="text-[14px] text-gray-600 mt-8">
            This setting does not apply to community announcement groups. If you are added to a community, you will always be added to a community announcement group.
          </p>
        </div>
        {activeView === "myContactExceptGroup" && (
          <MyContactExceptGroupPage
            onBack={handleBack}
            onUpdateText={(count) => {
              setSelectedOption("My contact except");
              setExcludedCount(count);
              onUpdateText(`My contact except, ${count} excluded`);
            }}
            initialCount={excludedCount}
            setExcludedCount={setExcludedCount}
          />
        )}
      </div>
    </div>
  );
}
