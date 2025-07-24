"use client";

import { ArrowLeft, Database, Upload, Wifi } from "lucide-react";
import { useState } from "react";
import MediaUploadQualityPopup from "./MediaUploadQualityPopup";
import MobileDataPopup from "./MobileDataPopup";
import WiFiPopup from "./WifiPopup";
import RoamingPopup from "./RoamingPopup";

interface DataAndStorageProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export default function DataAndStorage({ onBack, onNavigate }: DataAndStorageProps) {
  const [showMediaUploadPopup, setShowMediaUploadPopup] = useState(false);
  const [showMobileDataPopup, setShowMobileDataPopup] = useState(false);
  const [showWiFiPopup, setShowWiFiPopup] = useState(false);
  const [showRoamingPopup, setShowRoamingPopup] = useState(false);
  const [mediaUploadQuality, setMediaUploadQuality] = useState("HD");
  const [autoDownloadSettings, setAutoDownloadSettings] = useState({
    mobileData: "",
    wifi: "",
    roaming: "",
  });

  const handleSaveMediaQuality = (quality: string) => {
    setMediaUploadQuality(quality);
    setShowMediaUploadPopup(false);
  };

  const handleSaveAutoDownload = (type: "mobileData" | "wifi" | "roaming", selections: { photos: boolean; videos: boolean; audio: boolean; documents: boolean }) => {
    const newText = Object.entries(selections)
      .filter(([, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(", ") || "Nothing";
    setAutoDownloadSettings((prev) => ({
      ...prev,
      [type]: newText,
    }));
    setShowMobileDataPopup(false);
    setShowWiFiPopup(false);
    setShowRoamingPopup(false);
  };

  return (
    <div className="flex justify-start ml-5 md:ml-5">
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
            <h1 className="text-xl font-bold">Data and Storage</h1>
          </div>
        </div>
        
        <div className="px-4 py-3 flex flex-col space-y-4">
          <button
            onClick={() => onNavigate?.("manage-storage")}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <Database size={20} className="text-gray-500" />
            <div>
              <span className="text-sm font-semibold">Manage storage</span>
              <p className="text-sm text-gray-500">2.3 GB</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate?.("network-usage")}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <Wifi size={20} className="text-gray-500" />
            <div>
              <span className="text-sm font-semibold">Network usage</span>
              <p className="text-sm text-gray-500">667.6 MB sent - 6.6 GB received</p>
            </div>
          </button>

          <button
            onClick={() => setShowMediaUploadPopup(true)}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <Upload size={20} className="text-gray-500" />
            <div>
              <span className="text-sm font-semibold">Media Upload Quality</span>
              <p className="text-sm text-gray-500">{mediaUploadQuality} quality</p>
            </div>
          </button>

          <div className="mt-5 h-px w-full bg-gray-300" />

          <div className="mt-4">
            <div className="text-[14px] text-gray-500">Media auto-download</div>
            <div className="text-[14px] text-gray-500 mt-4">Voice messages are always automatically <br />downloaded</div>
          </div>

          <button
            onClick={() => setShowMobileDataPopup(true)}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <div>
              <span className="text-sm font-semibold">When using mobile data</span>
              <p className="text-sm text-gray-500">{autoDownloadSettings.mobileData}</p>
            </div>
          </button>

          <button
            onClick={() => setShowWiFiPopup(true)}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <div>
              <span className="text-sm font-semibold">When connected on Wi-Fi</span>
              <p className="text-sm text-gray-500">{autoDownloadSettings.wifi}</p>
            </div>
          </button>

          <button
            onClick={() => setShowRoamingPopup(true)}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <div>
              <span className="text-sm font-semibold">When roaming</span>
              <p className="text-sm text-gray-500">{autoDownloadSettings.roaming}</p>
            </div>
          </button>
        </div>

        {showMediaUploadPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <MediaUploadQualityPopup onClose={() => setShowMediaUploadPopup(false)} onSave={handleSaveMediaQuality} />
          </div>
        )}
        {showMobileDataPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <MobileDataPopup onClose={() => setShowMobileDataPopup(false)} onSave={(selections) => handleSaveAutoDownload("mobileData", selections)} />
          </div>
        )}
        {showWiFiPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <WiFiPopup onClose={() => setShowWiFiPopup(false)} onSave={(selections) => handleSaveAutoDownload("wifi", selections)} />
          </div>
        )}
        {showRoamingPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <RoamingPopup onClose={() => setShowRoamingPopup(false)} onSave={(selections) => handleSaveAutoDownload("roaming", selections)} />
          </div>
        )}
      </div>
    </div>
  );
}

