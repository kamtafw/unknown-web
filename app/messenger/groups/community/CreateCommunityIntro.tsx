"use client";


import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CreateCommunityIntroProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export function CreateCommunityIntro({
  isOpen,
  onClose,
  onGetStarted,
}: CreateCommunityIntroProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-full max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <button onClick={onClose} className="p-1" aria-label="Close">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">Create community</h2>
        </div>

        {/* Content */}
        <div className=" flex flex-col items-center justify-center p-6 text-center">

          <div className="mb-5">
            <div className="relative">
              <div className="flex justify-center -mt-2">
                <Image 
                  src="/Community.png"
                  alt="Community members"
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Create community</h3>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-xs">
            Bring together a neighborhood, school or more. 
            Create topic-based group for members, and easily 
            send them admin announcements
          </p>
        </div>

        {/* Get Started Button */}
        <div className="p-6">
          <Button 
            onClick={onGetStarted}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full"
          >
            Get started
          </Button>
        </div>
      </div>
    </div>
  );
}