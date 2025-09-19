"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { PaymentModal } from "./PaymentModal";

interface CartItem {
  id: string;
  orderNumber: number;
  name: string;
  description: string;
  price: number;
  image: string;
  vendor: string;
  quantity: number;
}

const initialCartItems: CartItem[] = [
  {
    id: "cart-item-1",
    orderNumber: 1,
    name: 'Novilla 57" Loveseat Sofa Small Couch for Living Room, Linen Fabric Upholstered',
    description: "Comfortable and stylish loveseat sofa",
    price: 400000,
    image: "/market.svg",
    vendor: "Unity Ventures LTD",
    quantity: 2,
  },
  {
    id: "cart-item-2",
    orderNumber: 2,
    name: "Yoobao 300w Mini Power Station",
    description: "Portable power station with documentation",
    price: 30000,
    image: "/market 2.svg",
    vendor: "Somto Power Ventures",
    quantity: 1,
  },
  {
    id: "cart-item-3",
    orderNumber: 3,
    name: "Samsung Galaxy S24 Ultra",
    description: "Latest flagship smartphone with S Pen",
    price: 850000,
    image: "/market 3.svg",
    vendor: "Tech Solutions Ltd",
    quantity: 1,
  },
  {
    id: "cart-item-4",
    orderNumber: 4,
    name: "MacBook Pro 16-inch M3",
    description: "Professional laptop for creative work",
    price: 1200000,
    image: "/market 4.svg",
    vendor: "Apple Store Nigeria",
    quantity: 1,
  },
];

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getShippingCost = () => {
    return 2000;
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  const isShippingFree = () => {
    return getSubtotal() > 1000000;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {/* Left Side - Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Shopping Cart
                </h1>
                <div className="text-base lg:text-lg font-medium text-gray-600">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 lg:space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-gray-100 pb-4 lg:pb-6 last:border-b-0"
                  >
                    {/* Order Header */}
                    <div className="mb-3 lg:mb-4">
                      <h2 className="text-base lg:text-lg font-semibold text-gray-900">
                        Order #{item.orderNumber}
                      </h2>
                    </div>

                    {/* Item Content */}
                    <div className="flex items-start space-x-3 lg:space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 flex-1 mb-2 sm:mb-0 pr-0 sm:pr-4">
                            {item.name}
                          </h3>
                          <div className="text-lg sm:text-xl font-bold text-gray-900 sm:min-w-[8rem] sm:text-right">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>

                        {/* Vendor */}
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 lg:mb-2">
                          <span className="truncate">{item.vendor}</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 flex-shrink-0" />
                        </div>

                        {/* Controls Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 lg:mt-3 space-y-2 sm:space-y-0">
                          {/* Remove Item */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors text-xs sm:text-sm self-start"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Remove Item</span>
                          </button>

                          {/* Quantity Control */}
                          <div className="flex items-center space-x-6 justify-end sm:justify-start">
                            <div className="flex items-center border border-gray-200 rounded-full px-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                              </button>

                              <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center">
                                {item.quantity.toString().padStart(2, "0")}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty Cart State */}
              {cartItems.length === 0 && (
                <div className="text-center py-8 lg:py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">Add some items to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Shipping & Summary */}
          <div className="space-y-3">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Shipping address
              </h3>
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  Cameron Williamson +234 08112345678
                </p>
                <p className="text-sm sm:text-base text-gray-600">3 eyovolele oluyaes street</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm sm:text-base text-gray-600 flex-1 pr-2">
                    Amuwo odofin, lagos state, Nigeria, 123456
                  </p>
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-400 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Shipping method
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-sm sm:text-base font-medium text-blue-600">
                      Shipping: Free shipping
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Estimated delivery time: Jan 11 - 21
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-400 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                  <span className="text-sm sm:text-base font-medium">
                    {formatPrice(getSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                  <div className="flex items-center space-x-2">
                    {isShippingFree() && (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                        Free
                      </span>
                    )}
                    <span
                      className={`text-sm sm:text-base font-medium ${
                        isShippingFree() ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {formatPrice(getShippingCost())}
                    </span>
                  </div>
                </div>
                <div className="pt-3">
                  <div className="flex justify-between">
                    <span className="text-base sm:text-lg font-semibold">Total</span>
                    <span className="text-base sm:text-lg font-bold">
                      {formatPrice(
                        isShippingFree() ? getSubtotal() : getTotal()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Payment method
              </h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`text-sm sm:text-base ${
                    selectedPaymentMethod ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {selectedPaymentMethod || "Select payment method"}
                </span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>

              <button className="w-full mt-4 sm:mt-5 lg:mt-6 bg-blue-400 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors">
                Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSelect={(method) => {
          setSelectedPaymentMethod(method);
          setShowPaymentModal(false);
        }}
      />
    </div>
  );
}
