"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";

interface AlertPageProps {
  onBack: () => void;
}

export default function AlertPage({ onBack }: AlertPageProps) {
  const [conversationTones, setConversationTones] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [highPriorityNotifications, setHighPriorityNotifications] =
    useState(false);
  const [reactionNotifications, setReactionNotifications] = useState(false);
  const [vibrationMode, setVibrationMode] = useState("Default");
  const [showVibratePopup, setShowVibratePopup] = useState(false);
  const [tempVibrationMode, setTempVibrationMode] = useState(vibrationMode);

  const vibrationOptions = ["Off", "Default", "Short", "Long"];

  const handleOpenVibratePopup = () => {
    setTempVibrationMode(vibrationMode);
    setShowVibratePopup(true);
  };

  const handleConfirmVibrate = () => {
    setVibrationMode(tempVibrationMode);
    setShowVibratePopup(false);
  };

  const handleCancelVibrate = () => {
    setShowVibratePopup(false);
  };

  return (
    <div className="flex  justify-center md:justify-start ml-3 md:ml-5 ">
      <div className="w-full md:w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Alert</h1>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-col">
          <div className="flex items-center justify-between py-3">
            <div>
              <h2 className="text-sm font-semibold text-[16px]">
                Conversation tones
              </h2>
              <p className="text-sm text-gray-500">
                Play sounds for incoming and outgoing messages
              </p>
            </div>
            <button
              onClick={() => setConversationTones(!conversationTones)}
              className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                conversationTones ? "end" : "start"
              } transition-colors ${
                conversationTones ? "bg-green-500" : "bg-gray-300"
              }`}
              title="Toggle conversation tones"
            >
              <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
            </button>
          </div>
          <div className="flex  items-center justify-between py-3 ">
            <div>
              <h2 className="text-sm font-semibold text-[16px]">Reminders</h2>
              <p className="text-sm text-gray-500">
                Get occasional reminders about <br /> messages or status updates you
                haven&#39;t seen
              </p>
            </div>
            <button
              onClick={() => setReminders(!reminders)}
              className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                reminders ? "end" : "start"
              } transition-colors ${
                reminders ? "bg-green-500" : "bg-gray-300"
              }`}
              title="Toggle reminders"
            >
              <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
            </button>
          </div>
          <hr className="my-5 border-gray-200" />
          <div className="py-3">
            <h2 className="text-lg ">Messages</h2>
            <div className="mt-3">
              <p className="text-sm font-semibold text-[16px]">
                Notification tone
              </p>
              <p className="text-sm text-gray-500">Default (system default)</p>
            </div>
            <div className="mt-3">
              <button
                onClick={handleOpenVibratePopup}
                className="text-left text-sm font-semibold text-[16px] cursor-pointer hover:opacity-50"
              >
                <span className="block">Vibrate</span>
                <span className="block text-sm text-gray-500">
                  {vibrationMode}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[16px]">
                  Use high priority notifications
                </p>
                <p className="text-sm text-gray-500">
                  Show previews of notification at the top <br /> of the screen
                </p>
              </div>
              <button
                onClick={() =>
                  setHighPriorityNotifications(!highPriorityNotifications)
                }
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  highPriorityNotifications ? "end" : "start"
                } transition-colors ${
                  highPriorityNotifications ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle high priority notifications"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[16px]">
                  Reaction notifications
                </p>
                <p className="text-sm text-gray-500">
                  Show notifications for reactions to <br /> messages you send
                </p>
              </div>
              <button
                onClick={() => setReactionNotifications(!reactionNotifications)}
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  reactionNotifications ? "end" : "start"
                } transition-colors ${
                  reactionNotifications ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle reaction notifications"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
          </div>
          <hr className="my-5 border-gray-200" />
          <div className="py-3">
            <h2 className="text-lg">Group</h2>
            <div className="mt-3">
              <p className="text-sm font-semibold text-[16px]">
                Notification tone
              </p>
              <p className="text-sm text-gray-500">Default (system default)</p>
            </div>
          </div>

          {/* Vibrate Pop-up */}
          {showVibratePopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
                <h3 className="text-lg font-semibold">Vibrate</h3>
                <RadioGroup
                  value={tempVibrationMode}
                  onValueChange={setTempVibrationMode}
                  className="mt-3 space-y-2"
                >
                  {vibrationOptions.map((option, index) => (
                    <div key={option} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option}
                        id={`vibrate-${index}`}
                        className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-white data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
                      />
                      <Label htmlFor={`vibrate-${index}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={handleCancelVibrate}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmVibrate}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
