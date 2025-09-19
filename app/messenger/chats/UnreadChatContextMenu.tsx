"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  BellOff,
  Plus,
  UserX,
  Archive,
  Trash2,
} from "lucide-react";
import { AddToListPopup } from "./AddToListPopup";
import { CreateListPopup } from "./CreateListPopup";
import { MuteNotificationPopup } from "./MuteNotificationPopup";
import { BlockContactPopup } from "./BlockContactPopup";
import { ClearChatPopup } from "./ClearChatPopup";
import { ViewContactPopup } from "./ViewContactPopup";
import MediaGalleryPopup from "./MediaGalleryPopup";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isSelected: boolean;
}

interface UnreadChatContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  chatId: string;
  chatName: string;
  chatAvatar?: string;
  accountType?: 'business' | 'personal';
  onArchiveChat?: () => void;
  onAddToFavorites?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  onShare?: () => void;
  onContactUpdated?: (
    firstName: string,
    lastName: string,
    phoneNumber: string
  ) => void;
  onContactShared?: (selectedContacts: Contact[]) => void;
}

export function UnreadChatContextMenu({
  isOpen,
  position,
  onClose,
//   chatId,
  chatName,
  chatAvatar = "/default-avatar.jpg",
  accountType = 'business',
  onArchiveChat,
  onAddToFavorites,
  onMessage,
  onCall,
  onShare,
  onContactUpdated,
  onContactShared,
}: UnreadChatContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const [showAddToList, setShowAddToList] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showMuteNotification, setShowMuteNotification] = useState(false);
  const [showBlockContact, setShowBlockContact] = useState(false);
  const [showClearChat, setShowClearChat] = useState(false);
  const [showViewContact, setShowViewContact] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";

      const menuHeight = 280;
      const viewportHeight = window.innerHeight;
      const shouldShowAbove = position.y + menuHeight > viewportHeight;

      setAdjustedPosition({
        x: Math.min(position.x, window.innerWidth - 200),
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
        showClearChat ||
        showViewContact ||
        showMediaGallery
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
          showClearChat ||
          showViewContact ||
          showMediaGallery
        ) {
          setShowAddToList(false);
          setShowCreateList(false);
          setShowMuteNotification(false);
          setShowBlockContact(false);
          setShowClearChat(false);
          setShowViewContact(false);
          setShowMediaGallery(false);
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
    showViewContact,
    showMediaGallery,
  ]);

  const menuItems = [
    {
      id: "view-contact",
      label: "View Contact",
      icon: <User className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          setShowViewContact(true);
        }, 0);
      },
    },
    {
      id: "media-links-docs",
      label: "Media, Links & Docs",
      icon: <FileText className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          setShowMediaGallery(true);
        }, 0);
      },
    },
    {
      id: "add-to-list",
      label: "Add to list",
      icon: <Plus className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          setShowAddToList(true);
        }, 0);
      },
    },
    {
      id: "mute-notification",
      label: "Mute notification",
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
        if (onArchiveChat) {
          onArchiveChat();
        }
        onClose();
      },
    },
    {
      id: "clear-chat",
      label: "Clear chat",
      icon: <Trash2 className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          setShowClearChat(true);
        }, 0);
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
    if (onAddToFavorites) {
      onAddToFavorites();
    }
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

  const handleViewContactClose = () => {
    setShowViewContact(false);
    onClose();
  };

  const handleViewContactMessage = () => {
    if (onMessage) {
      onMessage();
    }
  };

  const handleViewContactCall = () => {
    if (onCall) {
      onCall();
    }
  };

  const handleViewContactShare = () => {
    if (onShare) {
      onShare();
    }
  };

  const handleContactUpdated = (
    firstName: string,
    lastName: string,
    phoneNumber: string
  ) => {
    console.log("Contact updated in context menu:", {
      firstName,
      lastName,
      phoneNumber,
    });
    if (onContactUpdated) {
      onContactUpdated(firstName, lastName, phoneNumber);
    }
    setShowViewContact(false);
    onClose();
  };

  const handleContactShared = (selectedContacts: Contact[]) => {
    console.log("Contact shared in context menu:", selectedContacts);
    if (onContactShared) {
      onContactShared(selectedContacts);
    }
    setShowViewContact(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - only show if no popups are open */}
      {!showAddToList &&
        !showCreateList &&
        !showMuteNotification &&
        !showBlockContact &&
        !showClearChat &&
        !showViewContact &&
        !showMediaGallery && (
          <div className="fixed inset-0 z-40" onClick={onClose} />
        )}

      {/* Context Menu */}
      <div
        ref={menuRef}
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
        onAddToFavorites={onAddToFavorites || (() => {})}
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

      <ViewContactPopup
        isOpen={showViewContact}
        onClose={handleViewContactClose}
        contactName={chatName}
        contactAvatar={chatAvatar}
        accountType={accountType}
        onMessage={handleViewContactMessage}
        onCall={handleViewContactCall}
        onShare={handleViewContactShare}
        onContactUpdated={handleContactUpdated}
        onContactShared={handleContactShared}
      />

      <MediaGalleryPopup
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        contactName={chatName}
        contactAvatar={chatAvatar}
      />
    </>
  );
}