"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AskQuestionPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function AskQuestionPage({ onBack, onNavigate }: AskQuestionPageProps) {
  const [question, setQuestion] = useState("");

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setQuestion(text);
    }
  };

  const handleSubmit = () => {
    console.log("Question submitted:", question);
    onNavigate("support");
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Support"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Ask a question</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          <h2 className="text-lg font-semibold text-[16px]">
            What do you want to know?
          </h2>
          <div className="mt-4 relative">
            <textarea
              placeholder="Placeholder"
              value={question}
              onChange={handleQuestionChange}
              className="w-full max-w-[500px] h-[48px] resize-none border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute bottom-2 right-2 text-sm text-gray-500">
              {question.length}/200
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            className="mt-135 w-full max-w-[500px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}