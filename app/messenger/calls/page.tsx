"use client";

import { useState } from "react";
import { ContactPopup } from "./ContactPopup";
import { GroupCallPage } from "./GroupCall";
import { VideoCall } from "./VideoCall";
import { Phone, Video } from "lucide-react";
import { CallList } from "./CallList";

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
}

interface Participant {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking?: boolean;
}

export default function Home() {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showGroupCall, setShowGroupCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callParticipants, setCallParticipants] = useState<Participant[]>([]);

  const handleStartCall = (selectedContacts: Contact[]) => {
    const participants: Participant[] = selectedContacts.map(contact => ({
      ...contact,
      isMuted: Math.random() > 0.5, 
      isSpeaking: false,
    }));
    

    const allParticipants: Participant[] = [
      {
        id: -1,
        name: "Me",
        phone: "",
        avatar: "/Rectangle 1.png",
        isMuted: true,
        isSpeaking: false,
      },
      ...participants
    ];
    
    setCallParticipants(allParticipants);
    setShowGroupCall(true);
    setShowContactPopup(false);
  };

  const handleStartVideoCall = () => {
    setCallParticipants([]);
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    setShowGroupCall(false);
    setCallParticipants([]);
  };

  const handleEndVideoCall = () => {
    setShowVideoCall(false);
    setCallParticipants([]);
  };

  const handleAddParticipant = () => {
    setShowContactPopup(true);
  };

  return (
    <div className="flex">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block w-[480px] border-r bg-white">
        <CallList />
      </div>

      {/* Mobile Full Width Call List - Visible only on mobile */}
      <div className="block lg:hidden w-full relative">
        <CallList />
        
        {/* Mobile Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
          {/* Video Call Button */}
          <button
            onClick={handleStartVideoCall}
            className="h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            aria-label="Start video call"
          >
            <Video className="h-6 w-6 text-white" />
          </button>

          {/* Phone Call Button */}
          <button
            onClick={() => setShowContactPopup(true)}
            className="h-14 w-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600  shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            aria-label="Start phone call"
          >
            <Phone className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Desktop Main Content Area - Hidden on mobile */}
      <div className="hidden lg:flex ml-35  items-center justify-center gap-8 flex-1">
        <button
          onClick={() => setShowContactPopup(true)}
          className="h-19 w-19 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          aria-label="Start phone call"
        >
          <Phone className="h-5 w-5 text-white" />
        </button>

        <button
          onClick={handleStartVideoCall}
          className="h-19 w-19 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
         aria-label="Start video call"
        >
          <Video className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Contact Selection Popup */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onStartCall={handleStartCall}
      />

      {/* Group Call Popup */}
      <GroupCallPage
        isOpen={showGroupCall}
        onClose={() => setShowGroupCall(false)}
        onEndCall={handleEndCall}
        participants={callParticipants}
        onAddParticipant={handleAddParticipant}
      />

      {/* Video Call Popup */}
      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        onEndCall={handleEndVideoCall}
        participants={callParticipants}
        onAddParticipant={handleAddParticipant}
      />
    </div>
  );
}