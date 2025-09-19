"use client";

import React, { useState } from "react";
import { IoChatbubbles } from "react-icons/io5";

export default function AccountSetupForm({
  onSubmit,
}: {
  onSubmit?: (data: {
    businessName: string;
    businessDescription: string;
    selectedCategories: string[];
  }) => void;
}) {
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const formData = {
      businessName,
      businessDescription,
      selectedCategories,
    };
    console.log("Business Name:", businessName);
    console.log("Business Description:", businessDescription);
    console.log("Selected Categories:", selectedCategories);
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Account Set up
            </h1>
          </div>

          {/* Business Name Field */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-900">
              What do you want to name your business?
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <IoChatbubbles className="w-5 h-5 text-black" />
              </div>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Placeholder"
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Business Description Field */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-900">
              How do you want to describe your business
            </label>
            <div className="relative">
              <div className="absolute left-4 top-4">
                <IoChatbubbles className="w-5 h-5 text-black" />
              </div>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Describe your business"
                rows={6}
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Business Categories Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-gray-900">
              What kind of business do you want to sell?
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                "Foods and drinks",
                "Kitchen",
                "Sports",
                "Automobiles",
                "Electronics",
                "Fashion and bags",
                "Gaming",
                "Furniture and woodworks",
                "Mobile phone and laptops",
              ].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-6 py-3 rounded-full border-2 transition-colors text-sm font-medium ${
                    selectedCategories.includes(category)
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-400 text-white py-3 px-4 rounded-full font-medium hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
