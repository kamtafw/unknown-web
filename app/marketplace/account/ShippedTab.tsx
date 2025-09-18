"use client";

import { useState } from "react";
import Image from "next/image";
import { IoChevronForward } from "react-icons/io5";
import TrackingPopup from "./TrackingPopup";

interface Order {
  id: number;
  productName: string;
  description: string;
  price: string;
  deliveryDate: string;
  image: string;
  status: string;
}

export default function ShippedTab() {
  const [showTracking, setShowTracking] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowTracking(true);
  };
  
  const [orders] = useState([
    {
      id: 1,
      productName: "pacYoobao 300w Mini Power Station",
      description: "Lorem ipsum dolor sit amet, consectetur akage",
      price: "₦300,550",
      deliveryDate: "31 Jan, 2025",
      image: "/market.svg",
      status: "delivered",
    },
  ]);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-medium text-gray-900">Highlight store</h1>
          <IoChevronForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="px-1 sm:px-2 py-1">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-1">
            {/* Delivery confirmation with icon */}
            <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-6"></div>

            {/* Product image and price */}
            <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg flex items-center justify-center">
                <Image
                  src={order.image}
                  alt={order.productName}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-xs sm:text-sm lg:text-base leading-relaxed mb-2">
                  We have delivered your order. tap to confirm receipt of the{" "}
                  {order.productName}, {order.description}
                </p>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {order.price}
                </div>
              </div>
            </div>

            {/* Delivery date */}
            <div className="text-center mb-4 sm:mb-8">
              <p className="text-gray-900 font-medium text-sm sm:text-base lg:text-lg">
                Estimated delivery date : {order.deliveryDate}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 sm:gap-3 px-2 sm:px-0 pb-2 sm:pb-0">
              <button
                onClick={() => handleTrackOrder(order)}
                className="flex-1 bg-white border-2 border-blue-400 text-blue-600 py-2 sm:py-3 lg:py-4 rounded-full font-medium text-sm sm:text-base lg:text-lg hover:bg-blue-50 transition-colors"
              >
                Track Order
              </button>
              <button className="flex-1 bg-blue-500 text-white py-2 sm:py-3 lg:py-4 rounded-full font-medium text-sm sm:text-base lg:text-lg hover:bg-blue-600 transition-colors">
                Confirm receive
              </button>
            </div>
          </div>
        ))}
      </div>
      {showTracking && selectedOrder && (
        <TrackingPopup
          order={selectedOrder}
          onClose={() => setShowTracking(false)}
        />
      )}
    </div>
  );
}
