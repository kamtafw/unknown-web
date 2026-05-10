"use client";

import Image from "next/image";

interface MediaViewerProps {
  media: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function MediaViewer({
  media,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}: MediaViewerProps) {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous Button - Only show if not on first item */}
      {media.length > 1 && currentIndex > 0 && (
        <button
          className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
          onClick={onPrevious}
          aria-label="Previous"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Media Container */}
      <div className="relative w-[90vw] h-[90vh] flex items-center justify-center">
        {media[currentIndex].match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            src={media[currentIndex]}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <Image
            src={media[currentIndex]}
            alt="Expanded media"
            width={1920}
            height={1080}
            className="max-w-full max-h-full object-contain"
            unoptimized
          />
        )}
      </div>

      {/* Next Button - Only show if not on last item */}
      {media.length > 1 && currentIndex < media.length - 1 && (
        <button
          className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
          onClick={onNext}
          aria-label="Next"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Counter - Only show if multiple items */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
}