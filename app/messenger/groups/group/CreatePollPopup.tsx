"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { SiWechat } from "react-icons/si";
import { HiOutlineBars3CenterLeft } from "react-icons/hi2";
import Image from "next/image";

interface CreatePollPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePollPopup({ isOpen, onClose }: CreatePollPopupProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [anonymousVotes, setAnonymousVotes] = useState(false);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = () => {
    console.log("Creating poll:", { question, options, anonymousVotes });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-50 bg-white rounded-lg shadow-lg w-[95vw] max-w-[380px] lg:max-w-md mx-4 max-h-[100vh] flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Poll</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open poll creation"
            >
              <IoIosArrowForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Add Images */}
          <div>
            <p className="text-lg font-medium mb-2">Add image</p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/image.png"
                  alt="Uploaded image"
                  width={48}
                  height={48}
                  className="w-18 h-18 rounded object-cover"
                />
                <button
                  className="absolute inset-0 w-full h-full bg-opacity-50 rounded flex items-center justify-center hover:bg-opacity-70 transition-colors"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>

              <button
                className="w-18 h-18  border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Add another image"
              >
                <Plus className="h-7 w-7 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Ask Question */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ask Question:
            </label>
            <div className="flex items-center gap-2 p-2 border rounded-lg">
              <SiWechat className="h-7 w-7" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Placeholder"
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-2">Options:</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <HiOutlineBars3CenterLeft className="w-5 h-5 text-black font-bold" />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder="Write something"
                      className="flex-1 outline-none"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-1 hover:bg-red-50 text-gray-500 rounded transition-colors"
                        aria-label="Remove option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addOption}
                className="w-50 p-2  border border-blue-500 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5 rounded-full bg-blue-300 text-white" />
                <p className="text-gray-400">Add another option</p>
              </button>
            </div>
          </div>
          {/* Poll Settings */}
          <div>
            <h3 className="font-medium mb-3">Poll Settings</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Anonymous votes</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymousVotes}
                  onChange={(e) => setAnonymousVotes(e.target.checked)}
                  className="sr-only"
                  aria-label="Enable anonymous votes"
                  title="Toggle anonymous votes"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    anonymousVotes ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      anonymousVotes ? "translate-x-5" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Create Poll Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleCreatePoll}
            disabled={!question.trim() || options.some((opt) => !opt.trim())}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}
