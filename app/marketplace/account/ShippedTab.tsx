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
      <div className="bg-white px-4 py-3 ">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">Highlight store</h1>
          <IoChevronForward className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="px-2 py-1">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-1 ">
            {/* Delivery confirmation with icon */}
            <div className="flex items-start gap-4 mb-6"></div>

            {/* Product image and price */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                <Image
                  src={order.image}
                  alt={order.productName}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-base leading-relaxed">
                  We have delivered your order. tap to confirm receipt of the{" "}
                  {order.productName}, {order.description}
                </p>
                <div className="text-2xl font-bold text-gray-900">
                  {order.price}
                </div>
              </div>
            </div>

            {/* Delivery date */}
            <div className="text-center mb-8">
              <p className="text-gray-900 font-medium text-lg">
                Estimated delivery date : {order.deliveryDate}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleTrackOrder(order)}
                className="flex-1 bg-white border-2 border-blue-400 text-blue-600 py-4 rounded-full font-medium text-lg hover:bg-blue-50 transition-colors"
              >
                Track Order
              </button>
              <button className="flex-1 bg-blue-500 text-white py-4 rounded-full font-medium text-lg hover:bg-blue-600 transition-colors">
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
