import React, { useState, useEffect, useRef } from "react";
import { X, Send, Smile, Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditTextStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditTextStatus: React.FC<EditTextStatusProps> = ({ isOpen, onClose }) => {
  const [statusText, setStatusText] = useState<string>("");
  const [isEmojiPopoverOpen, setIsEmojiPopoverOpen] = useState<boolean>(false);
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const backgroundColors = [
    { name: "Green", class: "bg-green-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Purple", class: "bg-purple-500" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "Red", class: "bg-red-500" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Yellow", class: "bg-yellow-500" },
    { name: "Indigo", class: "bg-indigo-500" },
    { name: "Teal", class: "bg-teal-500" },
    { name: "Cyan", class: "bg-cyan-500" },
    { name: "Emerald", class: "bg-emerald-500" },
    { name: "Rose", class: "bg-rose-500" },
  ];

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStatusText("");
      setCurrentColorIndex(0);
      setIsEmojiPopoverOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleColorChange = (): void => {
    const nextIndex = (currentColorIndex + 1) % backgroundColors.length;
    setCurrentColorIndex(nextIndex);
  };

  const handleEmojiSelect = (emoji: string) => {
    const newText = statusText + emoji;
    setStatusText(newText);
    setIsEmojiPopoverOpen(false);

    // Focus back to textarea after emoji selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newText.length, newText.length);
      }
    }, 0);
  };

  const handleSend = () => {
    if (statusText.trim()) {
      console.log("Sending text status:", {
        text: statusText,
        backgroundColor: backgroundColors[currentColorIndex].class,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      {/* Main Text Status Editor */}
      <div className="w-[300px] max-w-md mx-4 relative h-[500px] overflow-hidden rounded-lg bg-white border-10 border-white">
        {/* Background with selected color */}
        <div
          className={`absolute inset-0 ${backgroundColors[currentColorIndex].class} rounded-lg`}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-white">
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-800"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-semibold text-gray-800">Text Status</h2>

          {/* Color Changer Button */}
          <button
            onClick={handleColorChange}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-800"
            aria-label="Change background color"
            title="Change background color"
          >
            <Palette className="h-5 w-5" />
          </button>
        </div>

        {/* Text Input Area - Full page textarea */}
        <div className="relative z-10 h-[calc(100%-140px)] p-4 flex items-center justify-center ">
          <textarea
            ref={textareaRef}
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a status"
            className="w-full h-full bg-transparent text-white placeholder-white/70 text-xl font-medium resize-none outline-none text-center"
            style={{
              fontSize:
                statusText.length > 100
                  ? "18px"
                  : statusText.length > 50
                  ? "20px"
                  : "24px",
              paddingTop: "50%",
            }}
            maxLength={300}
          />
        </div>

        {/* Character Counter */}
        <div className="absolute bottom-16 left-4 z-10">
          <span className="text-white/70 text-sm">{statusText.length}/300</span>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3">
          {/* Emoji Selector */}
          <Popover
            open={isEmojiPopoverOpen}
            onOpenChange={setIsEmojiPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                aria-label="Add emoji"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
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

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!statusText.trim()}
            className={`p-3 rounded-full transition-colors ${
              statusText.trim()
                ? "bg-white text-gray-800 hover:bg-gray-100"
                : "bg-white/20 text-white/50 cursor-not-allowed"
            }`}
            aria-label="Send status"
            title="Send status (Ctrl+Enter)"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTextStatus;
