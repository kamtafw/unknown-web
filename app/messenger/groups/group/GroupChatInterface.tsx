"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageOptionsPopup } from "./MessageOptionsPopup";
import { ReplyView } from "./ReplyView";
import { ForwardPopup } from "./ForwardPopup";
import { DeleteMessagePopup } from "./DeleteMessagePopup";
import { MessageAnalyticsPopup } from "./MessageAnalyticsPopup";
import { PollViewPopup } from "./PollViewPopup";
import { AttachmentPopup } from "./AttachmentPopup";
import { CreatePollPopup } from "./CreatePollPopup";
import { MessagesTab } from "./MessagesTab";
import { TrendingTab } from "./TrendingTab";
import { SpamTab } from "./SpamTab";
import { FaMicrophone, FaRegSmile } from "react-icons/fa";
import { BsPaperclip } from "react-icons/bs";
import { GroupTranslationPopup } from "./GroupTranslationPopup";
import { EmojiPopup } from "@/components/ui/EmojiPicker";
import { Send } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
  avatar?: string;
  isYou?: boolean;
  replyTo?: string;
  type?: "text" | "image" | "poll" | "voice";
  images?: string[];
  pollData?: {
    question: string;
    options: { text: string; votes: number; voters: string[] }[];
    totalVotes: number;
  };
}

interface GroupChatInterfaceProps {
  activeTab: "messages" | "trending" | "spam";
  isAdmin?: boolean;
}

export function GroupChatInterface({
  activeTab,
  isAdmin = false,
}: GroupChatInterfaceProps) {
  const [showMessageOptions, setShowMessageOptions] = useState<{
    show: boolean;
    messageId: string;
    position: { x: number; y: number };
  }>({ show: false, messageId: "", position: { x: 0, y: 0 } });
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showForward, setShowForward] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<Message | null>(null);
  const [showPollView, setShowPollView] = useState<Message | null>(null);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [message, setMessage] = useState("");
  const [showTranslationPopup, setShowTranslationPopup] = useState(false);
  const [translationPopupPosition, setTranslationPopupPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: Message[] = [
    {
      id: "1",
      sender: "You",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      time: "10:30",
      isYou: true,
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
    },
    {
      id: "2",
      sender: "Devon Lane",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      time: "10:30",
      avatar: "/Rectangle 3.png",
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
    },
  ];

  const handleEmojiSelect = (emoji: string) => {
    const currentPosition = inputRef.current?.selectionStart || message.length;
    const newText =
      message.slice(0, currentPosition) +
      emoji +
      message.slice(currentPosition);
    setMessage(newText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          currentPosition + emoji.length,
          currentPosition + emoji.length
        );
      }
    }, 0);
  };

  const handleLanguageAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setShowMessageOptions({
      show: false,
      messageId: "",
      position: { x: 0, y: 0 },
    });
    setShowAttachment(false);
    setShowEmojiPopup(false);

    setTranslationPopupPosition({ x: e.clientX, y: e.clientY });
    setShowTranslationPopup(true);
  };

  const handleTranslate = (messageText: string, targetLanguage: string) => {
    console.log(`Translating "${messageText}" to ${targetLanguage}`);
    setShowTranslationPopup(false);
  };

  const handleMessageRightClick = (e: React.MouseEvent, messageId: string) => {
    setShowMessageOptions({
      show: true,
      messageId,
      position: { x: e.clientX, y: e.clientY },
    });
    setSelectedMessageId(messageId);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowMessageOptions({
      show: false,
      messageId: "",
      position: { x: 0, y: 0 },
    });
  };

  const handleForward = () => {
    setShowForward(true);
    setShowMessageOptions({
      show: false,
      messageId: "",
      position: { x: 0, y: 0 },
    });
  };

  const handleDelete = () => {
    setShowDelete(true);
    setShowMessageOptions({
      show: false,
      messageId: "",
      position: { x: 0, y: 0 },
    });
  };

  const handleViewAnalytics = (message: Message) => {
    console.log("Analytics clicked for message:", message);
    setShowAnalytics(message);
    setShowMessageOptions({
      show: false,
      messageId: "",
      position: { x: 0, y: 0 },
    });
  };

  const handleViewPoll = (message: Message) => {
    setShowPollView(message);
  };

  const handleAttachmentSelect = (type: string) => {
    setShowAttachment(false);
    if (type === "poll") {
      setShowCreatePoll(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && message.trim()) {
      handleSendMessage();
    }
  };

  const getMessageById = (id: string): Message | undefined => {
    return messages.find((m) => m.id === id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        showEmojiPopup &&
        !target.closest("[data-radix-popper-content-wrapper]") &&
        !target.closest('button[aria-label="Emoji picker"]')
      ) {
        setShowEmojiPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPopup]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
      setReplyingTo(null);
      setShowEmojiPopup(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "messages":
        return (
          <MessagesTab
            onMessageRightClick={handleMessageRightClick}
            onViewPoll={handleViewPoll}
          />
        );
      case "trending":
        return <TrendingTab onViewAnalytics={handleViewAnalytics} />;
      case "spam":
        return isAdmin ? (
          <SpamTab onViewAnalytics={handleViewAnalytics} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Access denied</p>
            <p className="text-sm">Admin privileges required</p>
          </div>
        );
      default:
        return (
          <MessagesTab
            onMessageRightClick={handleMessageRightClick}
            onViewPoll={handleViewPoll}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {renderTabContent()}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply View */}
      {replyingTo && (
        <ReplyView message={replyingTo} onClose={() => setReplyingTo(null)} />
      )}

      {/* Bottom Input - Hide for spam tab or show admin controls */}
      {activeTab !== "spam" && (
        <div className="p-4 bg-white border-t relative">
          <div className="flex items-center gap-2">
            <Popover open={showEmojiPopup}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowEmojiPopup(!showEmojiPopup)}
                >
                  <FaRegSmile className="!h-6 !w-6 text-black" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-lg ml-180 mb-4">
                <EmojiPopup
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPopup(false)}
                />
              </PopoverContent>
            </Popover>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachment(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <BsPaperclip className="!h-6 !w-6 text-black" />
              </Button>
              <AttachmentPopup
                isOpen={showAttachment}
                onClose={() => setShowAttachment(false)}
                onSelect={handleAttachmentSelect}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleLanguageAIClick}
            >
              <Image
                src="/languageai.png"
                alt="Language AI"
                width={20}
                height={20}
              />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message here"
                className="flex-1 rounded-full border-none pr-12"
                onKeyPress={handleKeyPress}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {message.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaMicrophone className="!h-6 !w-6 text-blue-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      <MessageOptionsPopup
        isOpen={showMessageOptions.show}
        position={showMessageOptions.position}
        onClose={() =>
          setShowMessageOptions({
            show: false,
            messageId: "",
            position: { x: 0, y: 0 },
          })
        }
        onReply={() => {
          const msg = getMessageById(selectedMessageId);
          if (msg) handleReply(msg);
        }}
        onForward={handleForward}
        onPin={() => {}}
        onDelete={handleDelete}
        onViewAnalytics={() => {
          const msg = getMessageById(selectedMessageId);
          if (msg) handleViewAnalytics(msg);
        }}
      />

      <ForwardPopup
        isOpen={showForward}
        onClose={() => setShowForward(false)}
      />

      <DeleteMessagePopup
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
      />

      {showAnalytics && (
        <MessageAnalyticsPopup
          message={showAnalytics}
          onClose={() => setShowAnalytics(null)}
        />
      )}

      {showPollView && (
        <PollViewPopup
          message={showPollView}
          onClose={() => setShowPollView(null)}
        />
      )}

      <CreatePollPopup
        isOpen={showCreatePoll}
        onClose={() => setShowCreatePoll(false)}
      />

      <GroupTranslationPopup
        isOpen={showTranslationPopup}
        position={translationPopupPosition}
        onClose={() => setShowTranslationPopup(false)}
        messageText={message}
        onTranslate={handleTranslate}
      />
    </div>
  );
}
