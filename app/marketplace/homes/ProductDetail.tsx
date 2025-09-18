"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Share2,
  Heart,
  ChevronRight,
  Star,
  Shield,
  Truck,
} from "lucide-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Description } from "./Description";
import { Reviews } from "./Reviews";
import { SimilarProducts } from "./SimilarProducts";
import { SellerDetails } from "./SellerDetails";
import { ReviewsModal } from "./ReviewsModal";
import { CartModal } from "./CartModal";

interface ProductDetailProps {
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

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoved, setIsLoved] = useState(false);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  if (showSellerDetails) {
    return (
      <SellerDetails
        vendor={product.vendor}
        onBack={() => setShowSellerDetails(false)}
      />
    );
  }

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = i === Math.floor(rating) && rating % 1 >= 0.5;

      return (
        <div key={i} className="relative">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
          {(isFull || isHalf) && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: isFull ? "100%" : "50%" }}
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="bg-white min-h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 sticky top-0 bg-white z-10 shadow-sm">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-2 sm:p-4 lg:p-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left side - Image gallery */}
          <div className="w-full lg:w-1/2">
            {/* Main image */}
            <div className="relative rounded-lg overflow-hidden mb-3 sm:mb-4">
              {/* Share and Favorite buttons on image */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center space-x-1 sm:space-x-2 z-20">
                <button
                  type="button"
                  className="p-1.5 sm:p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoved(!isLoved)}
                  className="p-1.5 sm:p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
                  aria-label={
                    isLoved ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                      isLoved ? "text-red-500 fill-current" : "text-gray-700"
                    }`}
                  />
                </button>
              </div>
              <div className="relative">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  width={1000}
                  height={1000}
                  className="object-cover w-full h-64 sm:h-80 md:h-96"
                />
              </div>

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Previous image"
                  >
                    <FaArrowLeft className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Next image"
                  >
                    <FaArrowRight className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail images */}
            {product.images.length >= 1 && (
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Product details */}
          <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
            {/* Price */}
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>

            {/* Product name and description */}
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">
                {product.name}, {product.description}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <span className="font-medium text-gray-700">
                  {product.rating} rated
                </span>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <span className="text-gray-500">
                  {product.soldCount} sold on AppsCombo
                </span>
              </div>
            </div>

            {/* Shipping info */}
            <div className="flex items-start sm:items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm sm:text-base">
                  Shipping: {formatPrice(product.shipping.price)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Delivery: {product.shipping.delivery}
                </div>
              </div>
            </div>

            {/* Security info */}
            <div className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm sm:text-base">
                    Security & Privacy
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-tight">
                    We protect your privacy and keep your personal details safe
                  </div>
                </div>
              </div>
              <button
                className="p-1 flex-shrink-0"
                aria-label="More vendor details"
                title="More vendor details"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>

            {/* Vendor info */}
            <div
              onClick={() => setShowSellerDetails(true)}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src="/friend.png"
                      alt={product.vendor.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                      {product.vendor.name}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg mt-2">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {product.vendor.productsCount}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">Products</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {product.vendor.positiveReviews}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">Positive reviews</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {product.vendor.storeRating}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">Store rating</div>
                </div>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={() => setShowCartModal(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-colors text-sm sm:text-base"
            >
              Add to cart: {formatPrice(product.price)}
            </button>
          </div>
        </div>
        {/* Tabbed Section */}
        <div className="max-w-7xl mx-auto p-2 sm:p-4">
          <ProductTabs
            product={product}
            setShowReviewsModal={setShowReviewsModal}
          />
        </div>
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && (
        <ReviewsModal
          product={product}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
      {/* Cart Modal */}
      {showCartModal && (
        <CartModal product={product} onClose={() => setShowCartModal(false)} />
      )}
    </>
  );
}

function ProductTabs({
  product,
  setShowReviewsModal,
}: {
  product: ProductDetailProps["product"];
  setShowReviewsModal: (show: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: "Reviews & Ratings" },
    { id: "similar", label: "Similar product" },
  ];

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4 sm:py-6">
        {activeTab === "description" && <Description product={product} />}

        {activeTab === "reviews" && (
          <Reviews
            product={product}
            onShowReviewsModal={() => setShowReviewsModal(true)}
          />
        )}

        {activeTab === "similar" && <SimilarProducts />}
      </div>
    </div>
  );
}
