/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import CustomLoader from "@/components/shared/Loader/CustomLoader";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// import { Toaster } from "@/components/ui/sonner";
import {
  useFollowAUserAction,
  useUnfollowAUserAction,
} from "@/services/auth/useUserAuthService";

interface CompProps {
  userData: any;
}

const SuggestionsCardModule = ({ userData }: CompProps) => {
  const [isFollowing, setIsFollowing] = React.useState(false);

  const { mutate: followUser, isPending: isFollowPending } =
    useFollowAUserAction();
  const { mutate: unfollowUser, isPending: isUnfollowPending } =
    useUnfollowAUserAction();

  const handleFollowAction = () => {
    const payload = {
      followed_user: userData?.pkid,
    };

    if (isFollowing) {
      unfollowUser(payload, {
        onSuccess: () => setIsFollowing(false),
      });
    } else {
      followUser(payload, {
        onSuccess: () => setIsFollowing(true),
      });
    }
  };


  const isPending = isFollowPending || isUnfollowPending;

  return (
    <>
      <div className="w-full flex items-start justify-between gap-3">
        <div className="w-[40px] h-[40px] rounded-full">
          <Image
            src={userData?.profile_photo}
            alt="friend"
            className="w-auto h-auto object-contain"
            width={100}
            height={100}
          />
        </div>
        <div className="w-full flex flex-col gap-1 items-start">
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col items-start justify-start gap-1">
              <h3 className="text-base font-semibold text-[#313131]">
                {userData?.first_name}
              </h3>
              <h4 className="text-sm text-[#4B5463] font-normal">
                @_{userData?.username}
              </h4>
            </div>

            {!isFollowing ? (
              <Button
                type="button"
                onClick={handleFollowAction}
                disabled={isPending}
                className="bg-[#6A88D1] py-1.5 px-3 rounded-3xl w-[89px] cursor-pointer hover:bg-[#425483]"
              >
                {isPending ? <CustomLoader /> : "Follow"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFollowAction}
                disabled={isPending}
                className="bg-[#FFFFFF] py-1.5 px-3 rounded-3xl w-[89px] cursor-pointer hover:bg-[#425483] text-[#6A88D1] border border-[#6A88D1]"
              >
                {isPending ? <CustomLoader /> : "Unfollow"}
              </Button>
            )}
          </div>
          <p className="sm:max-w-[426px] text-sm text-[#374151] font-normal">
            {userData?.profile?.about_me}
          </p>
        </div>
      </div>
      {/* <Toaster position="top-right" /> */}
    </>
  );
};

export default SuggestionsCardModule;
