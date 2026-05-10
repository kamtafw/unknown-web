"use client";

import { ArrowLeft, Search, Menu } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { usePrivacyStore } from "@/store/privacyStore";
import { useGetContacts } from "@/services/privacy/usePrivacyService";

interface OnlyShareWithStatusPageProps {
  onBack: () => void;
  onUpdateText: (count: number) => void;
  initialCount: number;
  setIncludedCount: (count: number) => void;
}

export default function OnlyShareWithStatusPage({
  onBack,
  onUpdateText,
  initialCount,
  setIncludedCount,
}: OnlyShareWithStatusPageProps) {
  useGetContacts();
  const storeContacts = usePrivacyStore((state) => state.contacts);
  const setIncludedContactIds = usePrivacyStore(
    (state) => state.setIncludedContactIds
  );

  // const contacts = storeContacts.length > 0 ? storeContacts : [];
  const contacts = useMemo(
    () => (storeContacts.length > 0 ? storeContacts : []),
    [storeContacts]
  );

  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  useEffect(() => {
    if (initialCount > 0 && contacts.length > 0) {
      setSelectedContacts(contacts.slice(0, initialCount).map((c) => c.pkid));
    }
  }, [contacts, initialCount]);

  const handleToggleSelect = (id: number) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === contacts.length
        ? []
        : contacts.map((c) => c.pkid)
    );
  };

  const handleSave = () => {
    const count = selectedContacts.length;
    setIncludedCount(count);
    setIncludedContactIds(selectedContacts);
    onUpdateText(count);
    onBack();
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back to Status"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Only Share With</h1>
                <p className="text-[14px] text-gray-500">
                  {selectedContacts.length} contacts included
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search size={20} className="text-gray-500" />
              <button
                onClick={handleSelectAll}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Select all contacts"
                aria-label="Select all contacts"
              >
                <Menu size={25} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 lg:py-2 space-y-5 lg:space-y-3">
          {contacts.map((contact) => {
            const checkboxId = `contact-checkbox-${contact.pkid}`;
            return (
              <div
                key={contact.pkid}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={contact.profile_picture || `/${contact.image}`}
                        alt={contact.username}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[16px] text-black">{contact.username}</p>
                    <p className="text-[14px] text-gray-500">
                      {contact.phone_number || contact.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor={checkboxId} className="sr-only">
                    Select {contact.username}
                  </label>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={selectedContacts.includes(contact.pkid)}
                    onChange={() => handleToggleSelect(contact.pkid)}
                    className="w-5 h-5"
                    title={`Select ${contact.username}`}
                  />
                </div>
              </div>
            );
          })}
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2 rounded-full mt-8 lg:mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
