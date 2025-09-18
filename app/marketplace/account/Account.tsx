"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { FaLocationDot, FaTruckFast } from "react-icons/fa6";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { MdPerson } from "react-icons/md";

export default function AccountPage({
  onMyOrdersClick,
  onShippingAddressClick,
  onCardsClick,
}: {
  onMyOrdersClick?: () => void;
  onShippingAddressClick?: () => void;
  onCardsClick?: () => void;
}) {
  const [user] = useState({
    name: "Cameron Williamson",
    phone: "+234 8111223456",
  });

  const [voucherAmount] = useState(300550);
  const [refundAmount] = useState(300550);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="w-full">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Account</h1>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <MdPerson className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {user.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">{user.phone}</p>
            </div>
          </div>

          {/* Marketplace Banner */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-3 sm:p-4 mb-3 relative overflow-hidden">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-white text-xs sm:text-sm mb-1">
                  Click to start selling on
                </p>
                <p className="text-white text-sm sm:text-base font-medium">
                  AppsCombo <span className="text-blue-300">Marketplace</span>
                </p>
              </div>
              <div className="w-16 h-12 sm:w-20 sm:h-16 relative">
                <Image
                  src="/acc.svg"
                  alt="Marketplace illustration"
                  width={80}
                  height={64}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            </div>
            {/* Decorative dots - centered at bottom */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white bg-opacity-30 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white bg-opacity-50 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Voucher and Refunds */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            {/* Voucher */}
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 pb-1 border-b border-gray-100">
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                  <Image
                    src="/vou.svg"
                    alt="Voucher"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Voucher</p>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {formatPrice(voucherAmount)}
              </p>
            </div>

            {/* Refunds */}
            <div className="bg-red-50 rounded-lg p-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 pb-1 border-b border-gray-100">
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                  <Image
                    src="/refunds.svg"
                    alt="Refunds"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Refunds</p>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {formatPrice(refundAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {/* My Orders */}
          <div
            className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100"
            onClick={onMyOrdersClick}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                <FaTruckFast className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900">My Orders</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Total product that you have ordered and delivered
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>

          {/* Shipping Address */}
          <div
            className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100"
            onClick={onShippingAddressClick}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                <FaLocationDot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900">
                  Shipping address (Default)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  3 eyovolele oluyaes street
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Amuwo odofin, lagos state, Nigeria, 123456
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>

          {/* Cards */}
          <div
            className="border-t border-gray-100 mb-3 pb-4"
            onClick={onCardsClick}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  <BsCreditCard2FrontFill className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900">Cards</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Add and remove card for transactions
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            {/* Saved Card */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-7 h-5 sm:w-8 sm:h-6 flex items-center justify-center bg-white rounded">
                  <Image
                    src="/visa.svg"
                    alt="Visa card"
                    width={24}
                    height={15}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium">
                  5644 5667 **** 5922
                </span>
              </div>
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <Image
                  src="/check.svg"
                  alt="Verified"
                  width={16}
                  height={16}
                  className="text-green-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="h-4"></div>
      </div>
    </div>
  );
}
