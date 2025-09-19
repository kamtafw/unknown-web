"use client";

import {
  IoChevronBack,
  IoCheckmarkCircle,
  IoChevronForward,
} from "react-icons/io5";
import Image from "next/image";

interface Order {
  id: number;
  productName: string;
  description: string;
  price: string;
  deliveryDate: string;
  image: string;
  status: string;
}

interface TrackingPopupProps {
  order: Order;
  onClose: () => void;
}

export default function TrackingPopup({ order, onClose }: TrackingPopupProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-md sm:max-w-lg lg:w-150 max-h-[97vh] overflow-hidden animate-slide-up rounded-lg">
        {/* Header */}
        <div className="bg-white px-3 sm:px-4 py-3 border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close tracking popup"
            >
              <IoChevronBack className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tracking</h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50 overflow-y-auto max-h-[calc(90vh-60px)]">
          {/* Store info */}
          <div className="bg-white px-3 sm:px-4 py-4 border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-bold text-sm sm:text-base">Highlight Store</span>
              <IoChevronForward className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
          </div>

          {/* Order card */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Product image */}
              <div className="w-16 h-16 sm:w-30 sm:h-30 flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src={order.image}
                  alt={order.productName}
                  width={64}
                  height={64}
                  className="object-contain rounded-lg w-full h-full"
                />
              </div>
              {/* Delivery status */}
              <div className="flex-1">
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                  We have delivered your order, tap to confirm receipt of the{" "}
                  {order.productName}
                </p>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                  {order.price}
                </div>
              </div>
            </div>
            {/* Delivery date */}
            <div className="text-center mb-3 mt-8 sm:mt-15">
              <p className="text-gray-900 font-bold text-base sm:text-lg">
                Estimated delivery date : {order.deliveryDate}
              </p>
            </div>
          </div>

          {/* Delivery status timeline */}
          <div className="px-3 sm:px-4 mb-6">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                    Delivery successful
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    31 Dec, 2024 18:20 WAT
                  </p>
                </div>
              </div>
              {/* Package on the way */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                    Package on the way
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    31 Dec, 2024 18:20 WAT
                  </p>
                </div>
              </div>

              {/* Package arrived at local sorting center */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                    Package arrived at local sorting center
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    31 Dec, 2024 18:20 WAT
                  </p>
                </div>
              </div>

              {/* Package left warehouse */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                    Package left warehouse and collected by carrier
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    31 Dec, 2024 18:20 WAT
                  </p>
                </div>
              </div>

              {/* Package being prepared */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                    Your package is currently been prepared
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    31 Dec, 2024 18:20 WAT
                  </p>
                </div>
              </div>

              {/* Order created */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                    Your order has been successfully created
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    31 Dec, 2024 18:20 WAT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
