"use client";

import { ArrowLeft, Plus, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UnlinkAccountPopup from "./UnlinkAccountPopup";

interface AddAccountPageProps {
  onBack?: () => void;
}

export default function AddAccountPage({ onBack }: AddAccountPageProps) {
  const [selectedAccount] = useState("");
  const [showUnlinkPopup, setShowUnlinkPopup] = useState(false);
  const [unlinkAccount, setUnlinkAccount] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const router = useRouter();

  const accounts: {
    id: string;
    username: string;
    phone: string;
    profilePic: string;
  }[] = [];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/settings");
    }
  };

  const handleAddAnother = () => {
    router.push("/");
  };

  const handleContinue = () => {
    if (selectedAccount) {
      handleBack();
    }
  };

  const handleUnlinkClick = (account: { id: string; username: string }) => {
    setUnlinkAccount(account);
    setShowUnlinkPopup(true);
  };

  const handleUnlink = () => {
    console.log(`Unlinking account: ${unlinkAccount?.username}`);
    setShowUnlinkPopup(false);
    setUnlinkAccount(null);
  };

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[546px] h-[700px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Account"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Add Account</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-3 py-2">
              <div className="w-[40px] h-[40px] bg-gray-200 rounded-full overflow-hidden"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[16px]">
                  {account.username}
                </p>
                <p className="text-sm text-gray-500 text-[14px]">
                  {account.phone}
                </p>
              </div>
              <button
                onClick={() => handleUnlinkClick(account)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label={`Unlink ${account.username}`}
              >
                <Link size={20} className="text-black" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddAnother}
            className="mt-5 flex items-center gap-3"
          >
            <div className="w-[32px] h-[32px] bg-gray-200 rounded-full flex items-center justify-center">
              <Plus size={20} className="text-[#6A88D1]" />
            </div>
            <span className="text-sm font-semibold text-[14px] text-[#6A88D1]">
              Add Another Account
            </span>
          </button>
          <Button
            onClick={handleContinue}
            disabled={!selectedAccount}
            className="mt-8 mb-4 w-full h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
        {showUnlinkPopup && unlinkAccount && (
          <UnlinkAccountPopup
            onClose={() => setShowUnlinkPopup(false)}
            onUnlink={handleUnlink}
            username={unlinkAccount.username}
          />
        )}
      </div>
    </div>
  );
}
