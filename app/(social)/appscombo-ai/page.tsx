"use client";

import MessageSection from "./MessageSection";
import SuggestionsSection from "./SuggestionSection";

export default function AppsComboAIPage() {
  return (
    <div className="flex flex-col md:flex-row justify-start mb-14">
      <div></div>
      <div></div>
      <MessageSection />
      <div className="hidden lg:block lg:w-[470px] lg:flex-shrink-0">
        <SuggestionsSection />
      </div>
    </div>
  );
}

