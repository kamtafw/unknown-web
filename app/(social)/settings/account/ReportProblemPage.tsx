"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";

interface ReportProblemPageProps {
  onBack: () => void;
}

export default function ReportProblemPage({ onBack }: ReportProblemPageProps) {
  const [selectedProblem, setSelectedProblem] = useState("");
  const [feedback, setFeedback] = useState("");

  const problems = [
    "Lorem ipsum dolor sit amet",
    "Consectetur adipiscing elit",
    "Sed do eiusmod tempor",
    "Incididunt ut labore",
    "Others",
  ];

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setFeedback(text);
    }
  };

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Account"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Report Problem</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3">
          <h2 className="text-lg font-semibold">Please select a problem</h2>
          <RadioGroup
            value={selectedProblem}
            onValueChange={setSelectedProblem}
            className="mt-6 space-y-5"
          >
            {problems.map((problem, index) => (
              <div key={index} className="flex items-center gap-3">
                <RadioGroupItem
                  value={problem}
                  id={`problem-${index}`}
                  className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
                />
                <Label htmlFor={`problem-${index}`} className="text-sm">
                  {problem}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <p className="mt-8 text-sm text-black font-bold">
            Your feedback is very much appreciated
          </p>
          <div className="mt-4 relative">
            <textarea
              placeholder="Placeholder"
              value={feedback}
              onChange={handleFeedbackChange}
              className="w-full resize-none border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute bottom-2 right-2 text-sm text-gray-500">
              {feedback.length}/200
            </span>
          </div>
          <Button className="w-full h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483] mt-4">
            Submit
          </Button>
        </div>
      </div>
    </div>
    );
  }