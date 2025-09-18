"use client";

import React, { useState } from "react";
import { IoChatbubbles } from "react-icons/io5";
import { IoCallSharp } from "react-icons/io5";
import { GiWorld } from "react-icons/gi";
import { IoChevronDownOutline, IoChevronForwardOutline } from "react-icons/io5";

export default function PersonalDetailsForm({
  onNext,
  onPrev,
}: {
  onNext?: (data: {
    fullName: string;
    phoneNumber: string;
    country: string;
    storeAddress: string;
  }) => void;
  onPrev?: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const countries = [
    "Nigeria",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "South Africa",
    "Brazil",
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const formData = {
      fullName,
      phoneNumber,
      country,
      storeAddress,
    };
    console.log("Form Data:", formData);

    if (onNext) {
      onNext(formData);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrev) {
      onPrev();
    }
  };

  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setShowCountryDropdown(false);
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

          {/* Full Name Field */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-900">
              Please provide your full name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <IoChatbubbles className="w-5 h-5 text-black" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Placeholder"
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-900">
              We also need your phone number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <IoCallSharp className="w-5 h-5 text-black" />
              </div>
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                <span className="text-gray-600 text-base">+234</span>
                <IoChevronDownOutline className="w-4 h-4 text-black" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Placeholder"
                className="w-full pl-28 pr-4 py-4 text-base border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Country Field */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-900">
              What country do you run your business
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <GiWorld className="w-5 h-5 text-black" />
              </div>
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full pl-12 pr-12 py-4 text-base border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white text-left"
              >
                <span className={country ? "text-gray-900" : "text-gray-400"}>
                  {country || "Placeholder"}
                </span>
              </button>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <IoChevronForwardOutline className="w-5 h-5 text-gray-400" />
              </div>

              {/* Dropdown */}
              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {countries.map((countryOption) => (
                    <button
                      key={countryOption}
                      type="button"
                      onClick={() => handleCountrySelect(countryOption)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors text-base border-b border-gray-100 last:border-b-0"
                    >
                      {countryOption}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Store Address Field */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-900">
              Store address
            </label>
            <textarea
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="Placeholder"
              rows={4}
              className="w-full px-4 py-4 text-base border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white placeholder-gray-400 resize-none"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 bg-white text-blue-400 border-2 border-blue-400 py-3 px-4 rounded-full font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-blue-400 text-white py-3 px-4 rounded-full font-medium hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
