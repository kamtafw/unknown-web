"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface WallpaperPageProps {
  onBack: () => void;
}

export default function WallpaperPage({ onBack }: WallpaperPageProps) {
  const [dimming, setDimming] = useState(50);
  const [isSliderActive, setIsSliderActive] = useState(false);

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Chat"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Dark theme wallpaper</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          <div className="w-full max-w-[500px] h-[300px] bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500">Wallpaper Preview</span>
          </div>
          <div className="flex flex-col items-center my-6">
            <h2 className="text-lg font-semibold text-blue-400 cursor-pointer">Change</h2>
            <div className="mt-5 h-px w-full bg-gray-300" />
          </div>

          <h2 className="mt-4 text-lg  text-gray-500 text-[14px]">
            Wallpaper dimming
          </h2>
          <div className="mt-2 relative">
            <label htmlFor="wallpaper-dimming-slider" className="sr-only">
              Wallpaper dimming slider
            </label>
            <div className="relative">
              <input
                id="wallpaper-dimming-slider"
                type="range"
                min="10"
                max="100"
                value={dimming}
                onChange={(e) => setDimming(Number(e.target.value))}
                onMouseDown={() => setIsSliderActive(true)}
                onMouseUp={() => setIsSliderActive(false)}
                onTouchStart={() => setIsSliderActive(true)}
                onTouchEnd={() => setIsSliderActive(false)}
                className="w-full max-w-[500px] h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6A88D1] slider-custom"
                style={{
                  background: `linear-gradient(to right, #6A88D1 0%, #6A88D1 ${
                    ((dimming - 10) / 90) * 100
                  }%, #e5e7eb ${((dimming - 10) / 90) * 100}%, #e5e7eb 100%)`,
                }}
                title="Wallpaper dimming slider"
              />
              {isSliderActive && (
                <div
                  className="absolute -top-12 bg-gray-800 text-white text-sm px-2 py-1 rounded pointer-events-none z-10"
                  style={{
                    left: `calc(${((dimming - 10) / 90) * 100}% - 16px)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {dimming}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
            <style jsx>{`
              .slider-custom::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #6a88d1;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .slider-custom::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #6a88d1;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
            `}</style>
            <p className="mt-5 text-gray-500 text-[14px]">To change your wallpaper for lights theme, turn on light theme from settings {'>'} chat {'>'} Theme</p>
          </div>
        </div>
      </div>
    </div>
  );
}
