"use client";

import { useState } from "react";
import { X, ChevronRight, Smile, ArrowLeft, Search } from "lucide-react";

const mockCoHosts = [
  {
    id: 1,
    name: "Cameron Williamson",
    phone: "+234 8123456789",
    avatar: "/Rectangle 2.png",
    selected: false,
  },
  {
    id: 2,
    name: "Jane Cooper",
    phone: "+234 8181855789",
    avatar: "/Rectangle5.png",
    selected: true,
  },
  {
    id: 3,
    name: "Brooklyn Simmons",
    phone: "+234 8181855789",
    avatar: "/Rectangle 1.png",
    selected: true,
  },
  {
    id: 4,
    name: "Kristin Watson",
    phone: "+234 8123456789",
    avatar: "/Rectangle 2.png",
    selected: false,
  },
  {
    id: 5,
    name: "Albert Flores",
    phone: "+234 8181855789",
    avatar: "/Rectangle 4.png",
    selected: true,
  },
  {
    id: 6,
    name: "Jacob Jones",
    phone: "+234 8123456789",
    avatar: "/Rectangle 3.png",
    selected: false,
  },
  {
    id: 7,
    name: "Jenny Wilson",
    phone: "+234 8181855789",
    avatar: "/Rectangle 1.png",
    selected: true,
  },
  {
    id: 8,
    name: "Ralph Edwards",
    phone: "+234 8123456789",
    avatar: "/Rectangle5.png",
    selected: false,
  },
];

interface CreateLivePopupProps {
  onClose: () => void;
  onGoLive: (data: {
    title: string;
    description: string;
    tags: string[];
    visibility: string;
    coHosts?: any[];
    isScheduled: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
  }) => void;
}

interface CoHost {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  selected: boolean;
}

// Co-host Selection Popup Component
function CoHostSelectionPopup({
  onBack,
  onSelect,
  selectedCoHosts,
}: {
  onBack: () => void;
  onSelect: (coHosts: CoHost[]) => void;
  selectedCoHosts: CoHost[];
}) {
  const [coHosts, setCoHosts] = useState<CoHost[]>(
    mockCoHosts.map((host) => ({
      ...host,
      selected: selectedCoHosts.some((selected) => selected.id === host.id),
    }))
  );

  const toggleCoHost = (id: number) => {
    setCoHosts((prev) =>
      prev.map((host) =>
        host.id === id ? { ...host, selected: !host.selected } : host
      )
    );
  };

  const handleSelect = () => {
    const selected = coHosts.filter((host) => host.selected);
    onSelect(selected);
  };

  return (
    <div className="bg-white rounded-lg w-[450px] max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold">Add Co host</h2>
          <div className="ml-auto">
            <Search size={24} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Co-host List */}
      <div className="p-4">
        <div className="space-y-3 mb-6">
          {coHosts.map((host) => (
            <div key={host.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                  <img
                    src={host.avatar}
                    alt={host.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{host.name}</p>
                  <p className="text-sm text-gray-500">{host.phone}</p>
                </div>
              </div>
              <button
                onClick={() => toggleCoHost(host.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  host.selected
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {host.selected && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <button
          onClick={handleSelect}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full font-medium transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
}

export function CreateLivePopup({ onClose, onGoLive }: CreateLivePopupProps) {
  const [visibility, setVisibility] = useState("Everyone");
  const [description, setDescription] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor #Mindset #Future #Money #Invest"
  );
  const [tags] = useState(["#Mindset", "#Future", "#Money", "#Invest"]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("DD - MM - YYYY");
  const [scheduledTime, setScheduledTime] = useState("8:00");
  const [showVisibilityPopover, setShowVisibilityPopover] = useState(false);
  const [showEmojiPopover, setShowEmojiPopover] = useState(false);
  const [showCoHostSelection, setShowCoHostSelection] = useState(false);
  const [selectedCoHosts, setSelectedCoHosts] = useState<CoHost[]>([
    {
      id: 1,
      name: "Cameron Williamson",
      phone: "+234 8123456789",
      avatar: "/Rectangle 2.png",
      selected: true,
    },
  ]);

  const visibilityOptions = ["Everyone", "Others", "Nobody"];
  const emojis = ["😀", "😂", "😍", "🤔", "😎", "🎉", "💡", "🔥"];

  const handleGoLive = () => {
    onGoLive({
      title: "Live Session",
      description,
      tags,
      visibility,
      coHosts: selectedCoHosts,
      isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledTime: isScheduled ? scheduledTime : undefined,
    });
  };

  const addEmoji = (emoji: string) => {
    setDescription((prev) => prev + " " + emoji);
    setShowEmojiPopover(false);
  };

  const removeCoHost = (id: number) => {
    setSelectedCoHosts((prev) => prev.filter((host) => host.id !== id));
  };

  const handleCoHostSelect = (coHosts: CoHost[]) => {
    setSelectedCoHosts(coHosts);
    setShowCoHostSelection(false);
  };


  if (showCoHostSelection) {
    return (
      <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
        <CoHostSelectionPopup
          onBack={() => setShowCoHostSelection(false)}
          onSelect={handleCoHostSelect}
          selectedCoHosts={selectedCoHosts}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[450px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close popup"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Go live!</h2>
              <img
                src="/live.png"
                alt="Live"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Visibility Section */}
          <div>
            <p className="text-gray-700 mb-3">Who can see my live!</p>
            <div className="relative">
              <button
                onClick={() => setShowVisibilityPopover(!showVisibilityPopover)}
                className="w-full border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              >
                <span>{visibility}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
              {showVisibilityPopover && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white border rounded-lg shadow-lg z-10">
                  <div className="space-y-2 p-2">
                    {visibilityOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => {
                          setVisibility(option);
                          setShowVisibilityPopover(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <p className="text-blue-700 mb-1">What do you want to talk about</p>
            <div className="border rounded-lg p-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none border-none outline-none mb-2"
                rows={2}
                placeholder="What do you want to talk about"
                aria-label="Live session description"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEmojiPopover(!showEmojiPopover)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Add emoji"
                >
                  <Smile size={20} />
                </button>
                <span className="text-gray-400 text-sm">
                  {description.length}/100
                </span>
              </div>
              {showEmojiPopover && (
                <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-4 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:bg-gray-100 p-2 rounded"
                        aria-label={`Add ${emoji} emoji`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Co-host Section */}
          <div>
            <p className="text-gray-700 mb-3">Add Co host</p>
            <div className="flex items-center gap-4 flex-wrap">
              {selectedCoHosts.map((host) => (
                <div key={host.id} className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    <img
                      src={host.avatar}
                      alt={host.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCoHost(host.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                    aria-label={`Remove ${host.name}`}
                  >
                    <X className="text-white" size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowCoHostSelection(true)}
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl"
                aria-label="Add co-host"
              >
                +
              </button>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Schedule Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700">Schedule your live</p>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isScheduled ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label={`${isScheduled ? "Disable" : "Enable"} scheduling`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isScheduled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isScheduled && (
              <div className="flex gap-4 justify-between">
                <div className="relative">
                  <input
                    type="date"
                    value={
                      scheduledDate === "DD - MM - YYYY" ? "" : scheduledDate
                    }
                    onChange={(e) =>
                      setScheduledDate(e.target.value || "DD - MM - YYYY")
                    }
                    className="w-full border rounded-full px-4 py-2 bg-gray-100"
                    aria-label="Select date"
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduledTime === "8:00" ? "" : scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value || "8:00")}
                    className="w-full border rounded-full px-4 py-2 bg-gray-100"
                    aria-label="Select time"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            type="button"
            onClick={handleGoLive}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full font-medium transition-colors"
          >
            Go live
          </button>
        </div>
      </div>
    </div>
  );
}
