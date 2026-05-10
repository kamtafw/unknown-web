"use client";

import Image from "next/image";

interface MediaGalleryProps {
  media: string[];
  postId: number;
  onExpandMedia: (media: string[], index: number) => void;
  registerVideo?: (videoId: string, element: HTMLVideoElement | null) => void;
  handleVideoPlay?: (videoElement: HTMLVideoElement) => void;
  allowVideoControls?: boolean; 
  onClick?: () => void; 
}

export default function MediaGallery({
  media,
  postId,
  onExpandMedia,
  registerVideo,
  handleVideoPlay,
  allowVideoControls = true,
  onClick,
}: MediaGalleryProps) {
  if (!media || media.length === 0) return null;

  const renderVideo = (
    mediaUrl: string,
    index: number,
    className: string = "w-full h-full object-contain"
  ) => {
    const videoId = `${postId}-${index}`;
    
    if (allowVideoControls) {
      // ForYou page - with controls and expand
      return (
        <>
          <video
            ref={(el) => registerVideo?.(videoId, el)}
            src={mediaUrl}
            className={className}
            preload="metadata"
            onClick={(e) => {
              e.stopPropagation();
              if (e.currentTarget.paused) {
                e.currentTarget.play();
              } else {
                e.currentTarget.pause();
              }
            }}
            onPlay={(e) => handleVideoPlay?.(e.currentTarget)}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          />
          {media.length === 1 && (
            <button
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                onExpandMedia(media, index);
              }}
              aria-label="Expand video"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          )}
        </>
      );
    } else {
      // Following page - no controls, click to navigate
      return (
        <>
          <video
            src={mediaUrl}
            className={className}
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className={`rounded-full bg-white/90 flex items-center justify-center ${
              media.length === 1 ? 'w-16 h-16' : media.length === 3 && index === 0 ? 'w-14 h-14' : 'w-12 h-12'
            }`}>
              <svg
                className={`text-gray-800 ${
                  media.length === 1 ? 'w-8 h-8 ml-1' : media.length === 3 && index === 0 ? 'w-7 h-7 ml-0.5' : 'w-6 h-6 ml-0.5'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </>
      );
    }
  };

  const renderImage = (
    mediaUrl: string,
    index: number,
    isSingle: boolean = false
  ) => {
    if (allowVideoControls) {
      // ForYou page - with expand button
      return (
        <>
          <Image
            src={mediaUrl}
            alt={`Post image ${index + 1}`}
            {...(isSingle ? { width: 500, height: 300 } : { fill: true })}
            className={isSingle ? "w-full h-auto object-contain max-h-96" : "object-cover"}
            unoptimized
            onClick={(e) => {
              e.stopPropagation();
              onExpandMedia(media, index);
            }}
          />
          {(isSingle || media.length === 2 || media.length === 3) && (
            <button
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onExpandMedia(media, index);
              }}
              aria-label="Expand image"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          )}
        </>
      );
    } else {
      // Following page - simple image
      return (
        <Image
          src={mediaUrl}
          alt={`Post image ${index + 1}`}
          {...(isSingle ? { width: 500, height: 300 } : { fill: true })}
          className={isSingle ? "w-full h-auto object-contain max-h-96" : "object-cover"}
          unoptimized
        />
      );
    }
  };

  const WrapperComponent = allowVideoControls ? 'div' : 'button';
  const wrapperProps = allowVideoControls 
    ? {} 
    : { onClick, 'aria-label': 'View post' };

  return (
    <div className="w-full">
      {media.length === 1 ? (
        // Single media item
        <WrapperComponent
          {...wrapperProps}
          className="w-full relative group"
        >
          <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
            {media[0].match(/\.(mp4|webm|ogg)$/i)
              ? renderVideo(media[0], 0, "w-full h-auto object-contain max-h-96")
              : renderImage(media[0], 0, true)}
          </div>
        </WrapperComponent>
      ) : media.length === 2 ? (
        // Two media items - side by side
        <div className="grid grid-cols-2 gap-1">
          {media.map((mediaUrl, index) => (
            <WrapperComponent
              key={index}
              {...wrapperProps}
              className="relative group aspect-square cursor-pointer"
            >
              <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                {mediaUrl.match(/\.(mp4|webm|ogg)$/i)
                  ? renderVideo(mediaUrl, index, "w-full h-full object-contain")
                  : renderImage(mediaUrl, index)}
              </div>
            </WrapperComponent>
          ))}
        </div>
      ) : media.length === 3 ? (
        // Three media items - first FULL WIDTH on top, two small below
        <div className="flex flex-col gap-1">
          {/* First media - full width */}
          <WrapperComponent
            {...wrapperProps}
            className="relative group w-full aspect-video cursor-pointer"
          >
            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
              {media[0].match(/\.(mp4|webm|ogg)$/i)
                ? renderVideo(media[0], 0, "w-full h-full object-contain")
                : renderImage(media[0], 0)}
            </div>
          </WrapperComponent>

          {/* Two media below - side by side */}
          <div className="grid grid-cols-2 gap-1">
            {media.slice(1, 3).map((mediaUrl, index) => (
              <WrapperComponent
                key={index + 1}
                {...wrapperProps}
                className="relative group aspect-square cursor-pointer"
              >
                <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                  {mediaUrl.match(/\.(mp4|webm|ogg)$/i)
                    ? renderVideo(mediaUrl, index + 1, "w-full h-full object-contain")
                    : renderImage(mediaUrl, index + 1)}
                </div>
              </WrapperComponent>
            ))}
          </div>
        </div>
      ) : (
        // Four or more media items - 2x2 grid with +X overlay on bottom-right
        <div className="grid grid-cols-2 gap-1">
          {media.slice(0, 4).map((mediaUrl, index) => (
            <WrapperComponent
              key={index}
              {...wrapperProps}
              className="relative group aspect-square cursor-pointer"
            >
              <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <>
                    {renderVideo(mediaUrl, index, "w-full h-full object-contain")}
                    {allowVideoControls && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-800 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  renderImage(mediaUrl, index)
                )}

                {/* Show +X overlay ONLY on 4th image (bottom-right) if more than 4 */}
                {index === 3 && media.length > 4 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white text-3xl font-semibold">
                      +{media.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </WrapperComponent>
          ))}
        </div>
      )}
    </div>
  );
}