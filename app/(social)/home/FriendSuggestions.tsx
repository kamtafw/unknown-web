"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import "@/app/global.css";
import {
  useGetFriendSuggestions,
  useFollowUserFromSuggestions,
} from "@/services/social/useSocialService";

export default function FriendSuggestionsPage() {
  const { data: suggestions, isLoading, error } = useGetFriendSuggestions();
  const followMutation = useFollowUserFromSuggestions();

  console.log("=== FRIEND SUGGESTIONS DEBUG ===");
  console.log("1. Raw data from hook:", suggestions);
  console.log("2. Is Loading:", isLoading);
  console.log("3. Error:", error);

  if (isLoading) {
    return <div className="p-4 text-center">Loading suggestions...</div>;
  }

  const suggestionsList = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-5">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">
            Friend Suggestions
          </h1>
        </div>
      </div>

      <div className="max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
        {suggestionsList.length > 0 ? (
          suggestionsList.map(
            (person: {
              pkid: number;
              id: string;
              username: string;
              first_name: string;
              last_name: string;
              email: string;
              profile_photo?: string;
              youFollowThisUser: boolean;
              followsYou: boolean;
            }) => (
              <div
                key={person.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                    <Image
                      src={person.profile_photo || "/profilepic.jpg"}
                      alt={`${person.first_name} ${person.last_name}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1 cursor-pointer">
                    <span className="font-semibold text-gray-900 text-sm truncate">
                      {person.first_name} {person.last_name}
                    </span>
                    <span className="text-gray-500 text-xs truncate">
                      @{person.username}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  {person.youFollowThisUser && person.followsYou ? (
                    <button className="bg-transparent text-[#6A88D1] px-4 py-1 rounded-full text-xs font-bold border border-blue-500 sm:px-8 sm:py-1.5 sm:text-sm">
                      Friends
                    </button>
                  ) : person.youFollowThisUser ? (
                    <button className="bg-white text-[#6A88D1] border border-[#6A88D1] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50">
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        followMutation.mutate({ followed_user: person.pkid })
                      }
                      disabled={followMutation.isPending}
                      className="bg-[#6A88D1] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#425483] transition-colors duration-200 disabled:opacity-50"
                    >
                      {followMutation.isPending ? "Following..." : "Follow"}
                    </button>
                  )}
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-200"
                    aria-label="More options"
                    title="More options"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            )
          )
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            No friend suggestions available
          </div>
        )}
      </div>
    </div>
  );
}
