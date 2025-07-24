"use client";

import { CreditCard, Settings } from "lucide-react";
import { useState } from "react";
import ManageSubscriptionPopup from "./ManageSubscriptionPopup";
import CancelSubscriptionPopup from "./CancelSubscriptionPopup";
import SwitchTierPopup from "./SwitchTierPopup";

export default function VerificationPage() {
  const [showManagePopup, setShowManagePopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showSwitchTierPopup, setShowSwitchTierPopup] = useState(false);

  return (
    <div className="flex justify-start ml-5 md:ml-5">
      <div className="w-full md:w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Verification</h1>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-col space-y-4">
          <button
            onClick={() => setShowSwitchTierPopup(true)}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <CreditCard size={20} className="text-gray-500" />
            <div>
              <span className="text-sm font-semibold">Switch tier</span>
              <p className="text-sm text-gray-500">Explore more tier option</p>
            </div>
          </button>
          <button
            onClick={() => setShowManagePopup(true)}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <Settings size={20} className="text-gray-500" />
            <div>
              <span className="text-sm font-semibold">Manage your current subscription</span>
              <p className="text-sm text-gray-500">Review terms and manage subscription</p>
            </div>
          </button>
        </div>

        {showManagePopup && (
          <ManageSubscriptionPopup
            onClose={() => setShowManagePopup(false)}
            onContinue={() => {
              setShowManagePopup(false);
              setShowCancelPopup(true);
            }}
          />
        )}
        {showCancelPopup && (
          <CancelSubscriptionPopup onClose={() => setShowCancelPopup(false)} />
        )}
        {showSwitchTierPopup && (
          <SwitchTierPopup onClose={() => setShowSwitchTierPopup(false)} />
        )}
      </div>
    </div>
  );
}