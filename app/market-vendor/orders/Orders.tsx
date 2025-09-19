"use client";

import { useState } from "react";
import Image from "next/image";
import OrderPopup from "./OrderPopup";

interface Order {
  id: number;
  productName: string;
  description: string;
  price: string;
  deliveryDate: string;
  image: string;
  status: string;
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState("shipped");
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tabs = [
    { id: "shipped", label: "Shipped", count: 0 },
    { id: "delivered", label: "Delivered", count: 0 },
  ];

  const alertItems = [
    {
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      date: "31 Jan, 2025",
      image: "/market.svg",
      price: "₦300,550",
      quantity: "3pcs",
    },
    {
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      date: "28 Jan, 2025",
      image: "/market.svg",
      price: "₦300,550",
      quantity: "3pcs",
    },
    {
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      date: "25 Jan, 2025",
      image: "/market.svg",
      price: "₦300,550",
      quantity: "3pcs",
    },
  ];

  const handleTrackOrderClick = (
    item: (typeof alertItems)[0],
    index: number
  ) => {
    setSelectedOrder({
      id: index,
      productName: item.productName,
      description: item.productDescription,
      price: item.price,
      deliveryDate: item.date,
      image: item.image,
      status: "shipped",
    });
    setShowOrderPopup(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 p-3 sm:p-4 lg:p-6 min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 lg:max-w-4xl">
        {/* Tabs */}
        <div className="w-full mb-4 lg:mb-6">
          <div className="flex space-x-2 lg:space-x-4 bg-gray-100 rounded-full p-1 lg:p-2 shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 lg:px-8 lg:py-3 rounded-full text-sm lg:text-base font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4 sm:space-y-6">
          {alertItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="object-cover w-16 h-20 sm:w-20 sm:h-24 lg:w-20 lg:h-20"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-700 leading-relaxed mb-3">
                    We have delivered your order. tap to confirm receipt of the
                    pac
                    <span className="font-semibold text-gray-900">
                      {" "}
                      {item.productName}
                    </span>
                    , {item.productDescription}
                  </p>

                  {/* Price and Quantity Row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base lg:text-lg font-semibold text-gray-900">
                      {item.price}
                    </span>
                    <span className="text-sm text-black font-semibold">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Conditional Bottom Section based on active tab */}
                  {activeTab === "shipped" ? (
                    /* Shipped Tab Content */
                    <div className="space-y-3 text-center">
                      <div className="text-sm text-gray-900">
                        Date: {item.date}
                      </div>
                      <button
                        onClick={() => handleTrackOrderClick(item, index)}
                        className="bg-white border border-blue-400 text-blue-400 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                      >
                        Track Order
                      </button>
                    </div>
                  ) : (
                    /* Delivered Tab Content */
                    <div className="w-full">
                      <div className="bg-green-100 text-green-700 text-center py-2 rounded-lg text-sm font-medium">
                        Delivered
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADS/Promotion Section - Desktop only */}
      <div className="hidden lg:block w-[400px] flex-shrink-0">
        <div className="space-y-8">
          <div className="bg-gray-100 rounded-lg p-8 h-48 flex items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-900">
              ADS/Promotion
            </h2>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-48 flex items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-900">
              ADS/Promotion
            </h2>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-48 flex items-center justify-center">
            <h2 className="text-xl font-semibiant text-gray-900">
              ADS/Promotion
            </h2>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-48 flex items-center justify-center">
            <h2 className="text-xl font-semibiant text-gray-900">
              ADS/Promotion
            </h2>
          </div>
        </div>
      </div>
      {/* Order Popup */}
      {showOrderPopup && selectedOrder && (
        <OrderPopup
          order={selectedOrder}
          onClose={() => setShowOrderPopup(false)}
        />
      )}
    </div>
  );
}
