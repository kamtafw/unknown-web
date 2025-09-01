"use client";

import { useState } from "react";
import { Send, Smile } from "lucide-react";
import Image from "next/image";
import "@/app/global.css";
import { IoPersonSharp } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";

export default function LiveEventPage({ onLeave }) {
  const [comment, setComment] = useState("");
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

  //   const handleSendComment = () => {
  //     if (comment.trim()) {
  //       const newComment = {
  //         id: comments.length + 1,
  //         username: "You",
  //         message: comment,
  //         isLive: false,
  //       };
  //       setComments([...comments, newComment]);
  //       setComment("");
  //     }
  //   };

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
        const commentsContainer = document.querySelector(".overflow-y-auto");
        if (commentsContainer) {
          commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
      }, 0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header with host info and leave button */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/Rectangle 4.png"
              alt="Host"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-white object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Wade Warren</h2>
            <div className="flex items-center gap-2 text-sm">
              <div></div>
              <IoPersonSharp />
              <span>50.4k</span>
              <FaHeart />
              <span>50.4k</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
        >
          Leave
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/Frame 427321627.png"
            alt="Live Event"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Comments Section - Left Side */}
      <div className="absolute left-140 top-90 bottom-10 w-90 max-h-96 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <Image
                src="/Rectangle 4.png"
                alt="User"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-white object-cover"
              />
            </div>
            <div className="max-w-64">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm">
                  {comment.username}
                </span>
                {comment.isHost ? (
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Host
                  </span>
                ) : (
                  comment.isLive && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      LIVE
                    </span>
                  )
                )}
              </div>
              <p className="text-white text-sm leading-relaxed">
                {comment.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input - Bottom Right */}
      <div className="absolute -bottom-15 right-18 flex items-center gap-2">
        <div className="bg-black/40 bg-opacity-50 rounded-full px-4 py-2 flex items-center gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write Comment..."
            className="bg-transparent text-white placeholder-gray-300 outline-none text-sm w-48"
          />
          <button className="text-gray-300 hover:text-white transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendComment}
            className="text-white hover:text-blue-300 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

{
  /* Bottom Action Bar */
}
{
  /* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-black bg-opacity-50 rounded-full px-6 py-3">
        <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </button>
        <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </button>
        <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-white text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div> */
}
