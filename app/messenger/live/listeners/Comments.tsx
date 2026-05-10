"use client";

import Image from "next/image";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsSoundwave } from "react-icons/bs";

export function Comments() {
  const comments = [
    {
      name: "Guy Guy",
      role: "Host",
      image: "/Rectangle5.png",
      isSpeaking: true,
      comment:
        "Welcome everyone to today's session! We'll be discussing the future of technology and innovation. Feel free to share your thoughts in the comments 😁😁.",
    },
    {
      name: "Victoria Johnson",
      role: "Co host",
      image: "/Rectangle 2.png",
      isSpeaking: false,
      comment:
        "Great topic! I'm excited to hear everyone's perspectives on how AI is shaping our daily lives and work environments 👍👍.",
    },
    {
      name: "Devon Lee",
      role: null,
      image: "/Rectangle 3.png",
      isSpeaking: false,
      comment:
        "This is fascinating! I've been following AI developments closely and would love to discuss the ethical implications👍😁.",
    },
    {
      name: "Christopher Martinez",
      role: null,
      image: "/Rectangle 4.png",
      isSpeaking: false,
      comment:
        "The automation aspect is what interests me most. How do we balance efficiency with job security?",
    },
    {
      name: "Amanda Rodriguez",
      role: null,
      image: "/Rectangle5.png",
      isSpeaking: false,
      comment:
        "Thanks for hosting this session! Really valuable insights being shared here.",
    },
    {
      name: "Michael Thompson",
      role: null,
      image: "/Rectangle 2.png",
      isSpeaking: false,
      comment:
        "Can we talk more about the environmental impact of these technologies? That's a crucial aspect we shouldn't overlook.",
    },
    {
      name: "Sarah Elizabeth",
      role: null,
      image: "/Rectangle 3.png",
      isSpeaking: false,
      comment:
        "Loving this discussion! The future possibilities seem endless but also a bit overwhelming.",
    },
  ];

  return (
    <div className="p-6 sm:p-4 md:p-6 space-y-4 sm:space-y-3">
      {comments.map((comment, index) => (
        <div key={index} className="flex items-start space-x-3 sm:space-x-2">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 bg-gray-700 rounded-full overflow-hidden">
              <Image
                src={comment.image}
                alt={comment.name}
                width={45}
                height={45}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center border border-gray-200">
              {comment.isSpeaking ? (
                <BsSoundwave className="text-green-500 text-xs sm:text-[10px] md:text-xs" />
              ) : (
                <FaMicrophoneAlt className="text-red-500 text-xs sm:text-[10px] md:text-xs" />
              )}
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-1.5 mb-1 sm:mb-0.5">
              <span className="font-medium text-gray-900 text-sm sm:text-xs md:text-sm truncate">
                {comment.name}
              </span>
              {comment.role && (
                <span className="px-2 py-1 sm:px-1.5 sm:py-0.5 text-xs sm:text-[10px] md:text-xs bg-green-300 text-blue-600 rounded-full border flex-shrink-0">
                  {comment.role}
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm sm:text-xs md:text-sm leading-relaxed sm:leading-normal">
              {comment.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
