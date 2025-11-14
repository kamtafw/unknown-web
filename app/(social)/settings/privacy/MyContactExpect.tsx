"use client";

import { ArrowLeft, Search, Menu } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useGetContacts } from "@/services/privacy/usePrivacyService";
import { usePrivacyStore } from "@/store/privacyStore";

interface MyContactExceptPageProps {
  onBack: () => void;
  onUpdateText: (text: string) => void;
  setExcludedCount: (count: number) => void;
}

export default function MyContactExceptPage({
  onBack,
  onUpdateText,
  setExcludedCount,
}: MyContactExceptPageProps) {
  const { data: contactsData, isLoading } = useGetContacts();
  const contacts = useMemo(
    () => contactsData?.data?.followings || [],
    [contactsData]
  );

  const excludedContactIds = usePrivacyStore((state) => state.excludedContactIds);
  const setExcludedContactIds = usePrivacyStore((state) => state.setExcludedContactIds);

  const [selectedContacts, setSelectedContacts] = useState<number[]>(excludedContactIds);

  useEffect(() => {
    setSelectedContacts(excludedContactIds);
  }, [excludedContactIds]);

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
        : contacts.map((c: { id: number }) => c.id)
    );
  };

const handleSave = () => {
    const count = selectedContacts.length;
    setExcludedCount(count);
    setExcludedContactIds(selectedContacts);
    onUpdateText(`My contact except, ${count} excluded`);
    onBack();
  };

  if (isLoading) {
    return (
      <div className="flex ml-3 justify-center sm:justify-start w-full">
        <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black flex items-center justify-center shadow-md rounded-lg">
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back to Last seen and Online"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">My Contact except</h1>
                <p className="text-[14px] text-gray-500">
                  {selectedContacts.length} contacts Excluded
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
          {contacts.map(
            (contact: {
              id: number;
              username: string;
              phone: string;
              image: string;
              profile_picture?: string;
            }) => {
              const checkboxId = `contact-checkbox-${contact.id}`;
              const displayImage = contact.profile_picture || contact.image;

              return (
                <div
                  key={contact.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={
                            displayImage.startsWith("http")
                              ? displayImage
                              : `/${displayImage}`
                          }
                          alt={contact.username}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[16px] text-black">
                        {contact.username}
                      </p>
                      <p className="text-[14px] text-gray-500">
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleToggleSelect(contact.id)}
                      className="w-5 h-5"
                      title={`Select ${contact.username}`}
                    />
                    <label htmlFor={checkboxId} className="sr-only">
                      Select {contact.username}
                    </label>
                  </div>
                </div>
              );
            }
          )}
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
