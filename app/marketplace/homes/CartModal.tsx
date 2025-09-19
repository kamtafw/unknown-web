"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, Shield, Truck, Star } from "lucide-react";

interface CartModalProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    rating: number;
    totalRatings: number;
    soldCount: number;
    vendor: {
      name: string;
      avatar: string;
      productsCount: number;
      positiveReviews: string;
      storeRating: number;
    };
    shipping: {
      price: number;
      delivery: string;
    };
  };
  onClose: () => void;
}

export function CartModal({ product, onClose }: CartModalProps) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      // Set max limit to 10
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = i === Math.floor(rating) && rating % 1 >= 0.5;

      return (
        <div key={i} className="relative">
          <Star className="w-3 h-3 text-gray-300" />
          {(isFull || isHalf) && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: isFull ? "100%" : "50%" }}
            >
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
          )}
        </div>
      );
    });
  };

  const totalPrice = product.price * quantity;
  const unitsLeft = 16;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-4 animate-slide-up">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={200}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Price */}
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(totalPrice)}
          </div>

          {/* Product Info */}
          <div className="flex space-x-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                {product.name}, {product.description}
              </h3>
              <div className="flex items-center space-x-1 mb-1">
                {renderStars(product.rating)}
                <span className="text-xs text-gray-500 ml-1">
                  {product.rating} rated | {product.soldCount} sold on AppsCombo
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Shipping: {formatPrice(product.shipping.price)}
              </div>
              <div className="text-xs text-gray-500">
                Delivery: {product.shipping.delivery}
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Security & Privacy
              </div>
              <div className="text-xs text-gray-500">
                We protect your privacy and keep your personal details safe
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quantity</span>

            <div className="flex items-center bg-gray-100 rounded-full px-5">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-blue-600" />
              </button>

              <div className="text-sm font-medium text-gray-900 px-8 min-w-[2rem] text-center">
                {quantity}
              </div>

              <button
                onClick={increaseQuantity}
                disabled={quantity >= 10}
                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <span className="text-xs text-blue-500">
              {unitsLeft} units left
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-full transition-colors mt-6"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
