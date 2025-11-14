"use client";

import Image from "next/image";
import { useGetFollowing } from "@/services/profile/useProfileService";
import { useUnfollowAUserAction } from "@/services/auth/useUserAuthService";

export default function FollowingPage() {
  const { data: following, isLoading } = useGetFollowing();
  const unfollowMutation = useUnfollowAUserAction();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const followingList = Array.isArray(following) ? following : [];

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-2 flex items-center sm:px-4 sm:py-3">
            <h1 className="text-lg font-bold sm:text-xl">Following</h1>
          </div>
        </div>
        <div className="">
          {followingList.length > 0 ? (
            followingList.map(
              (person: {
                pkid: number;
                id: string;
                first_name: string;
                last_name: string;
                username: string;
                profile_photo: string;
                is_following?: boolean;
              }) => (
                <div
                  key={person.id}
                  className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 sm:px-4 sm:py-3"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-2 sm:w-12 sm:h-12 sm:mr-3">
                      <Image
                        src={
                          person.profile_photo?.startsWith("http")
                            ? person.profile_photo
                            : `https://appscombo.s3.amazonaws.com${person.profile_photo}`
                        }
                        alt={`${person.first_name} ${person.last_name}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center cursor-pointer">
                      <span className="font-bold text-sm sm:text-base">
                        {person.first_name} {person.last_name}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        @{person.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() =>
                        unfollowMutation.mutate({ followed_user: person.pkid })
                      }
                      disabled={unfollowMutation.isPending}
                      className="text-[#6A88D1] hover:bg-[#425483] px-3 py-1 rounded-full text-xs font-bold border border-blue-500 sm:px-4 sm:py-1.5 sm:text-sm disabled:opacity-50"
                    >
                      {unfollowMutation.isPending
                        ? "Unfollowing..."
                        : "Unfollow"}
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              Not following anyone yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
