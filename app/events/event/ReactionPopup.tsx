"use client";

interface ReactionPopupProps {
  onReactionSelect: (emoji: string) => void;
  onMoreEmojis: () => void;
  onClose: () => void;
}

export function ReactionPopup({ onReactionSelect, onMoreEmojis, onClose }: ReactionPopupProps) {
  const quickReactions = ["😂", "❤️", "😍", "👏", "🔥", "😮", "😢", "😡", "👍"];

  const handleReactionClick = (emoji: string) => {
    onReactionSelect(emoji);
    onClose();
  };

  const topRowEmojis = quickReactions.slice(0, 5);
  const bottomRowEmojis = quickReactions.slice(5);

  return (
    <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-2 sm:p-3 max-w-xs sm:max-w-none">
      {/* Mobile layout: Single column grid */}
      <div className="sm:hidden">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {quickReactions.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleReactionClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-full transition-colors duration-200"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={onMoreEmojis}
            className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 border border-gray-300"
            title="More emojis"
          >
            +
          </button>
        </div>
      </div>

      {/* Tablet and desktop layout: Two rows */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-2">
          {topRowEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleReactionClick(emoji)}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-2xl hover:bg-gray-100 rounded-full transition-colors duration-200"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1 md:gap-2">
          {bottomRowEmojis.map((emoji, index) => (
            <button
              key={index + 5}
              onClick={() => handleReactionClick(emoji)}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-2xl hover:bg-gray-100 rounded-full transition-colors duration-200"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={onMoreEmojis}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-xl font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 border border-gray-300 md:border-2"
            title="More emojis"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}