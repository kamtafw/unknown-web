"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface GroupTranslationPopupProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  messageText: string;
  onTranslate: (messageText: string, targetLanguage: string) => void;
}

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
];

export function GroupTranslationPopup({ 
  isOpen, 
  position, 
  onClose, 
  messageText,
  onTranslate
}: GroupTranslationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      const menuWidth = 280;
      const menuHeight = 400;
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
      
      adjustedX = Math.max(10, adjustedX);
      adjustedY = Math.max(10, adjustedY);
      
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    } else {
      setIsVisible(false);
      setSelectedLanguage(null);
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (target.closest('[data-group-translation-popup]')) {
        return;
      }
      
      if (isOpen) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onTranslate(messageText, languageCode);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50"
        onClick={onClose}
      />
      
      {/* Translation Popup */}
      <div
        data-group-translation-popup
        className="fixed z-60 bg-white rounded-lg shadow-xl border border-gray-200 w-[95vw] max-w-[280px] lg:min-w-[280px] max-h-[400px] overflow-hidden"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">Translate Message</h3>
        </div>

        {/* Language List */}
        <div className="max-h-[320px] overflow-y-auto">
          <div className="py-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto font-normal hover:bg-blue-50 rounded-none text-gray-700 hover:text-blue-700"
                onClick={() => handleLanguageSelect(language.code)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{language.name}</span>
                  </div>
                  {selectedLanguage === language.code && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Select a language to translate your message
          </p>
        </div>
      </div>
    </>
  );
}