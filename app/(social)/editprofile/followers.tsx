"use client";

import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useGetFollowers } from "@/services/profile/useProfileService";
import { useFollowAUserAction } from "@/services/auth/useUserAuthService";

interface FollowersPageProps {
  onClose?: () => void;
}

export default function FollowersPage({}: FollowersPageProps) {
  const { data: followers, isLoading } = useGetFollowers();
  const followMutation = useFollowAUserAction();
  console.log("Followers data:", followers);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const followersList = Array.isArray(followers) ? followers : [];

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-2 flex items-center sm:px-4 sm:py-3">
            <h1 className="text-lg font-bold sm:text-xl">Followers</h1>
          </div>
        </div>
        <div className="">
          {followersList.length > 0 ? (
            followersList.map(
              (follower: {
                pkid: number;
                id: string;
                first_name: string;
                last_name: string;
                username: string;
                profile_photo: string;
                is_following?: boolean;
                is_friends?: boolean;
              }) => (
                <div
                  key={follower.id}
                  className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 sm:px-4 sm:py-3"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-2 sm:w-12 sm:h-12 sm:mr-3">
                      <Image
                        src={
                          follower.profile_photo?.startsWith("http")
                            ? follower.profile_photo
                            : `https://appscombo.s3.amazonaws.com${follower.profile_photo}`
                        }
                        alt={`${follower.first_name} ${follower.last_name}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center cursor-pointer">
                      <span className="font-bold text-sm sm:text-base">
                        {follower.first_name} {follower.last_name}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        @{follower.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {follower.is_friends ? (
                      <button className="bg-transparent text-[#6A88D1] px-4 py-1 rounded-full text-xs font-bold border border-blue-500 sm:px-8 sm:py-1.5 sm:text-sm">
                        Friends
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          followMutation.mutate({
                            followed_user: follower.pkid,
                          })
                        }
                        disabled={followMutation.isPending}
                        className="bg-[#6A88D1] hover:bg-[#425483] text-white px-3 py-1 rounded-full text-xs font-bold sm:px-4 sm:py-1.5 sm:text-sm disabled:opacity-50"
                      >
                        Follow back
                      </button>
                    )}
                    <button
                      className="p-1 rounded-full hover:bg-gray-100 sm:p-2"
                      aria-label="More options"
                      title="More options"
                    >
                      <MoreHorizontal size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No followers yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
