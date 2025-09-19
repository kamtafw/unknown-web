"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FaUser, FaPhone } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface EditContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  onSubmit: (firstName: string, lastName: string, phoneNumber: string) => void;
}

export function EditContactPopup({
  isOpen,
  onClose,
  contactName,
  onSubmit,
}: EditContactPopupProps) {
  const [firstName, setFirstName] = useState(contactName.split(" ")[0] || "");
  const [lastName, setLastName] = useState(contactName.split(" ")[1] || "");
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(firstName, lastName, phoneNumber);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Edit</h2>
            <div className="w-9 h-9" /> 
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="First name"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  1/20
                </span>
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Last name"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  1/20
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Placeholder"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-4 pt-8">
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}