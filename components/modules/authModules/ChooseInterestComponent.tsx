"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useGetListOfInterests,
  useSetUserInterests,
} from "@/services/queryHooks/useUserAuthService";
import CustomLoader from "@/components/shared/Loader/CustomLoader";
import { Skeleton } from "@/components/ui/skeleton";
import FriendsSuggestionModal from "./FriendsSuggestionModal";

const ChooseInterestComponent = () => {
  const [displaySuggestions, setDisplaySuggestions] = useState(false);
  const { data: interest, isLoading } = useGetListOfInterests();
  const { mutate, isPending, error, isSuccess } = useSetUserInterests();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleSelect = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    const payload = {
      interests: selectedInterests,
    };
    mutate(payload);
  };

useEffect(() => {
  if (isSuccess) {
    setDisplaySuggestions(true);
  }
}, [isSuccess]); 

  console.log("error", error);

  return (
    <>
      <div className="flex flex-col w-full max-w-[430px] gap-[32px]">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        )}
        <div className="w-full flex flex-wrap gap-[12px]">
            {!isLoading && interest?.map((item: string, index: number) => { 
              const isSelected = selectedInterests.includes(item);

              return (
                <Button
                  type="button"
                  key={index}
                  onClick={() => handleSelect(item)}
                  className={`py-[6px] px-[16px] rounded-full text-sm font-semibold cursor-pointer 
              ${
                isSelected
                  ? "bg-[#6A88D1] text-[#F9FAFB] border-none"
                  : "bg-white text-[#111827] border border-[#D1D5DB] hover:bg-[#6A88D1] hover:text-[#F9FAFB] hover:border-none"
              }`}
                >
                  {item}
                </Button>
              );
            })}
        </div>
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-[20px]">
          <Button
  type="button"
  onClick={() => setDisplaySuggestions(true)}
  className="bg-[#F3F4F6] text-base font-semibold text-[#6A88D1] py-[14px] px-[24px] rounded-[12px] cursor-pointer w-full lg:w-1/2 h-[52px]"
>
  Skip
</Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-[#6A88D1] text-base font-semibold text-[#FFFFFF] py-[14px] px-[24px] rounded-[12px] cursor-pointer w-full lg:w-1/2 h-[52px]"
          >
            {isPending ? <CustomLoader /> : "Next"}
          </Button>
        </div>
      </div>
      {displaySuggestions && (
        <FriendsSuggestionModal
          setDisplaySuggestions={setDisplaySuggestions}
          displaySuggestions={displaySuggestions}
        />
      )}
    </>
  );
};

export default ChooseInterestComponent;
