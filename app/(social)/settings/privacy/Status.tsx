"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import MyContactExceptStatusPage from "./MyContactExpectStatus";
import OnlyShareWithStatusPage from "./OnlyShareWithStatus";
import { usePrivacyStore } from "@/store/privacyStore";
import { useUpdateStatusVisibility } from "@/services/privacy/usePrivacyService";

interface StatusPageProps {
  activeView: string;
  onBack: () => void;
  onNavigate?: (view: string) => void;
  onUpdateText: (text: string) => void;
}

export default function StatusPage({
  activeView,
  onBack,
  onNavigate,
  onUpdateText,
}: StatusPageProps) {
  const statusVisibilityData = usePrivacyStore(
    (state) => state.statusVisibilityData
  );
  const excludedContactIds = usePrivacyStore(
    (state) => state.excludedContactIds
  );
  const includedContactIds = usePrivacyStore(
    (state) => state.includedContactIds
  );
  const updateStatusMutation = useUpdateStatusVisibility();

  const selectedStatusOption = usePrivacyStore(
    (state) => state.selectedStatusOption
  );
  const setSelectedStatusOption = usePrivacyStore(
    (state) => state.setSelectedStatusOption
  );
  const [selectedOption, setSelectedOption] = useState<string>(
    selectedStatusOption || ""
  );
  const [excludedCount, setExcludedCount] = useState(0);
  const [includedCount, setIncludedCount] = useState(0);

  useEffect(() => {
    if (statusVisibilityData) {
      const visibility = statusVisibilityData.status_visibility;
      const visibilityMap: Record<string, string> = {
        everyone: "Everyone",
        my_contacts_except: "My contact except",
        only_share_with: "Only share with",
        nobody: "Nobody",
      };

      const mappedOption = visibilityMap[visibility];
      if (mappedOption && !selectedOption) {
        setSelectedOption(mappedOption);

        if (visibility === "my_contacts_except") {
          setExcludedCount(statusVisibilityData.except_users.length);
        } else if (visibility === "only_share_with") {
          setIncludedCount(statusVisibilityData.only_share_with_users.length);
        }
      }
    }
  }, [statusVisibilityData, selectedOption]);

  useEffect(() => {
    setExcludedCount(excludedContactIds.length);
  }, [excludedContactIds]);

  useEffect(() => {
    setIncludedCount(includedContactIds.length);
  }, [includedContactIds]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    setSelectedStatusOption(value);

    const payload: {
      status_visibility: string;
      except_users?: number[];
      only_share_with_users?: number[];
    } = {
      status_visibility: "",
    };

    if (value === "Everyone") {
      payload.status_visibility = "everyone";
    } else if (value === "My contact except") {
      payload.status_visibility = "my_contacts_except";
      payload.except_users =
        excludedContactIds.length > 0 ? excludedContactIds : [];
    } else if (value === "Only share with") {
      payload.status_visibility = "only_share_with";
      payload.only_share_with_users =
        includedContactIds.length > 0 ? includedContactIds : [];
    } else if (value === "Nobody") {
      payload.status_visibility = "nobody";
    }

    if (value === "Everyone" || value === "Nobody") {
      updateStatusMutation.mutate(payload); 
    }
    

    else if (value === "My contact except" && excludedContactIds.length > 0) {
      updateStatusMutation.mutate(payload);
    } else if (value === "Only share with" && includedContactIds.length > 0) {
      updateStatusMutation.mutate(payload);
    }

    const statusText =
      value === "My contact except"
        ? `My contact except, ${excludedCount} excluded`
        : value === "Only share with"
        ? `Only share with, ${includedCount} included`
        : value;
    onUpdateText(statusText);
  };

  const handleBack = () => {
    const statusText =
      selectedOption === "My contact except"
        ? `My contact except, ${excludedCount} excluded`
        : selectedOption === "Only share with"
        ? `Only share with, ${includedCount} included`
        : selectedOption;
    onUpdateText(statusText);
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
            <h1 className="text-xl font-bold">Status</h1>
          </div>
        </div>
        <div className="px-4 py-2">
          <p className="text-[14px] text-gray-600 mb-6">
            Who can see my status
          </p>
          <RadioGroup
            value={selectedOption}
            onValueChange={handleOptionChange}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Everyone"
                id="status-everyone"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="status-everyone" className="text-sm">
                Everyone
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="My contact except"
                id="status-my-contact-except"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="status-my-contact-except" className="text-sm">
                My contact except
              </Label>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onNavigate) {
                    onNavigate("myContactExceptStatus");
                  }
                }}
                className="ml-auto text-[14px] text-blue-500"
              >
                {excludedCount} excluded
              </button>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Only share with"
                id="status-only-share"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="status-only-share" className="text-sm">
                Only share with
              </Label>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onNavigate) {
                    onNavigate("onlyShareWithStatus");
                  }
                }}
                className="ml-auto text-[14px] text-blue-500"
              >
                {includedCount} included
              </button>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="Nobody"
                id="status-nobody"
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor="status-nobody" className="text-sm">
                Nobody
              </Label>
            </div>
          </RadioGroup>
        </div>
        {activeView === "myContactExceptStatus" && (
          <MyContactExceptStatusPage
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
        {activeView === "onlyShareWithStatus" && (
          <OnlyShareWithStatusPage
            onBack={handleBack}
            onUpdateText={(count) => {
              setSelectedOption("Only share with");
              setIncludedCount(count);
              onUpdateText(`Only share with, ${count} included`);
            }}
            initialCount={includedCount}
            setIncludedCount={setIncludedCount}
          />
        )}
      </div>
    </div>
  );
}
