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
    <>
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

        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-8">
          {/* Left side - Image gallery */}
          <div className="lg:w-1/2">
            {/* Main image */}
            <div className="relative rounded-lg overflow-hidden mb-4">
              {/* Share and Favorite buttons on image */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
                <button
                  type="button"
                  className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoved(!isLoved)}
                  className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
                  aria-label={
                    isLoved ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isLoved ? "text-red-500 fill-current" : "text-gray-700"
                    }`}
                  />
                </button>
              </div>
              <div className="relative  ">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  width={1000}
                  height={1000}
                  className="object-cover w-full h-96"
                />
              </div>

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Previous image"
                  >
                    <FaArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Next image"
                  >
                    <FaArrowRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail images */}
            {product.images.length >= 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Product details */}
          <div className="lg:w-1/2 space-y-6">
            {/* Price */}
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>

            {/* Product name and description */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {product.name}, {product.description}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {product.rating} rated
              </span>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-500">
                {product.soldCount} sold on AppsCombo
              </span>
            </div>

            {/* Shipping info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Shipping: {formatPrice(product.shipping.price)}
                </div>
                <div className="text-sm text-gray-500">
                  Delivery: {product.shipping.delivery}
                </div>
              </div>
            </div>

            {/* Security info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
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
                aria-label="More vendor details"
                title="More vendor details"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Vendor info */}
            <div
              onClick={() => setShowSellerDetails(true)}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src="/friend.png"
                      alt={product.vendor.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.vendor.name}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center space-x-6 justify-between p-4 bg-gray-50 rounded-lg mt-2">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {product.vendor.productsCount}
                  </div>
                  <div className="text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {product.vendor.positiveReviews}
                  </div>
                  <div className="text-gray-500">Positive reviews</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {product.vendor.storeRating}
                  </div>
                  <div className="text-gray-500">Store rating</div>
                </div>
              </div>
            </div>

            {/* Add to cart button */}
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-full transition-colors">
              Add to cart: {formatPrice(product.price)}
            </button>
          </div>
        </div>
        {/* Tabbed Section */}
        <div className="max-w-7xl mx-auto p-4">
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
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
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
      <div className="py-6">
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
