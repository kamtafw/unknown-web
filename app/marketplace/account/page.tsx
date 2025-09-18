"use client";

import { useState } from "react";
import AccountPage from "./Account";
import ShippedTab from "./ShippedTab";
import DeliveredTab from "./DeliveredTab";
import ShippingAddressPage from "./ShippingAddress";
import CardsPage from "./CardsPage";

export default function Page() {
  const [activeTab, setActiveTab] = useState("shipped");
  const [rightPanelView, setRightPanelView] = useState<
    null | "orders" | "shipping" | "cards"
  >(null);

  // Mobile view state - when any menu item is clicked on mobile
  const [mobileView, setMobileView] = useState<
    null | "orders" | "shipping" | "cards"
  >(null);

  const handleMyOrdersClick = () => {
    // Desktop behavior
    setRightPanelView("orders");
    // Mobile behavior
    setMobileView("orders");
  };

  const handleShippingAddressClick = () => {
    // Desktop behavior
    setRightPanelView("shipping");
    // Mobile behavior
    setMobileView("shipping");
  };

  const handleCardsClick = () => {
    // Desktop behavior
    setRightPanelView("cards");
    // Mobile behavior
    setMobileView("cards");
  };

  const handleBackToAccount = () => {
    setMobileView(null);
    setRightPanelView(null);
  };

  return (
    <div className="bg-gray-50 p-2 sm:p-4">
      <div className="flex gap-4 max-w-full">
        {/* Mobile: Single view that changes based on mobileView state */}
        <div className="lg:hidden w-full">
          {!mobileView ? (
            <AccountPage
              onMyOrdersClick={handleMyOrdersClick}
              onShippingAddressClick={handleShippingAddressClick}
              onCardsClick={handleCardsClick}
            />
          ) : mobileView === "orders" ? (
            <div className="w-full bg-white rounded-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-50 p-1 rounded-full w-full">
                  <button
                    onClick={() => setActiveTab("shipped")}
                    className={`flex-1 py-2 px-4 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                      activeTab === "shipped"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => setActiveTab("delivered")}
                    className={`flex-1 py-2 px-4 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                      activeTab === "delivered"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Delivered
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                  {activeTab === "shipped" ? <ShippedTab /> : <DeliveredTab />}
                </div>
              </div>
            </div>
          ) : mobileView === "shipping" ? (
            <ShippingAddressPage onBack={handleBackToAccount} />
          ) : mobileView === "cards" ? (
            <CardsPage onBack={handleBackToAccount} />
          ) : null}
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className="hidden lg:flex lg:gap-4 lg:max-w-full w-full">
          <div className="flex-1">
            <AccountPage
              onMyOrdersClick={handleMyOrdersClick}
              onShippingAddressClick={handleShippingAddressClick}
              onCardsClick={handleCardsClick}
            />
          </div>

          {/* Right Side - Conditional Content */}
          {rightPanelView === "orders" && (
            <div className="w-[600px] bg-white rounded-lg overflow-hidden">
              <div className="p-6">
                {/* Tab Navigation */}
                <div className="space-x-5 mb-6 bg-gray-50 p-1 rounded-full inline-flex w-[550px] justify-between">
                  <button
                    onClick={() => setActiveTab("shipped")}
                    className={`px-30 py-2 rounded-full text-base font-medium transition-all duration-200 ${
                      activeTab === "shipped"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => setActiveTab("delivered")}
                    className={`px-30 py-2 rounded-full text-base font-medium transition-all duration-200 ${
                      activeTab === "delivered"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Delivered
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                  {activeTab === "shipped" ? <ShippedTab /> : <DeliveredTab />}
                </div>
              </div>
            </div>
          )}

          {rightPanelView === "shipping" && (
            <ShippingAddressPage onBack={() => setRightPanelView(null)} />
          )}

          {rightPanelView === "cards" && (
            <CardsPage onBack={() => setRightPanelView(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
