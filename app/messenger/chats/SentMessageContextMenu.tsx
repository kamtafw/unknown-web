"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Reply, Forward, Copy, Languages, Trash2 } from "lucide-react";
import { TranslationPopup } from "./TranslationPopup";

interface SentMessageContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  messageText: string;
  onReply: (messageText: string) => void;
  onForward: (messageText: string) => void;
  onDeleteMessage: () => void;
  onTranslate?: (messageText: string, targetLanguage: string) => void;
}

export function SentMessageContextMenu({ 
  isOpen, 
  position, 
  onClose, 
  messageText,
  onReply,
  onForward,
  onDeleteMessage,
  onTranslate
}: SentMessageContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isTranslationPopupOpen, setIsTranslationPopupOpen] = useState(false);
  const [translationPopupPosition, setTranslationPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      const menuWidth = 200;
      const menuHeight = 200;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = position.x;
      let adjustedY = position.y;
      

      if (position.x + menuWidth > viewportWidth) {
        adjustedX = position.x - menuWidth;
      }
      
     
      if (position.y + menuHeight > viewportHeight) {
        adjustedY = position.y - menuHeight;
      }
      
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    } else {
      setIsVisible(false);
      setIsTranslationPopupOpen(false);
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (target.closest('[data-translation-popup]')) {
        return;
      }
      
      if (target.closest('[data-sent-message-context-menu]')) {
        return;
      }
      
      if (isOpen) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isTranslationPopupOpen) {
          setIsTranslationPopupOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
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
  }, [isOpen, onClose, isTranslationPopupOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    console.log('Message copied:', messageText);
    onClose();
  };

  const handleTranslateClick = () => {
    setIsVisible(false);
    
    
    setTranslationPopupPosition({
      x: adjustedPosition.x,
      y: adjustedPosition.y
    });
    
    setIsTranslationPopupOpen(true);
  };

  const handleTranslationComplete = (messageText: string, targetLanguage: string) => {
    console.log('Translate message to', targetLanguage, ':', messageText);
    if (onTranslate) {
      onTranslate(messageText, targetLanguage);
    }
    setIsTranslationPopupOpen(false);
    onClose();
  };

  const handleTranslationPopupClose = () => {
    setIsTranslationPopupOpen(false);
    onClose();
  };

  if (!isVisible && !isTranslationPopupOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      {isVisible && (
        <div
          data-sent-message-context-menu
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Items */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
              onClick={() => {
                onReply(messageText);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <Reply className="h-4 w-4" />
                <span className="text-sm">Reply</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
              onClick={() => {
                onForward(messageText);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <Forward className="h-4 w-4" />
                <span className="text-sm">Forward</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
              onClick={() => {
                onDeleteMessage();
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Delete message</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
              onClick={handleCopy}
            >
              <div className="flex items-center gap-3">
                <Copy className="h-4 w-4" />
                <span className="text-sm">Copy</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
              onClick={handleTranslateClick}
            >
              <div className="flex items-center gap-3">
                <Languages className="h-4 w-4" />
                <span className="text-sm">Translate</span>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Translation Popup */}
      <TranslationPopup
        isOpen={isTranslationPopupOpen}
        position={translationPopupPosition}
        onClose={handleTranslationPopupClose}
        messageText={messageText}
        onTranslate={handleTranslationComplete}
      />
    </>
  );
}