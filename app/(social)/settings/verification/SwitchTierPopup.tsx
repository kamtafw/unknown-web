"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface SwitchTierPopupProps {
  onClose: () => void;
}

export default function SwitchTierPopup({ onClose }: SwitchTierPopupProps) {
  const [selectedTier, setSelectedTier] = useState("Monthly");

  const individualBenefits = [
    "Browse all apps & website",
    "Browse all apps & website",
    "Browse all apps & website",
    "Browse all apps & website",
    "Browse all apps & website",
  ];

  const organizationBenefits = [
    "Browse all apps & website",
    "Browse all apps & website",
    "Browse all apps & website",
    "Browse all apps & website",
    "Browse all apps & website",
  ];

  const pricing = {
    Monthly: { individual: "$10.00/Monthly", organization: "$20.00/Monthly" },
    Quarterly: { individual: "$27.00/Quarterly", organization: "$54.00/Quarterly" },
    Yearly: { individual: "$100.00/Yearly", organization: "$200.00/Yearly" },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex items-center gap-3">
          
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-semibold">Switch tier</h3>
        </div>
        <div className="mt-4">
          <div className="bg-gray-100 rounded-full p-3 flex justify-between">
            {["Monthly", "Quarterly", "Yearly"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-6 py-2 text-sm font-semibold rounded-full ${
                  selectedTier === tier
                    ? "bg-white shadow-sm border border-gray-200"
                    : "text-black"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          {selectedTier === "Monthly" && (
            <div className="mt-4 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[16px]">Individual</h4>
                <p className="text-sm text-gray-500 mt-1 text-[24px]">{pricing.Monthly.individual}</p>
                <button
                  className="mt-2 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
                >
                  Upgrade
                </button>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  {individualBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[16px]">Organization</h4>
                <p className="text-sm text-gray-500 mt-1 text-[24px]">{pricing.Monthly.organization}</p>
                <button
                  className="mt-2 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
                >
                  Upgrade
                </button>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  {organizationBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {selectedTier === "Quarterly" && (
            <div className="mt-4 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[16px]">Individual</h4>
                <p className="text-sm text-gray-500 mt-1 text-[24px]">{pricing.Quarterly.individual}</p>
                <button
                  className="mt-2 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
                >
                  Upgrade
                </button>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  {individualBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[16px]">Organization</h4>
                <p className="text-sm text-gray-500 mt-1 text-[24px]">{pricing.Quarterly.organization}</p>
                <button
                  className="mt-2 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
                >
                  Upgrade
                </button>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  {organizationBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {selectedTier === "Yearly" && (
            <div className="mt-4 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[16px]">Individual</h4>
                <p className="text-sm text-gray-500 mt-1 text-[24px]">{pricing.Yearly.individual}</p>
                <button
                  className="mt-2 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
                >
                  Upgrade
                </button>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  {individualBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[16px]">Organization</h4>
                <p className="text-sm text-gray-500 mt-1 text-[24px]">{pricing.Yearly.organization}</p>
                <button
                  className="mt-2 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
                >
                  Upgrade
                </button>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  {organizationBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}