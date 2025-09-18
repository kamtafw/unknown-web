"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronRight,
  Star,
  Shield,
  Truck,
  Trash2,
  Edit3,
} from "lucide-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoMdShare } from "react-icons/io";
import { FaChartSimple } from "react-icons/fa6";
import { VendorDescriptionTab } from "./VendorDescriptionTab";
import { VendorReviewsTab } from "./VendorReviewsTab";
import { ProductAnalyticsTab } from "./ProductAnalyticsTab";
import { VendorReviewModal } from "./VendorReviewModal";
import { AddEditProductModal } from "./AddEditProductModal";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface VendorProductDetailProps {
  product: ProductItem;
  onClose: () => void;
  onRemove?: (productId: string) => void;
  onEdit?: (productId: string) => void;
}

export function VendorProductDetail({
  product = {
    id: "1",
    name: "Sample Product",
    description:
      "This is a sample product description for demonstration purposes.",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  },
  onClose = () => {},
  onRemove,
}: VendorProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image,
  ];

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: "Reviews & Ratings" },
    { id: "analytics", label: "Product analytics" },
  ];

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = i === Math.floor(rating) && rating % 1 >= 0.5;

      return (
        <div key={i} className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          {(isFull || isHalf) && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: isFull ? "100%" : "50%" }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-white min-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-white z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row max-w-8xl mx-auto p-2 lg:p-4 gap-4 lg:gap-8">
        {/* Left side - Image gallery */}
        <div className="w-full lg:w-[600px]">
          <div className="relative rounded-lg overflow-hidden mb-4">
            <div className="absolute top-3 right-2 lg:right-[55px] flex items-center space-x-2 z-20">
              <button
                type="button"
                className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
                aria-label="Share"
              >
                <IoMdShare className="w-6 h-6 text-black" />
              </button>
              <button
                type="button"
                className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
                aria-label="More options"
              >
                <FaChartSimple className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="relative h-64 w-full lg:h-110 lg:w-[550px]">
              {/* Main image */}
              <Image
                src={productImages[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Navigation arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  aria-label="Previous image"
                >
                  <FaArrowLeft className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 lg:right-[55px] top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  aria-label="Next image"
                >
                  <FaArrowRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail images */}
         <div className="flex space-x-2 lg:space-x-3 overflow-x-auto pb-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  currentImageIndex === index
                    ? "border-blue-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                aria-label={`View image ${index + 1} of ${product.name}`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={120}
                  height={90}
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right side - Product details */}
        <div className="w-full lg:w-1/3 space-y-6 lg:space-y-8">
          {/* Price */}
          <div className="text-2xl lg:text-3xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </div>

          {/* Product name and description */}
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(4.7)}
            </div>
            <span className="text-sm font-medium text-gray-700">4.7 rated</span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-500">23 sold on AppsCombo</span>
          </div>

          {/* Shipping info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Shipping: {formatPrice(300550)}
              </div>
              <div className="text-sm text-gray-500">Delivery: Jan 17 - 31</div>
            </div>
          </div>

          {/* Security info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Security & Privacy
                </div>
                <div className="text-sm text-gray-500">
                  We protect your privacy and keep your personal details safe
                </div>
              </div>
            </div>
            <button
              className="p-1"
              aria-label="More details"
              title="More details"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Action buttons - Remove and Edit */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onRemove?.(product.id)}
              className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4 text-blue-300" />
              <span className="text-blue-300">Remove</span>
            </button>
            <button
              onClick={() => setShowEditProductModal(true)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-8xl mx-auto px-2 lg:px-4 mt-4 lg:mt-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 lg:space-x-15 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 lg:px-1 text-xs lg:text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-4 lg:py-8 min-h-64">
          {activeTab === "description" && (
            <VendorDescriptionTab product={product} />
          )}
          {activeTab === "reviews" && (
            <VendorReviewsTab onOpenModal={() => setShowReviewModal(true)} />
          )}
          {activeTab === "analytics" && <ProductAnalyticsTab />}
        </div>
      </div>
      {showReviewModal && (
        <VendorReviewModal
          vendor={{
            rating: 4.7,
            totalRatings: 23,
            name: product.name,
          }}
          onClose={() => setShowReviewModal(false)}
        />
      )}
      {showEditProductModal && (
        <AddEditProductModal
          isEdit={true}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            images: productImages,
          }}
          onClose={() => setShowEditProductModal(false)}
          onSave={(productData) => {
            console.log("Updated product:", productData);
            setShowEditProductModal(false);
          }}
        />
      )}
    </div>
  );
}
