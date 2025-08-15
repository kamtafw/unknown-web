import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Send,
  Smile,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StoryImage {
  file: File;
  url: string;
  caption: string;
  id: string;
}

interface EditStoryProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile?: File;
}

const TbCircleDashed = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <circle cx="12" cy="12" r="9" strokeDasharray="4 4" />
  </svg>
);

const EditStory: React.FC<EditStoryProps> = ({
  isOpen,
  onClose,
  imageFile,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>("24h");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isEmojiPopoverOpen, setIsEmojiPopoverOpen] = useState<boolean>(false);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const popularEmojis = [
    "😀",
    "😂",
    "🥰",
    "😍",
    "🤔",
    "😎",
    "🥳",
    "😴",
    "🔥",
    "❤️",
    "👍",
    "👏",
    "🙌",
    "💯",
    "⭐",
    "🎉",
    "🌟",
    "💖",
    "🌈",
    "☀️",
    "🌙",
    "⚡",
    "💫",
    "✨",
  ];

  useEffect(() => {
    if (imageFile && isOpen) {
      const newStoryImage: StoryImage = {
        file: imageFile,
        url: URL.createObjectURL(imageFile),
        caption: "",
        id: Date.now().toString(),
      };
      setStoryImages([newStoryImage]);
      setCurrentImageIndex(0);
    }
  }, [imageFile, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStoryImages((prevImages) => {
        prevImages.forEach((img) => URL.revokeObjectURL(img.url));
        return [];
      });
      setCurrentImageIndex(0);
      setSelectedDuration("24h");
      setIsPopoverOpen(false);
      setIsEmojiPopoverOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = storyImages[currentImageIndex];

  const handleDurationSelect = (duration: string): void => {
    setSelectedDuration(duration);
    setIsPopoverOpen(false);
  };

  const handleAddImages = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const newStoryImages: StoryImage[] = imageFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        caption: "",
        id: Date.now().toString() + Math.random().toString(),
      }));

      setStoryImages((prev) => [...prev, ...newStoryImages]);
      setCurrentImageIndex(storyImages.length);
    }
    event.target.value = "";
  };

  const handleCaptionChange = (caption: string) => {
    if (currentImage) {
      setStoryImages((prev) =>
        prev.map((img) =>
          img.id === currentImage.id ? { ...img, caption } : img
        )
      );
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (currentImage) {
      const newCaption = currentImage.caption + emoji;
      handleCaptionChange(newCaption);
    }
    setIsEmojiPopoverOpen(false);
  };

  const handleDeleteImage = () => {
    if (storyImages.length <= 1) {
      handleClose();
      return;
    }

    URL.revokeObjectURL(currentImage.url);

    const newImages = storyImages.filter((img) => img.id !== currentImage.id);
    setStoryImages(newImages);

    if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(newImages.length - 1);
    }
  };

  const handleSend = () => {
    console.log(
      "Sending story with images:",
      storyImages.map((img) => ({
        caption: img.caption,
        fileName: img.file.name,
      }))
    );

    handleClose();
  };

  const handleClose = () => {
    storyImages.forEach((img) => URL.revokeObjectURL(img.url));
    onClose();
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : storyImages.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < storyImages.length - 1 ? prev + 1 : 0
    );
  };

  const durationOptions = [
    { label: "6 Hours", value: "6h" },
    { label: "12 Hours", value: "12h" },
    { label: "24 Hours", value: "24h" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Image"
      />

      {/* Main Story Editor */}
      <div className="bg-white/50 rounded-lg w-[300px] max-w-md mx-4 relative h-[500px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 relative z-10 bg-white/50">
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Story Editor</h2>
            {storyImages.length > 0 && (
              <span className="text-sm text-gray-500">
                ({currentImageIndex + 1}/{storyImages.length})
              </span>
            )}
          </div>
          <button
            onClick={handleAddImages}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-blue-500"
            aria-label="Add images"
            title="Add images"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Image Area */}
        <div className="relative h-[calc(100%-140px)]">
          {currentImage ? (
            <>
              <Image
                src={currentImage.url}
                alt="Story content"
                className="w-full h-full object-contain bg-gray-100"
                fill
                sizes="300px"
              />

              {/* Delete Button */}
              <button
                onClick={handleDeleteImage}
                className="absolute top-2 right-2 bg-red-300 hover:bg-red-600 rounded-full p-2 text-white transition-colors"
                aria-label="Delete image"
                title="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Add images to create your story</p>
                <button
                  onClick={handleAddImages}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Select Images
                </button>
              </div>
            </div>
          )}

          {/* Navigation arrows for multiple images */}
          {storyImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
                aria-label="Previous image"
                title="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
                aria-label="Next image"
                title="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Image dots indicator */}
        {storyImages.length > 1 && (
          <div className="flex justify-center gap-1 py-2 bg-gray-100">
            {storyImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label={`Go to image ${index + 1}`}
                title={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Caption Input Area */}
        {currentImage && (
          <div className="p-4 bg-gray-200 border-t">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2">
              <input
                type="text"
                placeholder={`Caption for image ${currentImageIndex + 1}`}
                title={`Caption for image ${currentImageIndex + 1}`}
                value={currentImage.caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 text-sm"
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                className="p-1.5 hover:bg-blue-100 rounded-full transition-colors text-blue-500"
                aria-label="Send story"
                title="Send story"
              >
                <Send className="h-4 w-4" />
              </button>

              {/* Emoji Selector */}
              <Popover
                open={isEmojiPopoverOpen}
                onOpenChange={setIsEmojiPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                    aria-label="Add emoji"
                    title="Add emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end" side="top">
                  <div className="flex flex-wrap gap-2">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                        aria-label={`Insert emoji ${emoji}`}
                        title={`Insert emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Duration Selector */}
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="relative flex items-center justify-center p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Set duration"
                    title="Set duration"
                  >
                    <TbCircleDashed className="h-6 w-6 text-gray-600" />
                    <span className="absolute text-xs font-medium text-gray-600">
                      {selectedDuration}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end" side="top">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-700 px-2 py-1">
                      Story duration
                    </div>
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDurationSelect(option.value)}
                        className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                          selectedDuration === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditStory;
