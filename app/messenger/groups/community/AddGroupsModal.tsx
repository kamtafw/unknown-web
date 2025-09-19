import React, { useState, useRef } from "react";
import { X, Users, Search } from "lucide-react";
import Image from "next/image";

interface Group {
  id: string;
  name: string;
  status?: string;
  icon?: React.ReactNode;
  time: string;
  message: string;
  badge?: number;
  online?: boolean;
  pinned?: boolean;
  statusIcon?: string;
  avatar?: string;
  hasGroupIcon?: boolean;
  isMuted?: boolean;
  hasHashIcon?: boolean;
}

interface AddGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableGroups: Group[];
  onCreateGroup: (selectedGroups: Group[]) => void;
}

export function AddGroupsModal({
  isOpen,
  onClose,
  availableGroups,
  onCreateGroup,
}: AddGroupsModalProps) {
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredGroups = availableGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupToggle = (group: Group) => {
    setSelectedGroups((prev) => {
      const isSelected = prev.some((g) => g.id === group.id);
      if (isSelected) {
        return prev.filter((g) => g.id !== group.id);
      } else {
        return [...prev, group];
      }
    });
  };

  const handleCreateGroup = () => {
    onCreateGroup(selectedGroups);
    setSelectedGroups([]);
    setSearchQuery("");
    setShowSearch(false);
    onClose();
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const isGroupSelected = (groupId: string) => {
    return selectedGroups.some((g) => g.id === groupId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold ml-3">
                Add existing groups
              </h2>
            </div>
            <button
              onClick={handleSearchClick}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Show search"
            >
              <Search className="h-4 w-4 text-black" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {selectedGroups.length} of {filteredGroups.length} selected
          </p>

          {/* Selected Groups Preview */}
          {selectedGroups.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {selectedGroups.slice(0, 4).map((group) => (
                <div key={group.id} className="relative">
                  <div className="flex flex-col items-center">
                    {group.hasGroupIcon ? (
                      <div className="h-12 w-12 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100 relative">
                        <Users className="h-6 w-6 text-gray-600" />
                        <button
                          onClick={() => handleGroupToggle(group)}
                          className="absolute -top-1 -right-1 h-5 w-5 bg-gray-500 rounded-full flex items-center justify-center"
                          aria-label={`Remove ${group.name} from selection`}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Image
                          src={group.avatar || "/default-avatar.jpg"}
                          alt={group.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <button
                          onClick={() => handleGroupToggle(group)}
                          className="absolute -top-1 -right-1 h-5 w-5 bg-gray-500 rounded-full flex items-center justify-center"
                          aria-label={`Remove ${group.name} from selection`}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                    <span className="text-xs mt-1 text-center max-w-16 truncate">
                      {group.name}
                    </span>
                  </div>
                </div>
              ))}
              {selectedGroups.length > 4 && (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                    <span className="text-sm text-gray-600">
                      +{selectedGroups.length - 4}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar - Only show when search is activated */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setShowSearch(false);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Groups you are admin of
          </h3>
          <div className="space-y-2">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isGroupSelected(group.id)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleGroupToggle(group)}
              >
                <div className="relative">
                  {group.hasGroupIcon ? (
                    <div className="h-10 w-10 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                  ) : (
                    <Image
                      src={group.avatar || "/default-avatar.jpg"}
                      alt={group.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <p className="font-medium text-sm">{group.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{group.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isGroupSelected(group.id) && (
                    <div className="h-5 w-5 bg-blue-500 rounded-sm flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleCreateGroup}
            disabled={selectedGroups.length === 0}
            className={`w-full py-3 rounded-full text-white font-medium transition-colors ${
              selectedGroups.length > 0
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
