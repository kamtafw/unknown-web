"use client";

import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";

interface SellerDetailsProps {
  vendor: {
    name: string;
    avatar: string;
    productsCount: number;
    positiveReviews: string;
    storeRating: number;
  };
  onBack: () => void;
}

export function SellerDetails({ vendor, onBack }: SellerDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const products = [
    {
      image: "/market.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 2.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 3.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 4.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 5.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 9.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 7.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 8.svg",
      name: "Yoobao 300w Mini Power Station, documentation",
      price: "₦30,000",
    },
    {
      image: "/market 9.svg",
      name: "Wireless Bluetooth Headphones",
      price: "₦15,000",
    },
    {
      image: "/market 2.svg",
      name: "Samsung Galaxy Phone Case",
      price: "₦5,000",
    },
    {
      image: "/market 3.svg",
      name: "LED Desk Lamp with USB Charging",
      price: "₦12,000",
    },
    {
      image: "/market 4.svg",
      name: "Portable External Hard Drive",
      price: "₦25,000",
    },
    { image: "/market 5.svg", name: "Coffee Maker Machine", price: "₦45,000" },
    { image: "/market 6.svg", name: "Fitness Tracker Watch", price: "₦18,000" },
  ];

 
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-medium text-gray-900">
            Seller details
          </span>
        </div>
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Search"
        >
          <Search className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Seller Info */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200  rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src="/friend.png"
              alt={vendor.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {vendor.name}
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 rounded-lg">
          <div className="text-center p-4  rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {vendor.productsCount}
            </div>
            <div className="text-sm text-gray-500">Products</div>
          </div>
          <div className="text-center p-4  rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {vendor.positiveReviews}
            </div>
            <div className="text-sm text-gray-500">Positive reviews</div>
          </div>
          <div className="text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {vendor.storeRating}
            </div>
            <div className="text-sm text-gray-500">Store rating</div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Products {searchQuery && `(${filteredProducts.length} results)`}
          </h2>
          {filteredProducts.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
          <div className="grid grid-cols-4 gap-3">
            {filteredProducts.map((product, index) => {
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group text-left"
                >
                  <div className="flex items-center justify-center ">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-blue-600 font-semibold text-lg mb-2">
                     {product.price}
                    </div>
                    <div className="text-gray-900 text-sm line-clamp-2 leading-relaxed">
                      {product.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
