"use client";

import { useState } from "react";
import { ContactPopup } from "./ContactPopup";
import { GroupCallPage } from "./GroupCall";
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

  const handleEndCall = () => {
    setShowGroupCall(false);
    setCallParticipants([]);
  };

  const handleAddParticipant = () => {
    setShowContactPopup(true);
  };

  return (
    <div className="flex h-screen">
      <div className="w-[480px] border-r bg-white">
        <CallList />
      </div>
      <div className="flex-1 flex items-center justify-center gap-8">
        <button
          onClick={() => setShowContactPopup(true)}
          className="h-19 w-19 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          aria-label="Start phone call"
        >
          <Phone className="h-5 w-5 text-white" />
        </button>

        <button
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
    </div>
  );
}