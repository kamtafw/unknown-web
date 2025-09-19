"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { VibratePopup } from "./VibratePopup";
import { MuteDurationPopup } from "./MuteDurationPopup";

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: NotificationSettings) => void;
}

interface NotificationSettings {
  messageMute: boolean;
  notificationTone: string;
  vibrate: string;
  voiceChatMute: boolean;
}

export function NotificationPopup({
  isOpen,
  onClose,
}: NotificationPopupProps) {
  const [messageMute, setMessageMute] = useState(false);
  const [voiceChatMute, setVoiceChatMute] = useState(false);
  const [notificationTone] = useState("Default (wasterdrop_preview)");
  const [vibrateSetting, setVibrateSetting] = useState("Default");
  const [showVibratePopup, setShowVibratePopup] = useState(false);
  const [showMuteDurationPopup, setShowMuteDurationPopup] = useState(false);
  const [pendingMuteType, setPendingMuteType] = useState<'message' | 'voiceChat' | null>(null);

  const handleVibrateChange = (newVibrateSetting: string) => {
    const displayValue = newVibrateSetting.charAt(0).toUpperCase() + newVibrateSetting.slice(1);
    setVibrateSetting(displayValue);
    setShowVibratePopup(false);
  };

  const toggleSwitch = (type: 'message' | 'voiceChat') => {
    // If trying to mute (toggle to true), show duration popup first
    if ((type === 'message' && !messageMute) || (type === 'voiceChat' && !voiceChatMute)) {
      setPendingMuteType(type);
      setShowMuteDurationPopup(true);
    } else {
      // If unmuting, toggle immediately
      if (type === 'message') {
        setMessageMute(false);
      } else {
        setVoiceChatMute(false);
      }
    }
  };

  const handleMuteDurationConfirm = (duration: string) => {
    if (pendingMuteType === 'message') {
      setMessageMute(true);
    } else if (pendingMuteType === 'voiceChat') {
      setVoiceChatMute(true);
    }
    
    // You can store the duration or handle it as needed
    console.log(`Muted ${pendingMuteType} for ${duration}`);
    
    setPendingMuteType(null);
    setShowMuteDurationPopup(false);
  };

  const handleMuteDurationClose = () => {
    setPendingMuteType(null);
    setShowMuteDurationPopup(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-[380px] max-h-[80vh] mx-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">Notification</h2>
            <button
              onClick={onClose}
              aria-label="Close notification settings"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-black" />
            </button>
          </div>

          <div className="p-4">
            {/* Message Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Message</h3>
              
              {/* Mute notifications toggle */}
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-800 font-medium">Mute notifications</span>
                <button
                  onClick={() => toggleSwitch('message')}
                  aria-label={messageMute ? "Unmute message notifications" : "Mute message notifications"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    messageMute ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      messageMute ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Notification tone */}
              <div className="py-3">
                <div className="text-gray-800 font-medium mb-1">Notification tone</div>
                <div className="text-sm text-gray-500">{notificationTone}</div>
              </div>

              {/* Vibrate */}
              <button
                onClick={() => setShowVibratePopup(true)}
                className="w-full py-3 text-left"
              >
                <div className="text-gray-800 font-medium mb-1">Vibrate</div>
                <div className="text-sm text-gray-500">{vibrateSetting}</div>
              </button>
            </div>

            {/* Voice chat Section */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Voice chat</h3>
              
              {/* Mute notifications toggle */}
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-800 font-medium">Mute notifications</span>
                <button
                  onClick={() => toggleSwitch('voiceChat')}
                  aria-label={voiceChatMute ? "Unmute voice chat notifications" : "Mute voice chat notifications"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    voiceChatMute ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-colors ${
                      voiceChatMute ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vibrate Popup */}
      <VibratePopup
        isOpen={showVibratePopup}
        onClose={() => setShowVibratePopup(false)}
        onSave={handleVibrateChange}
        defaultValue={vibrateSetting.toLowerCase()}
      />

      {/* Mute Duration Popup */}
      <MuteDurationPopup
        isOpen={showMuteDurationPopup}
        onClose={handleMuteDurationClose}
        onConfirm={handleMuteDurationConfirm}
        type={pendingMuteType || 'message'}
      />
    </>
  );
}