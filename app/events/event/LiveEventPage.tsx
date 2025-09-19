"use client";

import { useState, useEffect } from "react";
import { Send, Smile, ArrowLeft } from "lucide-react";
import Image from "next/image";
import "@/app/global.css";
import { IoPersonSharp } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { MdAddReaction, MdOutlineMessage } from "react-icons/md";
import { IoMdShare } from "react-icons/io";
import { BsFillPeopleFill } from "react-icons/bs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { EmojiPopup } from "@/components/ui/EmojiPicker";
import { PeoplePopup } from "./PeoplePopup";
import { CommentsPopup } from "./CommentsPopup";

export default function LiveEventPage({ onLeave }: { onLeave: () => void }) {
  const [comment, setComment] = useState("");
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPopover, setShowReactionPopover] = useState(false);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [showPeoplePopup, setShowPeoplePopup] = useState(false);
  const [showCommentsPopup, setShowCommentsPopup] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "Victoria adna",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod",
      isLive: false,
      isHost: true,
    },
    {
      id: 2,
      username: "Victoria adna",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod",
      isLive: false,
    },
    {
      id: 3,
      username: "Victoria adna",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod",
      isLive: false,
    },
    {
      id: 4,
      username: "Victoria adna",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod",
      isLive: false,
    },
  ]);

  const quickReactions = ["😂", "❤️", "😍", "👏", "🔥", "😮", "😢", "😡", "👍"];

  const handleSendComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        username: "You",
        message: comment,
        isLive: false,
      };
      setComments([...comments, newComment]);
      setComment("");
      setTimeout(() => {
        const commentsContainer = document.querySelector(".scrollbar-hide");
        if (commentsContainer) {
          commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setComment(comment + emoji);
  };

  const handleMoreEmojis = () => {
    setShowEmojiPicker(false);
    console.log("Navigate to more emojis or emoji keyboard");
  };

  const handleReactionSelect = (emoji: string) => {
    const newComment = {
      id: comments.length + 1,
      username: "You",
      message: emoji,
      isLive: false,
    };
    setComments([...comments, newComment]);
    setShowReactionPopover(false); // Close the popover after selection
    setTimeout(() => {
      const commentsContainer = document.querySelector(".scrollbar-hide");
      if (commentsContainer) {
        commentsContainer.scrollTop = commentsContainer.scrollHeight;
      }
    }, 100);
  };

  const handleMoreEmojisClick = () => {
    setShowReactionPopover(false);
    setShowFullEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    handleReactionSelect(emoji);
    setShowFullEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        !(event.target as Element)?.closest(".emoji-picker-container")
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const topRowEmojis = quickReactions.slice(0, 5);
  const bottomRowEmojis = quickReactions.slice(5);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header with host info and leave button */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Mobile back button */}
          <button
            onClick={onLeave}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="relative flex-shrink-0">
            <Image
              src="/Rectangle 4.png"
              alt="Host"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base sm:text-lg truncate">Wade Warren</h2>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <IoPersonSharp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>50.4k</span>
              <FaHeart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>50.4k</span>
            </div>
          </div>
        </div>

        {/* Desktop leave button */}
        <button
          onClick={onLeave}
          className="hidden lg:block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
        >
          Leave
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
          <div className="w-full h-full flex items-center justify-center text-white text-lg sm:text-xl font-semibold">
            Live Event Background
          </div>
        </div>

        {/* Comments Section - Responsive positioning */}
        <div className="absolute left-2 sm:left-4 top-80 sm:top-8 bottom-16 sm:bottom-20 lg:bottom-4 w-72 sm:w-80 max-h-96 sm:max-h-120 flex flex-col gap-2 sm:gap-3 overflow-y-auto scrollbar-hide">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 sm:gap-3">
              <div className="relative flex-shrink-0">
                <Image
                  src="/Rectangle 4.png"
                  alt="User"
                  width={32}
                  height={32}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white object-cover"
                />
              </div>
              <div className="max-w-48 sm:max-w-64 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <span className="text-white font-semibold text-xs sm:text-sm truncate">
                    {comment.username}
                  </span>
                  {comment.isHost ? (
                    <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 sm:px-2 rounded-full font-medium flex-shrink-0">
                      Host
                    </span>
                  ) : (
                    comment.isLive && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 sm:px-2 rounded-full font-medium flex-shrink-0">
                        LIVE
                      </span>
                    )
                  )}
                </div>
                <p className="text-white text-xs sm:text-sm leading-relaxed break-words">
                  {comment.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input - Responsive positioning */}
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex items-center gap-2">
          <div className="bg-black/40 rounded-full px-3 py-2 sm:px-4 flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write Comment..."
              className="bg-transparent text-white placeholder-gray-300 outline-none text-xs sm:text-sm w-32 sm:w-48"
            />
            <div className="emoji-picker-container relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-300 hover:text-white transition-colors"
                title="Add emoji"
                aria-label="Add emoji"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-10 sm:bottom-12 right-0 bg-white rounded-lg shadow-lg p-2 flex gap-1 sm:gap-2">
                  <button
                    onClick={() => handleEmojiClick("😀")}
                    className="text-lg sm:text-2xl hover:bg-gray-100 p-1 rounded"
                  >
                    😀
                  </button>
                  <button
                    onClick={() => handleEmojiClick("❤️")}
                    className="text-lg sm:text-2xl hover:bg-gray-100 p-1 rounded"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => handleEmojiClick("👏")}
                    className="text-lg sm:text-2xl hover:bg-gray-100 p-1 rounded"
                  >
                    👏
                  </button>
                  <button
                    onClick={() => handleEmojiClick("🔥")}
                    className="text-lg sm:text-2xl hover:bg-gray-100 p-1 rounded"
                  >
                    🔥
                  </button>
                  <button
                    onClick={() => handleEmojiClick("😍")}
                    className="text-lg sm:text-2xl hover:bg-gray-100 p-1 rounded"
                  >
                    😍
                  </button>
                  <button
                    onClick={handleMoreEmojis}
                    className="text-sm sm:text-lg hover:bg-gray-100 p-1 rounded text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleSendComment}
              className="text-white hover:text-blue-300 transition-colors"
              title="Send comment"
              aria-label="Send comment"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar - Responsive layout */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-15 py-4 sm:py-6 lg:py-7 bg-white border-t lg:border-t-0">
        <Popover open={showReactionPopover} onOpenChange={setShowReactionPopover}>
          <PopoverTrigger asChild>
            <button
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-200 border-2 ${
                showReactionPopover ? "border-blue-500" : "border-transparent"
              }`}
              title="Add reaction"
              aria-label="Add reaction"
            >
              <MdAddReaction
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  showReactionPopover ? "text-blue-500" : "text-black"
                }`}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-2 sm:p-3"
            side="top"
            align="center"
            sideOffset={10}
          >
            {/* Mobile layout: Single column grid */}
            <div className="sm:hidden">
              <div className="grid grid-cols-5 gap-1 mb-2">
                {quickReactions.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleReactionSelect(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-full transition-colors duration-200"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleMoreEmojisClick}
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
                    onClick={() => handleReactionSelect(emoji)}
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
                    onClick={() => handleReactionSelect(emoji)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-2xl hover:bg-gray-100 rounded-full transition-colors duration-200"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={handleMoreEmojisClick}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-xl font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 border border-gray-300 md:border-2"
                  title="More emojis"
                >
                  +
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <button
          onClick={() =>
            setActiveButton(activeButton === "share" ? null : "share")
          }
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-200 border-2 ${
            activeButton === "share" ? "border-blue-500" : "border-transparent"
          }`}
          title="Share"
          aria-label="Share"
        >
          <IoMdShare
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              activeButton === "share" ? "text-blue-500" : "text-black"
            }`}
          />
        </button>
        <button
          onClick={() => setShowPeoplePopup(!showPeoplePopup)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-200 border-2 ${
            showPeoplePopup ? "border-blue-500" : "border-transparent"
          }`}
          title="View audience"
          aria-label="View audience"
        >
          <BsFillPeopleFill
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              showPeoplePopup ? "text-blue-500" : "text-black"
            }`}
          />
        </button>
        <button
          onClick={() => setShowCommentsPopup(!showCommentsPopup)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-200 border-2 ${
            showCommentsPopup ? "border-blue-500" : "border-transparent"
          }`}
          title="Comments"
          aria-label="Comments"
        >
          <MdOutlineMessage
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              showCommentsPopup ? "text-blue-500" : "text-black"
            }`}
          />
        </button>
      </div>

      {/* Remaining Popups */}
      {showFullEmojiPicker && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <EmojiPopup
              onSelect={handleEmojiSelect}
              onClose={() => setShowFullEmojiPicker(false)}
            />
          </div>
        </div>
      )}
      {showPeoplePopup && (
        <PeoplePopup onClose={() => setShowPeoplePopup(false)} />
      )}
      {showCommentsPopup && (
        <CommentsPopup onClose={() => setShowCommentsPopup(false)} />
      )}
    </div>
  );
}
