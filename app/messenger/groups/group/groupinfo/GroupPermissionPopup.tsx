"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { GroupSeverityPopup } from "./GroupSeverityPopup";

interface GroupPermissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
}

export function GroupPermissionPopup({
  isOpen,
  onClose,
}: //   groupName = "Group",
GroupPermissionPopupProps) {
  const [showSeverityPopup, setShowSeverityPopup] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState("Moderate");
  const [objective, setObjective] = useState("");

  const [editGroupSettings, setEditGroupSettings] = useState(true);
  const [sendMessages, setSendMessages] = useState(true);
  const [addOtherMember, setAddOtherMember] = useState(true);
  const [approveNewMembers, setApproveNewMembers] = useState(true);
  const [setRules, setSetRules] = useState(true);
  const [keywordInput, setKeywordInput] = useState("");

  const [keywords, setKeywords] = useState([
    "Jah my group",
    "Jes my group",
    "Urgent 3k",
    "Urgent 3k",
  ]);

  if (!isOpen) return null;

  const handleSeveritySelect = (severity: string) => {
    setSelectedSeverity(severity);
    setShowSeverityPopup(false);
  };

const handleAddKeyword = () => {
  if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
    setKeywords([...keywords, keywordInput.trim()]);
    setKeywordInput("");
  }
};

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-[350px] max-h-[90vh] overflow-y-auto mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Group permission
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Members can section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Members can
              </h3>
              <div className="space-y-3">
                {/* Edit group settings */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Edit group settings
                    </p>
                    <p className="text-xs text-gray-500">
                      this includes the name, icon, description, and the ability
                      to pin messages
                    </p>
                  </div>
                  <div className="ml-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editGroupSettings}
                        onChange={(e) => setEditGroupSettings(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Edit group settings"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                {/* Send messages */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Send messages
                    </p>
                  </div>
                  <div className="ml-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendMessages}
                        onChange={(e) => setSendMessages(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Send messages"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                {/* Add other member */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Add other member
                    </p>
                  </div>
                  <div className="ml-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addOtherMember}
                        onChange={(e) => setAddOtherMember(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Add other member"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Admins can section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Admins can
              </h3>
              <div className="space-y-3">
                {/* Approve new members */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Approve new members
                    </p>
                    <p className="text-xs text-gray-500">
                      When turned on, admin must approve anyone who wants to
                      join the group
                    </p>
                  </div>
                  <div className="ml-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={approveNewMembers}
                        onChange={(e) => setApproveNewMembers(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Approve new members"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                {/* Set rules */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Set rules
                    </p>
                    <p className="text-xs text-gray-500">
                      Setting rules means that members about should your terms
                      and agreement
                    </p>
                  </div>
                  <div className="ml-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setRules}
                        onChange={(e) => setSetRules(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Set rules"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords section */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Keyword
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <textarea
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter keyword"
                    className="w-64 p-3 border border-gray-300 rounded-lg resize-none h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    maxLength={100}
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="px-7 py-4 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeKeyword(index)}
                    />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Objective section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Objective
              </h3>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Write something nice about us"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500 -mt-6 mr-2">
                {objective.length}/1000
              </div>
            </div>

            {/* Group severity section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Group severity
              </h3>
              <button
                onClick={() => setShowSeverityPopup(true)}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-900">
                  {selectedSeverity}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Severity Popup */}
      <GroupSeverityPopup
        isOpen={showSeverityPopup}
        onClose={() => setShowSeverityPopup(false)}
        selectedSeverity={selectedSeverity}
        onSelect={handleSeveritySelect}
      />
    </>
  );
}
