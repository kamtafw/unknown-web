"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  CheckCheck,
  BellOff,
  Plus,
  Heart,
  UserX,
  Archive,
  Trash2,
} from "lucide-react";
import { AddToListPopup } from "./AddToListPopup";
import { CreateListPopup } from "./CreateListPopup";
import { MuteNotificationPopup } from "./MuteNotificationPopup";
import { BlockContactPopup } from "./BlockContactPopup";
import { ClearChatPopup } from "./ClearChatPopup";

interface ChatContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  chatId: string;
  chatName: string;
  onArchiveChat: () => void;
  onAddToFavorites: () => void;
}

export function ChatContextMenu({
  isOpen,
  position,
  onClose,
  chatId,
  chatName,
  onArchiveChat,
  onAddToFavorites,
}: ChatContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

 
  const [showAddToList, setShowAddToList] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showMuteNotification, setShowMuteNotification] = useState(false);
  const [showBlockContact, setShowBlockContact] = useState(false);
  const [showClearChat, setShowClearChat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";

      const menuHeight = 320;
      const viewportHeight = window.innerHeight;
      const shouldShowAbove = position.y + menuHeight > viewportHeight;

      setAdjustedPosition({
        x: position.x,
        y: shouldShowAbove ? position.y - menuHeight : position.y,
      });
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;


      if (
        showAddToList ||
        showCreateList ||
        showMuteNotification ||
        showBlockContact ||
        showClearChat
      ) {
        return;
      }


      if (target.closest("[data-context-menu]")) {
        return;
      }

      if (isOpen) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {

        if (
          showAddToList ||
          showCreateList ||
          showMuteNotification ||
          showBlockContact ||
          showClearChat
        ) {
          setShowAddToList(false);
          setShowCreateList(false);
          setShowMuteNotification(false);
          setShowBlockContact(false);
          setShowClearChat(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {

      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside, true);
        document.addEventListener("keydown", handleEscape);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside, true);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [
    isOpen,
    onClose,
    showAddToList,
    showCreateList,
    showMuteNotification,
    showBlockContact,
    showClearChat,
  ]);

  const menuItems = [
    {
      id: "view-contact",
      label: "View Contact",
      icon: <User className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("View contact:", chatName, chatId);
        onClose();
      },
    },
    {
      id: "media-links-docs",
      label: "Media, Links & Docs",
      icon: <FileText className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Media, Links & Docs for:", chatName, chatId);
        onClose();
      },
    },
    {
      id: "mark-as-read",
      label: "Mark as read",
      icon: <CheckCheck className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Mark as read:", chatName, chatId);
        onClose();
      },
    },
    {
      id: "mute-notification",
      label: "Mute Notification",
      icon: <BellOff className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
 
        setTimeout(() => {
          setShowMuteNotification(true);
        }, 0);
      },
    },
    {
      id: "add-to-list",
      label: "Add to List",
      icon: <Plus className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowAddToList(true);
      },
    },
    {
      id: "add-to-favorites",
      label: "Add to favorites",
      icon: <Heart className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToFavorites();
        onClose();
      },
    },
    {
      id: "block-contact",
      label: "Block Contact",
      icon: <UserX className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
  
        setTimeout(() => {
          setShowBlockContact(true);
        }, 0);
      },
      destructive: true,
    },
    {
      id: "archive-chat",
      label: "Archive Chat",
      icon: <Archive className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onArchiveChat();
        onClose();
      },
    },
    {
      id: "clear-chat",
      label: "Clear Chat",
      icon: <Trash2 className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowClearChat(true);
      },
      destructive: true,
    },
  ];

  const handleItemClick = (action: (e: React.MouseEvent) => void) => {
    return (e: React.MouseEvent) => {
      action(e);
    };
  };

  const handleCreateNewList = () => {
    setShowAddToList(false);
    setShowCreateList(true);
  };

  const handleCreateListDone = () => {
    setShowCreateList(false);
    onAddToFavorites(); 
    onClose();
  };

  const handleMuteSave = (duration: string) => {
    console.log("Muting chat for:", duration);
    setShowMuteNotification(false);
    onClose(); 
  };

  const handleMuteClose = () => {
    setShowMuteNotification(false);
 
  };

  const handleBlock = (reason: string, feedback: string) => {
    console.log(
      "Blocking contact:",
      chatName,
      "Reason:",
      reason,
      "Feedback:",
      feedback
    );
    setShowBlockContact(false);
    onClose(); 
  };

  const handleBlockClose = () => {
    setShowBlockContact(false);
    
  };

  const handleClearChat = (deleteMedia: boolean) => {
    console.log("Clearing chat:", chatName, "Delete media:", deleteMedia);
    setShowClearChat(false);
    onClose(); 
  };

  const handleClearChatClose = () => {
    setShowClearChat(false);
    
  };

  const handleAddToListClose = () => {
    setShowAddToList(false);
 
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - only show if no popups are open */}
      {!showAddToList &&
        !showCreateList &&
        !showMuteNotification &&
        !showBlockContact &&
        !showClearChat && (
          <div className="fixed inset-0 z-40" onClick={onClose} />
        )}

      {/* Context Menu */}
      <div
        data-context-menu
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none ${
                item.destructive
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                  : "text-gray-700"
              }`}
              onClick={handleItemClick(item.action)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
            </Button>
          </div>
        ))}
      </div>

      {/* Popups */}
      <AddToListPopup
        isOpen={showAddToList}
        onClose={handleAddToListClose}
        onCreateNewList={handleCreateNewList}
        onAddToFavorites={onAddToFavorites}
      />

      <CreateListPopup
        isOpen={showCreateList}
        onClose={() => setShowCreateList(false)}
        onDone={handleCreateListDone}
      />

      <MuteNotificationPopup
        isOpen={showMuteNotification}
        onClose={handleMuteClose}
        onSave={handleMuteSave}
      />

      <BlockContactPopup
        isOpen={showBlockContact}
        onClose={handleBlockClose}
        onBlock={handleBlock}
        chatName={chatName}
      />

      <ClearChatPopup
        isOpen={showClearChat}
        onClose={handleClearChatClose}
        onClearChat={handleClearChat}
      />
    </>
  );
}
