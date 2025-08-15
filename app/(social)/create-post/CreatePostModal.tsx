"use client";

import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { X, Image as ImageIcon, Camera, MapPin, Hash } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import VisibilityDropdown from "./VisibilityDropdown";
import ReplyDropdown from "./ReplyDropdown";
import TagPopup from "./TagPopup";
import LocationPopup from "../home/main-popup/LocationPopup";
import { cn } from "@/lib/utils";

export default function CreatePostModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("Everyone");
  const [reply, setReply] = useState("Everyone");
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [textareaValue, setTextareaValue] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaValue]);


  useEffect(() => {
    return () => {
      images.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [images, cameraStream]);

  const handleTagSelect = (tag: string) => {
    const tagText = `#${tag}`;
    if (textareaValue.trim()) {
      setTextareaValue((prev) => `${prev} ${tagText}`);
    } else {
      setTextareaValue(tagText);
    }
    setShowTagPopup(false); 
  };

  const handleLocationSelect = (location: string) => {
    console.log("Location selected:", location);
    setSelectedLocation(location);

    const locationText = `📍 ${location}`;
    if (textareaValue.trim()) {
      setTextareaValue((prev) => `${prev}\n\n${locationText}`);
    } else {
      setTextareaValue(locationText);
    }

    setShowLocationPopup(false);
  };

  const handleClose = () => {
    images.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
    stopCamera();
    setShowLocationPopup(false);
    setShowTagPopup(false);
    setIsOpen(false);
    router.back();
  };

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

  const startCamera = async () => {
    console.log("Starting camera...");
    setCameraError("");
    setCameraReady(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      
      console.log("Camera stream obtained");
      setCameraStream(stream);
      setShowCamera(true);

      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log("Setting video source");
          videoRef.current.srcObject = stream;
          
          const handleLoadedMetadata = () => {
            console.log("Video metadata loaded, dimensions:", 
              videoRef.current?.videoWidth, 
              videoRef.current?.videoHeight
            );
            setCameraReady(true);
          };

          const handleCanPlay = () => {
            console.log("Video can play");
            if (videoRef.current) {
              videoRef.current.play().catch((error) => {
                console.error("Error playing video:", error);
                setCameraError("Failed to start video playback");
              });
            }
          };

          const handleError = (error: Event) => {
            console.error("Video error:", error);
            setCameraError("Video playback error");
          };

          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
          videoRef.current.addEventListener('error', handleError, { once: true });
        }
      }, 100);
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      const errorMessage =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions and try again."
          : "Unable to access camera. Please check if your device has a camera and try again.";
      setCameraError(errorMessage);
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera");
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    console.log("Attempting to capture photo");
    
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      console.error("Video or canvas not ready for capture");
      alert("Camera not ready. Please wait a moment and try again.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    console.log("Video dimensions:", video.videoWidth, video.videoHeight);

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video dimensions not available");
      alert("Camera not ready. Please wait a moment and try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (context) {
      try {
        // Mirror the image horizontally for front camera
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setImages((prev) => [...prev, imageUrl]);
              stopCamera();
              console.log("Photo captured successfully");
            } else {
              console.error("Failed to create blob from canvas");
              alert("Failed to capture photo. Please try again.");
            }
          },
          "image/jpeg",
          0.8
        );
      } catch (error) {
        console.error("Error drawing to canvas:", error);
        alert("Failed to capture photo. Please try again.");
      }
    } else {
      console.error("Could not get canvas context");
      alert("Failed to capture photo. Please try again.");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handlePost = () => {
    console.log("Post submitted:", {
      images,
      visibility,
      reply,
      text: textareaValue,
      location: selectedLocation,
    });
    handleClose();
  };

  // Handle escape key for popups
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showCamera) {
          stopCamera();
        } else if (showLocationPopup) {
          setShowLocationPopup(false);
        } else if (showTagPopup) {
          setShowTagPopup(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCamera, showLocationPopup, showTagPopup]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "fixed inset-4 m-auto max-w-md w-full bg-white rounded-lg shadow-lg z-40",
            "sm:max-w-lg",
            "max-h-[90vh] flex flex-col"
          )}
        >
          <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-black font-semibold">
              Create Post
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-4 ">
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
                  <p className="font-semibold mb-3 text-gray-900">
                    Kenechukwu @Kene_chukwu
                  </p>
                  <textarea
                    ref={textareaRef}
                    placeholder="What's on your mind?"
                    className="w-full p-3 rounded-lg resize-none focus:outline-none text-sm min-h-[60px]"
                    value={textareaValue}
                    onChange={handleTextareaChange}
                    style={{ overflow: "hidden" }}
                  />
                </div>
              </div>

              {/* Display uploaded/captured images */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Uploaded image ${index + 1}`}
                          width={200}
                          height={100}
                          className="w-full rounded-lg object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-6 mt-4">
                <div className="flex-1">
                  <VisibilityDropdown
                    visibility={visibility}
                    setVisibility={setVisibility}
                  />
                </div>
                <div className="flex-1">
                  <ReplyDropdown reply={reply} setReply={setReply} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-6 pt-4 border-t border-gray-100 flex-shrink-0 bg-white">
            <div className="flex space-x-3">
              <label className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                <ImageIcon className="h-6 w-6 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Upload images"
                  title="Upload images"
                />
              </label>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={startCamera}
                aria-label="Open camera"
                title="Open camera"
              >
                <Camera className="h-6 w-6 text-gray-600" />
              </button>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={() => {
                  console.log("Opening location popup");
                  setShowLocationPopup(true);
                }}
                aria-label="Add location"
                title="Add location"
              >
                <MapPin className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  console.log("Opening tag popup");
                  setShowTagPopup(true);
                }}
                title="Tag people"
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <Hash className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <button
              className="px-8 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePost}
              disabled={!textareaValue.trim() && images.length === 0}
            >
              Post
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      {showCamera && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopCamera();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-4 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="w-full h-64 object-cover transform scale-x-[-1]"
              />
              <canvas ref={canvasRef} className="hidden" />
              {(!cameraReady || cameraError) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <p className="text-gray-600">
                    {cameraError || "Loading camera..."}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={capturePhoto}
                className={cn(
                  "px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium",
                  (!cameraReady || cameraError) && "opacity-50 cursor-not-allowed"
                )}
                disabled={!cameraReady || !!cameraError}
              >
                {cameraReady && !cameraError ? "Capture Photo" : "Loading..."}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Popup */}
      {showTagPopup && (
        <TagPopup
          onClose={() => {
            console.log("Closing tag popup");
            setShowTagPopup(false);
          }}
          onTagSelect={handleTagSelect}
        />
      )}

        {/* Location Popup */}
        {showLocationPopup && (
          <LocationPopup
            onClose={() => {
              console.log("Closing location popup");
              setShowLocationPopup(false);
            }}
            onLocationSelect={handleLocationSelect}
          />
        )}
            </>
          );
      }
