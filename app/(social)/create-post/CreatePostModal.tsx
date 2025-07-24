"use client";

import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { X, Image as ImageIcon, Camera, MapPin, Hash } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import VisibilityDropdown from "./VisibilityDropdown";
import ReplyDropdown from "./ReplyDropdown";
import TagPopup from "./TagPopup";
import { cn } from "@/lib/utils";

export default function CreatePostModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [visibility, setVisibility] = useState("Everyone");
  const [reply, setReply] = useState("Everyone");
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaValue]);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).slice(0, 2 - images.length); // Limit to 2 images
      setImages((prev) => [...prev, ...newImages]);
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
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          "fixed inset-4 m-auto max-w-md w-full bg-white rounded-lg shadow-lg z-50",
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
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Image
                  src="/Beli.png"
                  alt="Description 1"
                  width={200}
                  height={100}
                  className="w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => {}}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              {/* <div className="flex flex-col sm:flex-row gap-4 mb-4">
//           {images.map((image, index) => (
//             <div key={index} className="relative w-32 h-32">
//               <Image
//                 src={URL.createObjectURL(image)}
//                 alt={`Uploaded image ${index + 1}`}
//                 width={128}
//                 height={128}
//                 className="w-full h-full object-cover rounded-lg"
//               />
//               <button
//                 onClick={() => removeImage(index)}
//                 className="absolute top-1 right-1 p-1 bg-gray-800 bg-opacity-50 rounded-full"
//                 aria-label="Remove image"
//               >
//                 <X className="h-4 w-4 text-white" />
//               </button>
//             </div>
//           ))}
//         </div> */}
              <div className="relative flex-1">
                <Image
                  src="/Beli.png"
                  alt="Description 2"
                  width={200}
                  height={100}
                  className="w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => {}}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mb-6">
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
              title="Open camera"
            >
              <Camera className="h-6 w-6 text-gray-600" />
            </button>
            <button
              className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              title="Add location"
            >
              <MapPin className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setShowTagPopup(true)}
              title="Tag people"
              className="hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <Hash className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <button
            className="px-8 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
            onClick={handlePost}
          >
            Post
          </button>
        </div>

        {showTagPopup && <TagPopup onClose={() => setShowTagPopup(false)} />}
      </DialogContent>
    </Dialog>
  );
}
