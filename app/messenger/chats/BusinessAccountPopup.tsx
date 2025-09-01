"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface BusinessAccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function BusinessAccountPopup({
  isOpen,
  onClose,
  onBack,
}: BusinessAccountPopupProps) {
  if (!isOpen) return null;

  const handleLearnMore = () => {
    console.log("Learn more clicked");
  };

  const handleGetAppsComboBusiness = () => {
    console.log("Get AppsCombo business clicked");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-xl">
          {/* Header */}
          <div className="flex items-center p-4 border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">Business</h1>
          </div>

          {/* Content */}
          <div className="px-4 py-6">
            {/* Store Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src="/ChatFrame.svg"
                  alt="image"
                  width={100}
                  height={100}
                  className=" object-contain"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-center mb-2">
              About AppsCombo Business
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm text-center leading-relaxed mb-2">
              The business uses AppsCombo, which allows them to add their
              opening hours, address, website and catalogue of products or
              services.{" "}
              <button
                onClick={handleLearnMore}
                className="text-blue-500 hover:underline font-medium"
              >
                Learn more
              </button>
            </p>

            {/* Business Section */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-base mb-3">
                If you are a business
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Switching to the free AppsCombo Business app can help. It has
                tools to connect with customers and manage messages
              </p>

              {/* CTA Button */}
              <Button
                onClick={handleGetAppsComboBusiness}
                className="w-full mb-2 bg-white hover:bg-blue-600 border border-blue-700 text-blue-500 py-3 rounded-full font-medium"
              >
                Get AppsCombo business
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
