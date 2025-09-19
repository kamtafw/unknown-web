"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function DeliveredTab() {
  const [orders] = useState([
    {
      id: 1,
      productName: "pacYoobao 300w Mini Power Station",
      description: "Lorem ipsum dolor sit amet, consectetur akage",
      orderDate: "2024-09-01",
      deliveryDate: "2024-09-05",
      totalAmount: 300550,
      rated: false,
      image: "/market.svg"
    },
    {
      id: 2,
      productName: "pacYoobao 300w Mini Power Station",
      description: "Lorem ipsum dolor sit amet, consectetur akage",
      orderDate: "2024-08-28",
      deliveryDate: "2024-09-02",
      totalAmount: 300550,
      rated: false,
      image: "/market.svg"
    }
  ]);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="p-2 sm:p-4 bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-3 sm:mb-5">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Highlight store</h2>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2" />
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg">
            {/* Order Item */}
            <div className="p-1">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Product Image */}
                <div className="rounded-lg flex-shrink-0 flex items-center justify-center">
                  <Image 
                    src="/market.svg" 
                    alt="Product" 
                    width={48}
                    height={48}
                    className="w-8 h-8 sm:w-12 sm:h-12 lg:w-30 lg:h-30 object-contain"
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                          We have delivered your order. tap to confirm receipt of the {order.productName}, {order.description}
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivered Status */}
            <div className="bg-green-100 py-2 sm:py-3 rounded-lg">
              <p className="text-center text-green-700 font-medium text-sm sm:text-base">Delivered</p>
            </div>
            
            {/* Action Buttons */}
            <div className="p-2 sm:p-4 flex space-x-2 sm:space-x-3">
              <button className="flex-1 border border-blue-500 text-blue-500 py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors">
                Remove
              </button>
              <button className="flex-1 bg-blue-500 text-white py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors">
                Write a review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}