"use client";

import { useState, useEffect } from "react";
import { X, Play, Pause } from "lucide-react";
import Image from "next/image";
import { FaVolumeUp } from "react-icons/fa";
import "@/app/global.css";

interface ReadPostPopupProps {
  onClose: () => void;
  postContent: string;
}

export default function ReadPostPopup({ onClose }: ReadPostPopupProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(0);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setIsPlaying(true);

      const progressTimer = setInterval(() => {
        //   if (prev >= duration) {
        //     clearInterval(progressTimer);
        //     setIsPlaying(false);
        //     return duration;
        //   }
        //   return prev + 1;
        // });
        setCurrentTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(progressTimer);
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, [duration]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-120 max-w-[90vw]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Read post out loud</h3>
            <button
              type="button"
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src="/speakout.svg"
                alt="Loading"
                width={128}
                height={128}
                className="animate-spin"
              />
            </div>
            <p className="text-gray-600 text-center">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-8 max-w-[90vw]"
        style={{ width: "500px" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Read post out loud</h3>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center">
              <div className="w-25 h-25 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  {/* <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> */}
                  <FaVolumeUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-2">Reading post out loud</p>
          <p className="text-lg font-medium mb-4">{formatTime(duration)}</p>

          <div className="w-full mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="w-full h-1">
              <div
                className="flex items-center space-x-1"
                style={{ width: `${progressPercentage}%`, overflow: "hidden" }}
              >
                {[
                  2, 8, 4, 12, 6, 10, 3, 9, 5, 11, 7, 8, 2, 6, 4, 9, 3, 7, 5,
                  10,
                ].map((height, index) => (
                  <div
                    key={index}
                    className="bg-green-500 rounded-sm animate-pulse"
                    style={{
                      width: "5px",
                      height: `${height}px`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={togglePlayPause}
            className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
