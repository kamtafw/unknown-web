/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { Dispatch, SetStateAction } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
// import Friend from '@/assets/friend.png';
import SuggestionsCardModule from "./SuggestionsCardModule";
import { useGetListOfUsersToFollow } from "@/services/auth/useUserAuthService";
import Link from "next/link";

interface CompProps {
  displaySuggestions: boolean;
  setDisplaySuggestions: Dispatch<SetStateAction<boolean>>;
}

const FriendsSuggestionModal = ({
  setDisplaySuggestions,
  displaySuggestions,
}: CompProps) => {
  const { data: suggestion, isLoading, error } = useGetListOfUsersToFollow();

  
  return (
    <>
      <Dialog open={displaySuggestions} onOpenChange={setDisplaySuggestions}>
        <DialogContent className="sm:max-w-[640px] sm:w-[640px] h-auto sm:max-h-[636px]">
          <DialogHeader>
            <DialogTitle className="flex items-start justify-start gap-0">
              Friends suggestion
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[436px]">
            <div className="flex flex-col gap-6 items-center">
              {isLoading && <p>Loading suggestions...</p>}

              {error && (
                <p className="text-red-500">Failed to load suggestions</p>
              )}

              {!isLoading && suggestion?.data?.count === 0 && (
                <p className="text-gray-500">No suggestions available</p>
              )}

              {!isLoading &&
                suggestion?.data?.count > 0 &&
                suggestion?.data?.results?.map((result: any) => (
                  <SuggestionsCardModule userData={result} key={result?.id} />
                ))}
            </div>
          </ScrollArea>
          <DialogFooter className="sm:flex sm:justify-center sm:items-center h-[96px] w-full">
            <Link
              href="/home"
              type="button"
              className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[384px]"
            >
              Continue
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FriendsSuggestionModal;
