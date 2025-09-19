"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function FAQPage({ onBack, onNavigate }: FAQPageProps) {
  const faqs = [
    {
      question: "Lorem Ipsum?",
      answers: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        "exercitation ullamco laboris nisi ut aliquip ex ea.",
      ],
    },
    {
      question: "Lorem Ipsum?",
      answers: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        "exercitation ullamco laboris nisi ut aliquip ex ea.",
      ],
    },
    {
      question: "Lorem Ipsum?",
      answers: [
       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        "exercitation ullamco laboris nisi ut aliquip ex ea.",
      ],
    },
  ];

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
            <h1 className="text-xl font-bold">FAQ</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col space-y-6">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-[16px]">
                {faq.question}
              </h3>
              <ul className="mt-2 md:mt-5 list-disc pl-5 text-sm text-gray-500 space-y-3">
                {faq.answers.map((answer, idx) => (
                  <li key={idx}>{answer}</li>
                ))}
              </ul>
            </div>
          ))}
          <Button
            onClick={() => onNavigate("support")}
            className=" mt-35 md:mt-45 w-full max-w-[500px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}