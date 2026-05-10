"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import {
  useGetLastSeenVisibility,
  useUpdateOnlineVisibility,
  useUpdateLastSeenVisibility,
} from "@/services/privacy/usePrivacyService";
import { usePrivacyStore } from "@/store/privacyStore";

const visibilityToUI: Record<string, string> = {
  everyone: "Everyone",
  my_contacts: "My contacts",
  my_contacts_except: "My contact except",
  nobody: "Nobody",
  same_as_last_seen: "Same as last seen",
};

const uiToVisibility: Record<string, string> = {
  Everyone: "everyone",
  "My contacts": "my_contacts",
  "My contact except": "my_contacts_except",
  Nobody: "nobody",
  "Same as last seen": "same_as_last_seen",
};

interface LastSeenOnlinePageProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export default function LastSeenOnlinePage({
  onBack,
  onNavigate,
}: LastSeenOnlinePageProps) {
const { isLoading } = useGetLastSeenVisibility();
  const updateOnlineVisibilityMutation = useUpdateOnlineVisibility();
  const updateLastSeenVisibilityMutation = useUpdateLastSeenVisibility();

  const excludedContactIds = usePrivacyStore(
    (state) => state.excludedContactIds
  );
  const lastSeenVisibility = usePrivacyStore(
    (state) => state.lastSeenVisibility
  );
  const onlineVisibility = usePrivacyStore((state) => state.onlineVisibility);

  const [personalInfo, setPersonalInfo] = useState<string>("Everyone");
  const [onlineStatus, setOnlineStatus] = useState<string>("Everyone");

  const handlePersonalInfoChange = (value: string) => {
    setPersonalInfo(value);

    const apiValue = uiToVisibility[value] || "everyone";
    updateLastSeenVisibilityMutation.mutate({
      last_seen_visibility: apiValue,
    });
  };

  const handleOnlineStatusChange = (value: string) => {
    setOnlineStatus(value);

    const apiValue = uiToVisibility[value] || "everyone";
    updateOnlineVisibilityMutation.mutate({
      online_visibility: apiValue,
    });
  };

  const handleNavigateToMyContactExcept = () => {
    if (onNavigate) {
      onNavigate("myContactExcept");
    }
  };

  useEffect(() => {
    if (lastSeenVisibility) {
      const uiValue = visibilityToUI[lastSeenVisibility] || "Everyone";
      setPersonalInfo(uiValue);
    }
  }, [lastSeenVisibility]);

  useEffect(() => {
    if (onlineVisibility) {
      const uiValue = visibilityToUI[onlineVisibility] || "Everyone";
      setOnlineStatus(uiValue);
    }
  }, [onlineVisibility]);

if (isLoading) {
    return (
      <div className="flex ml-3 justify-center sm:justify-start w-full">
        <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black flex items-center justify-center shadow-md rounded-lg">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-gray-100"
              aria-label="Back to Privacy"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Last seen and Online</h1>
          </div>
        </div>
        <div className="px-4 py-2">
          <p className="text-[14px] text-gray-600 mb-6">
            Who can see my personal info
          </p>
          <RadioGroup
            value={personalInfo}
            onValueChange={handlePersonalInfoChange}
            className="space-y-7"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Everyone"
                id="personal-everyone"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="personal-everyone" className="text-sm">
                Everyone
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="My contacts"
                id="personal-my-contacts"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="personal-my-contacts" className="text-sm">
                My contacts
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="My contact except"
                id="personal-my-contact-except"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
                onClick={handleNavigateToMyContactExcept}
              />
              <Label
                htmlFor="personal-my-contact-except"
                className="text-sm cursor-pointer"
                onClick={handleNavigateToMyContactExcept}
              >
                My contact except
              </Label>
              <button
                onClick={handleNavigateToMyContactExcept}
                className="ml-auto mr-3 text-[14px] text-blue-500"
              >
                {excludedContactIds.length} excluded
              </button>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Nobody"
                id="personal-nobody"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="personal-nobody" className="text-sm">
                Nobody
              </Label>
            </div>
          </RadioGroup>
          <div className="mt-4 h-px w-full bg-gray-300" />
          <p className="text-[14px] text-gray-600 mt-4">
            Who can see when I am online
          </p>
          <RadioGroup
            value={onlineStatus}
            onValueChange={handleOnlineStatusChange}
            className="space-y-7 mt-7"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Everyone"
                id="online-everyone"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="online-everyone" className="text-sm">
                Everyone
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Same as last seen"
                id="online-same"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="online-same" className="text-sm">
                Same as last seen
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
