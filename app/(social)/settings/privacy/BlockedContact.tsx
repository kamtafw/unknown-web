"use client";

import { ArrowLeft, Search, Menu } from "lucide-react";
import { useState } from "react";
import {
  useGetBlockedUsers,
  useUnblockUsers,
  useUnblockUser,
} from "@/services/privacy/usePrivacyService";
import { usePrivacyStore } from "@/store/privacyStore";
import { useQueryClient } from "@tanstack/react-query";

interface BlockedContactsPageProps {
  onBack: () => void;
  onNavigate: (
    view: string,
    selectedCount?: number,
    onUnblock?: () => void
  ) => void;
}

export default function BlockedContactsPage({
  onBack,
  onNavigate,
}: BlockedContactsPageProps) {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const blockedUsers = usePrivacyStore((state) => state.blockedUsers);
  const { isLoading } = useGetBlockedUsers();
  const { mutate: unblockUsersMutation } = useUnblockUsers();
  const { mutate: unblockSingleUser } = useUnblockUser();
  const queryClient = useQueryClient();

  const handleToggleSelect = (pkid: number) => {
    setSelectedContacts((prev) =>
      prev.includes(pkid) ? prev.filter((id) => id !== pkid) : [...prev, pkid]
    );
  };

  const handleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === blockedUsers.length
        ? []
        : blockedUsers.map((user) => user.blocked_user.pkid)
    );
  };

  const handleUnblock = () => {
    if (selectedContacts.length === 0) return;

    if (selectedContacts.length === 1) {
      unblockSingleUser(selectedContacts[0], {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
          queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
          setSelectedContacts([]);
          onBack();
        },
      });
    } else {
      unblockUsersMutation(selectedContacts, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
          queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
          setSelectedContacts([]);
          onBack();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex ml-3 justify-center sm:justify-start w-full">
        <div className="w-full max-w-[530px] h-[796px] bg-white flex items-center justify-center">
          <p>Loading...</p>
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
                aria-label="Back to Privacy"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Blocked Contacts</h1>
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
          {blockedUsers.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              No blocked contacts
            </p>
          ) : (
            blockedUsers.map((user) => {
              const checkboxId = `contact-checkbox-${user.blocked_user.pkid}`;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-semibold text-gray-600">
                          {user.blocked_user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[16px] text-black">
                        @{user.blocked_user.username}
                      </p>
                      <p className="text-[14px] text-gray-500">
                        {user.blocked_user.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={selectedContacts.includes(
                        user.blocked_user.pkid
                      )}
                      onChange={() =>
                        handleToggleSelect(user.blocked_user.pkid)
                      }
                      className="w-5 h-5"
                      title={`Select @${user.blocked_user.username}`}
                    />
                    <label htmlFor={checkboxId} className="sr-only">
                      Select @{user.blocked_user.username}
                    </label>
                  </div>
                </div>
              );
            })
          )}
          <button
            onClick={() => {
              if (selectedContacts.length > 0) {
                onNavigate(
                  "unblockContactPopup",
                  selectedContacts.length,
                  handleUnblock
                );
              }
            }}
            className="w-full bg-blue-500 text-white py-2 rounded-full mt-8 lg:mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedContacts.length === 0}
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  );
}
