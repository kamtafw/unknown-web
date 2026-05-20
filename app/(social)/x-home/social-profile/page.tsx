"use client";

import FriendSuggestionsPage from "../FriendSuggestions";
import SocialProfile from "./[username]/SocialProfile";

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row justify-center lg:justify-start w-full px-2 sm:px-4 lg:px-0">
        <div className="w-full lg:flex-1 lg:max-w-4xl">
          <SocialProfile />
        </div>
        <div className="hidden lg:block lg:w-[506px] lg:flex-shrink-0">
          <div className="fixed top-16 right-0 w-[506px] h-[calc(100vh-4rem)] bg-white z-10">
            <FriendSuggestionsPage />
          </div>
        </div>
      </div>
    </div>
  );
}
