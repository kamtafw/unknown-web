"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, Video, Search, Send, Mic, CheckCheck } from "lucide-react";
import { BsPaperclip, BsThreeDotsVertical } from "react-icons/bs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaMicrophone, FaPlay } from "react-icons/fa6";
import { FaRegSmile } from "react-icons/fa";
import { SearchPopup } from "./SearchPopup";
import { CalendarPopup } from "./CalendarPopup";
import { MessageContextMenu } from "./MessageContextMenu";
import { SentMessageContextMenu } from "./SentMessageContextMenu";
import { DeleteMessagePopup } from "./DeleteMessagePopup";
import { ReplyMessageBox } from "./ReplyMessageBox";
import { ForwardMessagePopup } from "./ForwardMessagePopup";
import { ChatInterfaceContextMenu } from "./ChatInterfaceContextMenu";
import { TranslationPopup } from "./TranslationPopup";
import { ChatAttachmentPopup } from "./ChatAttachmentPopup";
import { EmojiPopup } from "@/components/ui/EmojiPicker";
import { VoiceCallPopup } from "../calls/VoiceCallPopup";
import { VideoCallPopup } from "../calls/VideoCallPopup";
import ReadPostPopup from "../../(social)/home/main-popup/ReadPostPopup";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface ChatInterfaceProps {
  chatName: string;
  chatAvatar: string;
  onBack?: () => void;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  isImage?: boolean;
  imageSrc?: string;
  isVoice?: boolean;
  voiceDuration?: string;
  isReply?: boolean;
  replyTo?: string;
  showAvatar?: boolean;
}

const sampleMessages: Message[] = [
  {
    id: "1",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "2:30 PM",
    isSent: false,
    showAvatar: true,
  },
  {
    id: "2",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: "2:31 PM",
    isSent: true,
  },
  {
    id: "3",
    text: " sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "2:32 PM",
    isSent: false,
    isReply: true,
    replyTo:
      "Cocumber ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    showAvatar: true,
  },
  {
    id: "4",
    text: " consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: "2:33 PM",
    isSent: true,
    isReply: true,
    replyTo:
      "Cocumber ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "5",
    isVoice: true,
    voiceDuration: "0:25",
    text: "",
    time: "2:34 PM",
    isSent: false,
    showAvatar: true,
  },
  {
    id: "6",
    isVoice: true,
    voiceDuration: "0:18",
    text: "",
    time: "2:35 PM",
    isSent: true,
  },
  {
    id: "7",
    isImage: true,
    imageSrc: "/map.png",
    text: "",
    time: "2:36 PM",
    isSent: false,
    showAvatar: true,
  },
  {
    id: "8",
    isImage: true,
    imageSrc: "/map.png",
    text: "",
    time: "2:37 PM",
    isSent: true,
  },
];

export function ChatInterface({ chatName, chatAvatar }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages] = useState<Message[]>(sampleMessages);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [showMessageContextMenu, setShowMessageContextMenu] = useState(false);
  const [showSentMessageContextMenu, setShowSentMessageContextMenu] =
    useState(false);
  const [showDeleteMessagePopup, setShowDeleteMessagePopup] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState("");
  const [replyToSender, setReplyToSender] = useState("");
  const [showForwardPopup, setShowForwardPopup] = useState(false);
  const [messageToForward, setMessageToForward] = useState("");
  const [showChatContextMenu, setShowChatContextMenu] = useState(false);
  const [chatContextMenuPosition, setChatContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showTranslationPopup, setShowTranslationPopup] = useState(false);
  const [translationPopupPosition, setTranslationPopupPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showReadPostPopup, setShowReadPostPopup] = useState(false);

  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const currentPosition =
      textareaRef.current?.selectionStart || message.length;
    const newText =
      message.slice(0, currentPosition) +
      emoji +
      message.slice(currentPosition);
    setMessage(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          currentPosition + emoji.length,
          currentPosition + emoji.length
        );
      }
    }, 0);
  };

  const handleMessageRightClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    setSelectedMessage(msg);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });

    if (msg.isSent) {
      setShowSentMessageContextMenu(true);
      setShowMessageContextMenu(false);
    } else {
      setShowMessageContextMenu(true);
      setShowSentMessageContextMenu(false);
    }

    setShowSearchPopup(false);
    setShowCalendarPopup(false);
    setShowDeleteMessagePopup(false);
    setShowChatContextMenu(false);
    setShowTranslationPopup(false);
    setShowAttachmentPopup(false);
    setShowEmojiPopup(false);
  };

  const handleReadAloud = () => {
    setShowReadPostPopup(true);
    setShowMessageContextMenu(false);
    setShowSentMessageContextMenu(false);
  };

  const handleReply = (messageText: string) => {
    setReplyToMessage(messageText);
    setReplyToSender(selectedMessage?.isSent ? "You" : chatName);
    setShowReplyBox(true);
    setShowMessageContextMenu(false);
    setShowSentMessageContextMenu(false);
  };

  const handleForward = (messageText: string) => {
    setMessageToForward(messageText);
    setShowForwardPopup(true);
    setShowMessageContextMenu(false);
    setShowSentMessageContextMenu(false);
  };

  const handleDeleteMessage = () => {
    setShowDeleteMessagePopup(true);
    setShowSentMessageContextMenu(false);
  };

  const handleDeleteForEveryone = () => {
    console.log("Delete for everyone:", selectedMessage?.text);
  };

  const handleDeleteForMe = () => {
    console.log("Delete for me:", selectedMessage?.text);
  };

  const handleThreeDotsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setShowSearchPopup(false);
    setShowCalendarPopup(false);
    setShowMessageContextMenu(false);
    setShowSentMessageContextMenu(false);
    setShowDeleteMessagePopup(false);
    setShowForwardPopup(false);
    setShowTranslationPopup(false);
    setShowAttachmentPopup(false);
    setShowEmojiPopup(false);

    setChatContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowChatContextMenu(true);
  };

  const handleLanguageAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllPopups();

    setTranslationPopupPosition({ x: e.clientX, y: e.clientY });
    setShowTranslationPopup(true);
  };

  const handleTranslate = (messageText: string, targetLanguage: string) => {
    console.log(`Translating "${messageText}" to ${targetLanguage}`);
    setShowTranslationPopup(false);
  };

  const handleArchiveChat = () => {
    console.log("Archiving chat:", chatName);
  };

  const handleAddToFavorites = () => {
    console.log("Adding to favorites:", chatName);
  };

  const handleAttachmentSelect = (type: string) => {
    setShowAttachmentPopup(false);
    console.log("Selected attachment type:", type);
  };

  const handleStartVoiceCall = () => {
    console.log("Starting voice call with:", chatName);
    closeAllPopups();
    setShowVoiceCall(true);
  };

  const handleStartVideoCall = () => {
    console.log("Starting video call with:", chatName);
    closeAllPopups();
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    console.log("Ending call");
    setShowVoiceCall(false);
    setShowVideoCall(false);
  };

  const handleCallTypeChange = (newType: "video" | "audio") => {
    console.log("Switching call type to:", newType);

    if (newType === "video") {
      setShowVoiceCall(false);
      setShowVideoCall(true);
    } else {
      setShowVideoCall(false);
      setShowVoiceCall(true);
    }
  };

  const closeAllPopups = () => {
    setShowSearchPopup(false);
    setShowCalendarPopup(false);
    setShowMessageContextMenu(false);
    setShowSentMessageContextMenu(false);
    setShowDeleteMessagePopup(false);
    setShowForwardPopup(false);
    setShowChatContextMenu(false);
    setShowTranslationPopup(false);
    setShowAttachmentPopup(false);
    setShowEmojiPopup(false);
    setShowReadPostPopup(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      setShowEmojiPopup(false);
    }
  };

  const contactInfo = {
    name: chatName,
    avatar: chatAvatar,
    phone: "+234 8123456789",
  };

  return (
    <div className="flex flex-col h-full bg-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={chatAvatar}
                alt={chatName}
                width={30}
                height={30}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[12px]">{chatName}</h3>
              <p className="text-sm text-gray-500">Business Account</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleStartVoiceCall}
            >
              <Phone className="h-5 w-5 text-black" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleStartVideoCall}
            >
              <Video className="h-5 w-5 text-black" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setShowSearchPopup(true)}
            >
              <Search className="h-5 w-5 text-black" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleThreeDotsClick}
            >
              <BsThreeDotsVertical className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </div>

      {/* All Popups */}
      <SearchPopup
        isOpen={showSearchPopup}
        onClose={() => setShowSearchPopup(false)}
        onOpenCalendar={() => {
          setShowSearchPopup(false);
          setShowCalendarPopup(true);
        }}
      />

      <CalendarPopup
        isOpen={showCalendarPopup}
        onClose={() => setShowCalendarPopup(false)}
      />

      <MessageContextMenu
        isOpen={showMessageContextMenu}
        position={contextMenuPosition}
        onClose={() => setShowMessageContextMenu(false)}
        messageText={selectedMessage?.text || ""}
        onReply={handleReply}
        onForward={handleForward}
        onReadAloud={handleReadAloud}
      />

      <SentMessageContextMenu
        isOpen={showSentMessageContextMenu}
        position={contextMenuPosition}
        onClose={() => setShowSentMessageContextMenu(false)}
        messageText={selectedMessage?.text || ""}
        onReply={handleReply}
        onForward={handleForward}
        onDeleteMessage={handleDeleteMessage}
      />

      <ChatInterfaceContextMenu
        isOpen={showChatContextMenu}
        position={chatContextMenuPosition}
        onClose={() => setShowChatContextMenu(false)}
        chatId={chatName}
        chatName={chatName}
        onArchiveChat={handleArchiveChat}
        onAddToFavorites={handleAddToFavorites}
        chatAvatar={chatAvatar}
        accountType="business"
      />

      <DeleteMessagePopup
        isOpen={showDeleteMessagePopup}
        onClose={() => setShowDeleteMessagePopup(false)}
        onDeleteForEveryone={handleDeleteForEveryone}
        onDeleteForMe={handleDeleteForMe}
      />

      <ForwardMessagePopup
        isOpen={showForwardPopup}
        onClose={() => setShowForwardPopup(false)}
        messageToForward={messageToForward}
      />

      <TranslationPopup
        isOpen={showTranslationPopup}
        position={translationPopupPosition}
        onClose={() => setShowTranslationPopup(false)}
        messageText={message}
        onTranslate={handleTranslate}
      />

      {/* Call Popups */}
      <VoiceCallPopup
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        onEndCall={handleEndCall}
        contact={contactInfo}
        onCallTypeChange={handleCallTypeChange}
      />

      <VideoCallPopup
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        onEndCall={handleEndCall}
        contact={contactInfo}
        onCallTypeChange={handleCallTypeChange}
      />
      {showReadPostPopup && (
        <ReadPostPopup
          onClose={() => setShowReadPostPopup(false)}
          postContent={selectedMessage?.text || ""}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-end gap-2 max-w-[70%]">
              <div>
                <div
                  className={`rounded-2xl px-4 py-2 cursor-pointer ${
                    msg.isSent
                      ? "bg-gray-300 text-black rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                  }`}
                  onContextMenu={(e) => handleMessageRightClick(e, msg)}
                >
                  {msg.isReply && (
                    <div className="mb-2">
                      <div className="border-l-4 border-blue-500 pl-3 py-2 rounded-r-lg bg-gray-100">
                        <p className="text-xs font-medium text-blue-600 mb-1">
                          {msg.isSent ? chatName : "You"}
                        </p>
                        <p className="text-xs text-gray-600">{msg.replyTo}</p>
                      </div>
                    </div>
                  )}
                  {msg.isVoice ? (
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <button
                        className={`p-2 rounded-full ${
                          msg.isSent ? "bg-white/20" : ""
                        }`}
                        aria-label="Play voice message"
                      >
                        <FaPlay
                          className={`h-4 w-4 ${
                            msg.isSent ? "text-black" : "text-black"
                          }`}
                        />
                      </button>
                      <div className="flex-1">
                        <div
                          className={`flex items-center gap-1 ${
                            msg.isSent ? "text-white/80" : "text-gray-400"
                          }`}
                        >
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${
                                msg.isSent ? "bg-blue-300" : "bg-black/20"
                              }`}
                              style={{
                                height: `${Math.random() * 20 + 8}px`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <span
                        className={`text-xs ${
                          msg.isSent ? "text-black" : "text-gray-500"
                        } mr-2`}
                      >
                        {msg.voiceDuration}
                      </span>
                      <div className="relative">
                        <Image
                          src={msg.isSent ? "/Rectangle 3.png" : chatAvatar}
                          alt={msg.isSent ? "You" : chatName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Mic className="h-2 w-2 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : msg.isImage ? (
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={msg.imageSrc!}
                        alt="Shared image"
                        width={300}
                        height={200}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 mt-1 ${
                    msg.isSent ? "justify-end" : "justify-start"
                  }`}
                >
                  <p className="text-xs text-gray-500">{msg.time}</p>
                  {msg.isSent && (
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200">
        {/* Reply Box */}
        <ReplyMessageBox
          isVisible={showReplyBox}
          replyToMessage={replyToMessage}
          senderName={replyToSender}
          onClose={() => setShowReplyBox(false)}
        />

        <div className="p-2">
          <div className="flex items-center gap-2">
            <Popover open={showEmojiPopup}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2"
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
                className="p-1"
                onClick={() => setShowAttachmentPopup(true)}
              >
                <BsPaperclip className="!h-10 !w-6 text-black" />
              </Button>
              <ChatAttachmentPopup
                isOpen={showAttachmentPopup}
                onClose={() => setShowAttachmentPopup(false)}
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
                className="object-contain"
              />
            </Button>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message here..."
                className="w-full resize-none border border-white/90 rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] max-h-[120px]"
                rows={1}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {message.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" className="p-2">
                    <FaMicrophone className="!h-7 !w-7 text-blue-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
