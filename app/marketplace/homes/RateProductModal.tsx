"use client";

import { useState } from "react";
import { ArrowLeft, Star, Smile, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface RateProductModalProps {
  onClose: () => void;
  onBack: () => void;
}

export function RateProductModal({ onClose, onBack }: RateProductModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nost"
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [images, setImages] = useState([
    "/review 1.svg",
    "/review 2.svg",
    "/review 3.svg",
  ]);

  const emojis = ["😀", "😊", "😍", "👍", "❤️", "🔥", "💯", "🎉", "👏", "🚀"];

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleStarHover = (starIndex: number) => {
    setHoveredRating(starIndex + 1);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  //   const addImage = () => {
  //     if (images.length < 3) {
  //       const newImage = `/review${images.length + 1}.svg`;
  //       setImages((prev) => [...prev, newImage]);
  //     }
  //   };

  const handleSend = () => {
    onClose();
  };

  const characterCount = message.length;
  const maxCharacters = 100;

  return (
    <div
      className="fixed inset-0 bg-black/80 bg-opacity-30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Rate this product/seller
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Star Rating */}
          <div className="flex justify-start space-x-2 mb-8">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleStarClick(i)}
                onMouseEnter={() => handleStarHover(i)}
                onMouseLeave={handleStarLeave}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`Rate ${i + 1} star${i + 1 > 1 ? "s" : ""}`}
                title={`Give ${i + 1} star${i + 1 > 1 ? "s" : ""} rating`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    i < (hoveredRating || rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Compose Message */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compose message
            </h3>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= maxCharacters) {
                    setMessage(e.target.value);
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Write your review..."
              />

              {/* Emoji button */}
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Add emoji"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 z-10">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Character count */}
            <div className="flex justify-end mt-2">
              <span
                className={`text-sm ${
                  characterCount >= maxCharacters
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>

          {/* Add Images */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Images (3 Max)
              </h3>
              <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={image}
                      alt={`Review image ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute bottom-4 right-6 w-15 h-15 bg-black/20 bg-opacity-70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                    title="Delete this image"
                  >
                    <Trash2 className="w-8 h-8" />
                  </button>
                </div>
              ))}

              {/* Add image button */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    const imageUrl = URL.createObjectURL(file);
                    setImages((prev) => [...prev, imageUrl]);
                  });
                  e.target.value = "";
                }}
                className="hidden"
                id="image-upload"
                aria-label="Upload images"
                title="Select images to upload"
              />
              <label
                htmlFor="image-upload"
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0"
              >
                <Plus className="w-8 h-8 text-gray-400 hover:text-blue-500" />
              </label>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <button
            onClick={handleSend}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
