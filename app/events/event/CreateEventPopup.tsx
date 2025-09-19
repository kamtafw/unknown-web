"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Trash2,
  MapPin,
  Target,
  Calendar,
  Clock,
  ChevronDown,
  Info,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import Image from "next/image";
import "@/app/global.css";

interface CreateEventPopupProps {
  onClose: () => void;
}

interface Link {
  id: number;
  url: string;
  title: string;
}

interface Doc {
  id: number;
  url: string;
  title: string;
}

export default function CreateEventPopup({ onClose }: CreateEventPopupProps) {
  const [location, setLocation] = useState("23 Okiko, Amuwo, Lagos, Ni...");
  const [eventName, setEventName] = useState("");
  const [eventPasscode, setEventPasscode] = useState("0000");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("08:00");
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(
    "/Events.svg"
  );
  const [links, setLinks] = useState<Link[]>([
    {
      id: 1,
      url: "https://www.behance.net/stanley...",
      title: "Buy sales here",
    },
  ]);
  const [docs, setDocs] = useState<Doc[]>([
    {
      id: 1,
      url: "https://www.example.com/document.pdf",
      title: "Sample Document",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setThumbnailImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file");
      }
    }
  };

  const handleDeleteImage = () => {
    setThumbnailImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const addNewLink = () => {
    const newLink: Link = {
      id: Date.now(),
      url: "",
      title: "",
    };
    setLinks([...links, newLink]);
  };

  const deleteLink = (id: number) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const updateLinkUrl = (id: number, url: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, url } : link)));
  };

  const updateLinkTitle = (id: number, title: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, title } : link)));
  };

  const addNewDoc = () => {
    const newDoc: Doc = {
      id: Date.now(),
      url: "",
      title: "",
    };
    setDocs([...docs, newDoc]);
  };

  const deleteDoc = (id: number) => {
    setDocs(docs.filter((doc) => doc.id !== id));
  };

  const updateDocUrl = (id: number, url: string) => {
    setDocs(docs.map((doc) => (doc.id === id ? { ...doc, url } : doc)));
  };

  const updateDocTitle = (id: number, title: string) => {
    setDocs(docs.map((doc) => (doc.id === id ? { ...doc, title } : doc)));
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center scrollbar-hide">
      <div className="bg-white w-full max-w-md mx-4 rounded-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Create event
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Add thumbnail section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Add thumbnail
            </h2>
            <div className="relative">
              {thumbnailImage ? (
                <div className="relative h-48 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-400 rounded-lg overflow-hidden">
                  <Image
                    src={thumbnailImage}
                    alt="Event thumbnail"
                    fill
                    className="object-cover"
                  />
                  {/* Concert crowd silhouette overlay - only show for default image */}
                  {thumbnailImage === "/Events.svg" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                      <div className="absolute bottom-4 w-full flex justify-center items-end">
                        <div className="w-6 h-10 bg-black/60 rounded-t-full mx-1"></div>
                        <div className="w-4 h-8 bg-black/60 rounded-t-full mx-1"></div>
                        <div className="w-8 h-12 bg-black/60 rounded-t-full mx-1"></div>
                        <div className="w-5 h-9 bg-black/60 rounded-t-full mx-1"></div>
                        <div className="w-6 h-10 bg-black/60 rounded-t-full mx-1"></div>
                      </div>
                    </div>
                  )}

                  {/* Trash icon */}
                  <button
                    onClick={handleDeleteImage}
                    className="absolute top-3 right-3 w-10 h-10 bg-black/20 bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                    title="Remove thumbnail"
                    aria-label="Remove thumbnail"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                // Upload area when no image
                <div
                  onClick={handleUploadClick}
                  className="relative h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium mb-1">
                    Click to upload image
                  </p>
                  <p className="text-gray-400 text-sm">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                placeholder="Enter event location"
                title="Event location"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Upload button when image exists */}
              {thumbnailImage && (
                <button
                  onClick={handleUploadClick}
                  className="absolute bottom-3 left-3 px-3 py-2 bg-white/90 rounded-lg text-gray-700 font-medium text-sm hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Change Image
                </button>
              )}
            </div>
          </div>

          {/* Event's location section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Event&#39;s location
            </h2>
            <div className="relative">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 font-medium outline-none"
                  placeholder="Enter event location"
                  title="Event location"
                />
                <button
                  className="p-1 hover:bg-gray-200 rounded-full"
                  aria-label="Get current location"
                  title="Get current location"
                >
                  <Target className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Event Name section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Event Name
            </h2>
            <div className="relative">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-lg border-2 border-blue-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                placeholder="Enter name"
                maxLength={200}
                title="Event name"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                {eventName.length}/200
              </div>
            </div>
          </div>

          {/* Event passcode section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Event passcode
            </h2>
            <div className="relative">
              <input
                type="text"
                value={eventPasscode}
                onChange={(e) => setEventPasscode(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-lg border-2 border-blue-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                placeholder="0000"
                maxLength={4}
                title="Event passcode"
              />
            </div>
          </div>

          {/* Durations section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Durations
            </h2>

            {/* Start Date and Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-50 rounded-full border border-gray-200 text-gray-600 outline-none focus:border-blue-400 transition-colors appearance-none"
                    title="Start date"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-50 rounded-full border border-gray-200 text-gray-600 outline-none focus:border-blue-400 transition-colors appearance-none"
                    title="Start time"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>

            {/* End Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-50 rounded-full border border-gray-200 text-gray-600 outline-none focus:border-blue-400 transition-colors appearance-none"
                    title="End date"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-50 rounded-full border border-gray-200 text-gray-600 outline-none focus:border-blue-400 transition-colors appearance-none"
                    title="End time"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Links & Docs section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Links & Docs
            </h2>

            {/* Event Name field */}
            <div className="mb-6">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Event Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full p-4 bg-gray-50 rounded-lg border-2 border-blue-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                  maxLength={200}
                  title="Event name for link"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                  1/200
                </div>
              </div>
            </div>

            {/* Add another link */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Add another link
              </h3>
            </div>
          </div>

          {/* Links section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Links</h2>
              <Info className="w-5 h-5 text-gray-400" />
            </div>

            {/* Dynamic Links */}
            {links.map((link: Link, index: number) => (
              <div key={link.id} className="mb-6">
                {/* Link URL */}
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Link {index + 1}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLinkUrl(link.id, e.target.value)}
                      className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                      placeholder="https://www.example.com"
                      title={`Link ${index + 1} URL`}
                    />
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      title="Delete link"
                      aria-label="Delete link"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLinkTitle(link.id, e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                    placeholder="Enter title"
                    title={`Link ${index + 1} title`}
                  />
                </div>
              </div>
            ))}

            {/* Add another Link button */}
            <button
              onClick={addNewLink}
              className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-white rounded-full border-2 border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="italic">Add another Link</span>
            </button>
          </div>

          {/* Docs section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Docs</h2>
              <Info className="w-5 h-5 text-gray-400" />
            </div>

            {/* Dynamic Docs */}
            {docs.map((doc: Doc, index: number) => (
              <div key={doc.id} className="mb-6">
                {/* Doc URL */}
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Docs {index + 1}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="url"
                        value={doc.url}
                        onChange={(e) => updateDocUrl(doc.id, e.target.value)}
                        className="w-full p-4 pr-12 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                        placeholder="https://www.example.com"
                        title={`Doc ${index + 1} URL`}
                      />
                      <Download className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                    </div>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      title="Delete doc"
                      aria-label="Delete doc"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => updateDocTitle(doc.id, e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-medium outline-none focus:border-blue-400 transition-colors"
                    placeholder="Enter title"
                    title={`Doc ${index + 1} title`}
                  />
                </div>
              </div>
            ))}

            {/* Add another Doc button */}
            <button
              onClick={addNewDoc}
              className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-white rounded-full border-2 border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="italic">Add another Doc</span>
            </button>
          </div>
    
          {/* Create Event Button */}
          <div className="sticky bottom-0 bg-white p-4 border-t">
            <button
              onClick={onClose}
              className="w-full py-4 bg-[#6A88D1] text-white font-semibold rounded-full hover:bg-[#6A88D1]/80 transition-colors"
            >
              Create event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
