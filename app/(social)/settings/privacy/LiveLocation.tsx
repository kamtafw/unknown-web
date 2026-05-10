"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useToggleLiveLocationSharing } from "@/services/privacy/usePrivacyService";
import { useQueryClient } from "@tanstack/react-query";

interface LiveLocationPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  onStartSharing: () => void;
}

export default function LiveLocationPage({
  onBack,
  onNavigate,
}: LiveLocationPageProps) {
  const { mutate: toggleSharing, isPending } = useToggleLiveLocationSharing();
  const queryClient = useQueryClient();

  const handleStartSharing = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toggleSharing(
            {
              location_sharing_enabled: true,
              duration_minutes: 60,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["live-location-sharing"] });
                onNavigate("liveLocationSharing");
              },
            }
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          toggleSharing(
            {
              location_sharing_enabled: true,
              duration_minutes: 60,
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["live-location-sharing"] });
                onNavigate("liveLocationSharing");
              },
            }
          );
        }
      );
    } else {
      toggleSharing(
        {
          location_sharing_enabled: true,
          duration_minutes: 60,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["live-location-sharing"] });
            onNavigate("liveLocationSharing");
          },
        }
      );
    }
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Privacy"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Live Location</h1>
          </div>
        </div>
        <div className="px-4 py-6 space-y-6">
          <div className="w-32 h-32 overflow-hidden mx-auto">
            <Image
              src="/Frame.png"
              alt="Live Location"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-[16px] text-black font-bold text-left">
              You aren&#39;t sharing live location in any chats
            </p>
            <p className="text-[14px] text-gray-500 text-left mt-4">
              Live location requires background location, you can manage this in
              your device settings
            </p>
          </div>
          <button
            onClick={handleStartSharing}
            disabled={isPending}
            className="w-full mt-95 bg-blue-500 text-white py-2 rounded-full disabled:opacity-50"
          >
            {isPending ? "Starting..." : "Start Sharing"}
          </button>
        </div>
      </div>
    </div>
  );
}
