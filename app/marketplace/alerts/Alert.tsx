
import React from 'react';
import Image from 'next/image';

interface AlertItem {
  id: number;
  heading: string;
  message: string;
  image: string;
  linkText: string;
}

export function Alert() {
  const alerts: AlertItem[] = [
    {
      id: 1,
      heading: "Your Order has been delivered",
      message: "We have delivered your order, tap to confirm receipt of the package",
      image: "/market.svg",
      linkText: "See details"
    },
    {
      id: 2,
      heading: "Your Order has been delivered",
      message: "We have delivered your order, tap to confirm receipt of the package",
      image: "/market.svg",
      linkText: "See details"
    },
    {
      id: 3,
      heading: "Your Order has been delivered",
      message: "We have delivered your order, tap to confirm receipt of the package",
      image: "/market.svg",
      linkText: "See details"
    },
    {
      id: 4,
      heading: "Your Order has been delivered",
      message: "We have delivered your order, tap to confirm receipt of the package",
      image: "/market.svg",
      linkText: "See details"
    },
    {
      id: 5,
      heading: "Your Order has been delivered",
      message: "We have delivered your order, tap to confirm receipt of the package",
      image: "/market.svg",
      linkText: "See details"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Heading above everything */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {alert.heading}
            </h3>
            
            <div className="flex items-start space-x-4">
              {/* Product Image Container */}
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={alert.image}
                    alt="Product"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                  {/* Delivery truck icon overlay */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 14.846 4.632 16 6.414 16H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6V3a1 1 0 00-1-1H4.333c-.203 0-.393.102-.507.282L3.89 2.45A1 1 0 002 2H1a1 1 0 000 2h.382l.724 1.447A.989.989 0 003 4z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Alert Content */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {alert.message}
                </p>
                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                  {alert.linkText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}