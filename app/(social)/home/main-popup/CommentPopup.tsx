"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Image as ImageIcon,
  Camera,
  Hash,
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Bookmark,
  MapPin,
} from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import SharePopup from "./SharePopup";
import LocationPopup from "./LocationPopup";
import TagPopup from "../../create-post/TagPopup";

interface Post {
  id: string | number;
  name: string;
  username: string;
  time: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
  reposts: number;
}

export default function CommentPopup({
  onClose,
  post,
}: {
  onClose: () => void;
  post: Post;
}) {
  const router = useRouter();
  const [textareaValue, setTextareaValue] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const sharePopupRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTagPopup, setShowTagPopup] = useState(false);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sharePopupRef.current &&
      !sharePopupRef.current.contains(event.target as Node)
    ) {
      setShowSharePopup(false);
    }
  };
  const handleTagSelect = (tag: string) => {
    const tagText = `#${tag}`;
    if (textareaValue.trim()) {
      setTextareaValue((prev) => `${prev} ${tagText}`);
    } else {
      setTextareaValue(tagText);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSharePopup(!showSharePopup);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setCameraStream(stream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      const errorMessage =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions and try again."
          : "Unable to access camera. Please check if your device has a camera and try again.";
      alert(errorMessage);
    }
  };

const stopCamera = useCallback(() => {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  }
  setShowCamera(false);
}, [cameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setImages((prev) => [...prev, imageUrl]);
              stopCamera();
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setImages((prev) => [...prev, ...newImages]);
    }

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    images.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
    stopCamera();
    setShowLocationPopup(false);
    router.push("/home");
    onClose();
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);

    const locationText = `📍 ${location}`;
    if (textareaValue.trim()) {
      setTextareaValue((prev) => `${prev}\n\n${locationText}`);
    } else {
      setTextareaValue(locationText);
    }
  };

 useEffect(() => {
    return () => {
      images.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
}, [images, cameraStream, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[550px] h-[90vh] shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold">Reply Comment</h3>
          <button
            onClick={() => {
              stopCamera();
              setShowLocationPopup(false);
              setShowTagPopup(false);
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close comment popup"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Take Photo</h4>
                <button
                  onClick={stopCamera}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close camera"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play();
                    }
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-600">Loading camera...</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
                  disabled={!cameraStream}
                >
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                <Image
                  src="/profilepic.jpg"
                  alt={post.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-base truncate">
                    {post.name}
                  </span>
                  <span className="text-sm text-gray-500 truncate">
                    {post.username}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{post.time}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-base leading-relaxed">{post.content}</p>
              <div className="mt-3 rounded-lg overflow-hidden">
                <Image
                  src={post.image}
                  alt="Post image"
                  width={550}
                  height={275}
                  className="w-full object-contain"
                />
              </div>
              <div className="flex justify-between items-center mt-4 max-w-sm">
                <button
                  className="flex items-center gap-2 hover:bg-red-50 p-2 rounded-full transition-colors group"
                  onClick={() => setLiked(!liked)}
                  aria-label={liked ? "Unlike post" : "Like post"}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      liked
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500 group-hover:text-red-500"
                    )}
                  />
                  <span className="text-sm text-gray-600">
                    {formatCount(post.likes)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded-full transition-colors group"
                  aria-label="View comments"
                >
                  <MessageSquare className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {formatCount(post.comments)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-2 hover:bg-green-50 p-2 rounded-full transition-colors group"
                  aria-label="Repost"
                >
                  <Repeat className="h-5 w-5 text-gray-500 group-hover:text-green-500" />
                  <span className="text-sm text-gray-600">
                    {formatCount(post.reposts)}
                  </span>
                </button>
                <div className="relative">
                  <button
                    className="hover:bg-blue-50 p-2 rounded-full transition-colors group"
                    onClick={handleShareClick}
                    aria-label="Share post"
                    title="Share post"
                  >
                    <Share2 className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                  </button>
                  {showSharePopup && (
                    <div
                      ref={sharePopupRef}
                      className="absolute right-0 bottom-12 z-50"
                    >
                      <SharePopup
                        onClose={() => setShowSharePopup(false)}
                        postId={post.id}
                      />
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded-full transition-colors group"
                  onClick={() => setBookmarked(!bookmarked)}
                  aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
                >
                  <Bookmark
                    className={cn(
                      "h-5 w-5 transition-colors",
                      bookmarked
                        ? "text-blue-500 fill-blue-500"
                        : "text-gray-500 group-hover:text-blue-500"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                <Image
                  src="/profilepic.jpg"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  <span className="font-semibold text-base">Kenechukwu</span>
                  <span className="text-sm text-gray-500">@Kene_chukwu</span>
                </div>
                <textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  className="w-full p-1 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs min-h-[2px]"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  style={{ overflow: "hidden" }}
                />
              </div>
            </div>

            {images.length > 0 && (
              <div className="ml-15">
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Uploaded image ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-[120px] rounded-lg object-cover border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <label
                className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
                aria-label="Upload images"
              >
                <ImageIcon
                  className="h-5 w-5 text-gray-600"
                  aria-label="Upload image"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={startCamera}
                aria-label="Open camera"
                title="Open camera"
              >
                <Camera className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={() => setShowLocationPopup(true)}
                aria-label="Add location"
              >
                <MapPin className="h-6 w-6 text-gray-600" />
              </button>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={() => setShowTagPopup(true)}
                aria-label="Add hashtag"
              >
                <Hash className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePost}
              disabled={!textareaValue.trim() && images.length === 0}
            >
              Post
            </button>
          </div>
        </div>

        {/* Location Popup */}
        {showLocationPopup && (
          <LocationPopup
            onClose={() => setShowLocationPopup(false)}
            onLocationSelect={handleLocationSelect}
          />
        )}
        {showTagPopup && (
          <TagPopup
            onClose={() => setShowTagPopup(false)}
            onTagSelect={handleTagSelect}
          />
        )}
      </div>
    </div>
  );
}
