import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const WaitListInputComp = () => {
  return (
    <div className="flex w-full max-w-[552px] items-center space-x-2">
      <Input
        type="email"
        placeholder="Email Address"
        className="h-12 text-base placeholder:text-base placeholder:text-[#6B7280] font-medium rounded-[12px]"
      />
      <Button
        type="submit"
        className="w-full max-w-[189px] py-[14px] h-[52px] flex items-center justify-center cursor-pointer bg-[#6A88D1] text-[#FFFFFF] text-base font-semibold rounded-[12px]"
      >
        Join the waitlist
      </Button>
    </div>
  );
};

export default WaitListInputComp;
