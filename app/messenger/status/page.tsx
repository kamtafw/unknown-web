"use client";

import { useState } from "react";
import { StatusList } from "./StatusList";
import { MyStatus } from "./MyStatus";
import { ContactStatus } from "./ContactStatus";
import EditStory from "./EditStory";
import Image from "next/image";

interface StatusStory {
  id: string;
  image: string;
  text: string;
  emoji: string;
}

interface Status {
  id: string;
  name: string;
  avatar: string;
  time: string;
  date: string;
  count?: number;
  viewed?: boolean;
  stories: StatusStory[];
}

export default function Home() {
  const [showMyStatus, setShowMyStatus] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Status | null>(null);
  const [showEditStory, setShowEditStory] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>(
    undefined
  );

  const handleMyStatusClick = () => {
    setShowMyStatus(true);
    setSelectedContact(null);
  };

  const handleContactStatusClick = (contact: Status) => {
    setSelectedContact(contact);
    setShowMyStatus(false);
  };

  const handleBackToList = () => {
    setShowMyStatus(false);
    setSelectedContact(null);
  };

  const handleEditStoryOpen = (imageFile?: File) => {
    setSelectedImageFile(imageFile);
    setShowEditStory(true);
  };

  const handleEditStoryClose = () => {
    setShowEditStory(false);
    setSelectedImageFile(undefined);
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Status List */}
      <div
        className={`w-full lg:w-[480px] border-r bg-white overflow-y-auto ${
          showMyStatus || selectedContact ? "hidden lg:block" : "block"
        }`}
      >
        <StatusList
          onMyStatusClick={handleMyStatusClick}
          onContactStatusClick={handleContactStatusClick}
          onEditStoryClick={handleEditStoryOpen}
        />
      </div>

      {/* Right Main Content */}
      {showMyStatus ? (
        <MyStatus onBack={handleBackToList} />
      ) : selectedContact ? (
        <ContactStatus
          contact={{
            id: selectedContact.id,
            name: selectedContact.name,
            avatar: selectedContact.avatar,
            time: selectedContact.time,
            date: selectedContact.date,
          }}
          stories={selectedContact.stories}
          onClose={handleBackToList}
          onBack={handleBackToList}
        />
      ) : (
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center">
          <Image
            src="/appcombo.svg"
            alt="Logo"
            width={50}
            height={50}
            className="mb-4 object-contain"
          />
          <p className="text-lg text-gray-600">
            Send and receive messages with your laptop
          </p>
        </div>
      )}

      {/* Edit Story Popup - Rendered at page level */}
      <EditStory
        isOpen={showEditStory}
        onClose={handleEditStoryClose}
        imageFile={selectedImageFile}
      />
    </div>
  );
}
