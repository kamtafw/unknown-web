"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  User, 
  FileText, 
  BellOff, 
  Plus, 
  UserX, 
  Archive, 
  Trash2 
} from "lucide-react";
import { AddToListPopup } from "./AddToListPopup";
import { CreateListPopup } from "./CreateListPopup";
import { MuteNotificationPopup } from "./MuteNotificationPopup";
import { BlockContactPopup } from "./BlockContactPopup";
import { ClearChatPopup } from "./ClearChatPopup";

interface ChatInterfaceContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  chatId: string;
  chatName: string;
  onArchiveChat: () => void;
  onAddToFavorites: () => void;
}

export function ChatInterfaceContextMenu({ 
  isOpen, 
  position, 
  onClose, 
  chatId,
  chatName,
  onArchiveChat,
  onAddToFavorites
}: ChatInterfaceContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  
  // Popup states
  const [showAddToList, setShowAddToList] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showMuteNotification, setShowMuteNotification] = useState(false);
  const [showBlockContact, setShowBlockContact] = useState(false);
  const [showClearChat, setShowClearChat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);      
      document.body.style.overflow = 'hidden';
      
      const menuHeight = 240; // Reduced height for fewer items
      const viewportHeight = window.innerHeight;
      const shouldShowAbove = position.y + menuHeight > viewportHeight;
      
      setAdjustedPosition({
  x: position.x - 200,
  y: shouldShowAbove ? position.y - menuHeight : position.y
});
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking on any popup or popup content
      if (showAddToList || showCreateList || showMuteNotification || showBlockContact || showClearChat) {
        return;
      }
      
      // Don't close if clicking on the context menu itself
      if (target.closest('[data-context-menu]')) {
        return;
      }
      
      if (isOpen) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        // Close all popups first, then the context menu
        if (showAddToList || showCreateList || showMuteNotification || showBlockContact || showClearChat) {
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
      // Small delay to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
        document.addEventListener('keydown', handleEscape);
      }, 10);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, showAddToList, showCreateList, showMuteNotification, showBlockContact, showClearChat]);

  const menuItems = [
    {
      id: 'view-contact',
      label: 'View Contact',
      icon: <User className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('View contact:', chatName, chatId);
        onClose();
      }
    },
    {
      id: 'media-links-docs',
      label: 'Media, Links & Docs',
      icon: <FileText className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Media, Links & Docs for:', chatName, chatId);
        onClose();
      }
    },
    {
      id: 'add-to-list',
      label: 'Add to List',
      icon: <Plus className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use setTimeout to ensure the state change happens after the current event cycle
        setTimeout(() => {
          setShowAddToList(true);
        }, 0);
      }
    },
    {
      id: 'mute-notification',
      label: 'Mute Notification',
      icon: <BellOff className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use setTimeout to ensure the state change happens after the current event cycle
        setTimeout(() => {
          setShowMuteNotification(true);
        }, 0);
      }
    },
    {
      id: 'block-contact',
      label: 'Block Contact',
      icon: <UserX className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use setTimeout to ensure the state change happens after the current event cycle
        setTimeout(() => {
          setShowBlockContact(true);
        }, 0);
      },
      destructive: true
    },
    {
      id: 'archive-chat',
      label: 'Archive Chat',
      icon: <Archive className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onArchiveChat();
        onClose();
      }
    },
    {
      id: 'clear-chat',
      label: 'Clear Chat',
      icon: <Trash2 className="h-4 w-4" />,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use setTimeout to ensure the state change happens after the current event cycle
        setTimeout(() => {
          setShowClearChat(true);
        }, 0);
      },
      destructive: true
    }
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
    onAddToFavorites(); // Navigate to favorites tab
    onClose(); // Close the context menu
  };

  const handleMuteSave = (duration: string) => {
    console.log('Muting chat for:', duration);
    setShowMuteNotification(false);
    onClose(); // Close the context menu
  };

  const handleMuteClose = () => {
    setShowMuteNotification(false);
    // Don't close context menu, let user choose another option
  };

  const handleBlock = (reason: string, feedback: string) => {
    console.log('Blocking contact:', chatName, 'Reason:', reason, 'Feedback:', feedback);
    setShowBlockContact(false);
    onClose(); // Close the context menu
  };

  const handleBlockClose = () => {
    setShowBlockContact(false);
    // Don't close context menu, let user choose another option
  };

  const handleClearChat = (deleteMedia: boolean) => {
    console.log('Clearing chat:', chatName, 'Delete media:', deleteMedia);
    setShowClearChat(false);
    onClose(); // Close the context menu
  };

  const handleClearChatClose = () => {
    setShowClearChat(false);
    // Don't close context menu, let user choose another option
  };

  const handleAddToListClose = () => {
    setShowAddToList(false);
    // Don't close context menu, let user choose another option
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - only show if no popups are open */}
      {!showAddToList && !showCreateList && !showMuteNotification && !showBlockContact && !showClearChat && (
        <div 
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
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
                item.destructive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-gray-700'
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

