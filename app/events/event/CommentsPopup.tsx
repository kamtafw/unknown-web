import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import Image from "next/image";
import { FaLink } from "react-icons/fa";
import { TbTimeDuration15 } from "react-icons/tb";
import { MdLocationOn } from "react-icons/md";

interface CommentsPopupProps {
  onClose: () => void;
}

interface Comment {
  id: number;
  name: string;
  username: string;
  image: string;
  message: string;
  isHost: boolean;
  hasEmojis?: boolean;
}

interface Link {
  id: number;
  title: string;
  description: string;
  url: string;
  image?: string;
}

interface Document {
  id: number;
  title: string;
  size: string;
  type: "PDF" | "MP3";
  date: string;
}

export function CommentsPopup({ onClose }: CommentsPopupProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "links">("comments");

  const comments: Comment[] = [
    {
      id: 1,
      name: "Victoria adhs",
      username: "@Victoria_adhs",
      image: "/Rectangle 4.png",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      isHost: true,
    },
    {
      id: 2,
      name: "Devon Lane",
      username: "@Devon_Lane",
      image: "/Rectangle 4.png",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 😍😍",
      isHost: false,
      hasEmojis: true,
    },
    {
      id: 3,
      name: "Darlene Robertson",
      username: "@Darlene_Robertson",
      image: "/Rectangle 4.png",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 😍😍",
      isHost: false,
      hasEmojis: true,
    },
    {
      id: 4,
      name: "Darrell Steward",
      username: "@Darrell_Steward",
      image: "/Rectangle 4.png",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 😍😍",
      isHost: false,
      hasEmojis: true,
    },
  ];

  const links: Link[] = [
    {
      id: 1,
      title: "Lorem ipsum dolor sit amet, consectetur retur",
      description: "Lorem ipsum dolor sit amet, consectetur retur urtur retur",
      url: "https://www.Loremipsumdolorsitamet,consecteturretu...",
      image: "/Rectangle 4.png",
    },
    {
      id: 2,
      title: "Lorem ipsum dolor sit amet, consectetur retur",
      description: "Lorem ipsum dolor sit amet, consectetur retur urtur retur",
      url: "https://www.Loremipsumdolorsitamet,consecteturretu...",
    },
  ];

  const documents: Document[] = [
    {
      id: 1,
      title: "Lorem ipsum dolor sit amet, tur",
      size: "2,3 GB • PDF",
      type: "PDF",
      date: "28/10/2024",
    },
    {
      id: 2,
      title: "Lorem ipsum dolatur",
      size: "2,3 GB • MP3",
      type: "MP3",
      date: "28/10/2024",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-90 sm:w-[90vw] md:w-[70vw] lg:w-[500px] xl:w-[600px] h-[80vh] sm:h-[80vh] flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sm:border-b-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 touch-manipulation"
            aria-label="Close comments popup"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600 font-medium text-sm sm:text-base touch-manipulation"
          >
            Leave
          </button>
        </div>

        {/* Title and Info */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold text-base sm:text-lg line-clamp-1">
              My cooking event tutorial
            </h2>
            <span className="text-xl sm:text-2xl">🍳</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MdLocationOn className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span className="truncate">Amuwo, Lagos, Nigeria</span>
            </div>
            <div className="flex items-center gap-1">
              <TbTimeDuration15 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span>LIVE</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-blue-500 text-xs">#Mindset</span>
            <span className="text-blue-500 text-xs">#Future</span>
            <span className="text-blue-500 text-xs">#Money</span>
            <span className="text-blue-500 text-xs">#Invest</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-3 sm:p-4">
          <div className="bg-gray-100 rounded-full p-1 sm:p-2 flex gap-1">
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-2 sm:px-3 py-2 rounded-full font-medium flex-1 text-xs sm:text-sm touch-manipulation ${
                activeTab === "comments"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Comments <span className="text-blue-500">23K+</span>
            </button>
            <button
              onClick={() => setActiveTab("links")}
              className={`px-2 sm:px-3 py-2 rounded-full font-medium flex-1 text-xs sm:text-sm touch-manipulation ${
                activeTab === "links"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Links &Docs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === "comments" ? (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 sm:gap-3">
                  <Image
                    src={comment.image}
                    alt={comment.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {comment.name}
                      </span>
                      {comment.isHost && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                      {comment.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Links */}
              {links.map((link) => (
                <div key={link.id}>
                  <div className="bg-blue-50 rounded-lg overflow-hidden">
                    <div className="flex gap-0">
                      {link.image ? (
                        <div className="w-16 h-16 sm:w-20 sm:h-16 md:w-24 md:h-20 relative flex-shrink-0">
                          <Image
                            src={link.image}
                            alt="Link preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 m-2 sm:m-3">
                          <FaLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                      )}
                      <div className="flex-1 p-2 sm:p-3 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 text-xs sm:text-sm line-clamp-2">
                          {link.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xs text-gray-400 truncate flex-1">
                      {link.url}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Documents */}
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 sm:gap-3 py-2">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      doc.type === "PDF" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    {doc.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{doc.size}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{doc.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
