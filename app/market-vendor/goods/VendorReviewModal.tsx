"use client";

import { useState } from "react";
import { X, Search, Star, Trash2 } from "lucide-react";
import Image from "next/image";

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

interface VendorReviewModalProps {
  vendor: {
    rating: number;
    totalRatings: number;
    name: string;
  };
  onClose: () => void;
}

export function VendorReviewModal({ onClose }: VendorReviewModalProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [reviewImages, setReviewImages] = useState<{[key: number]: string[]}>({
    1: ["/review 1.svg", "/review 2.svg", "/review 3.svg"]
  });

  const handleImageDelete = (reviewId: number, imageIndex: number) => {
    setReviewImages(prev => ({
      ...prev,
      [reviewId]: prev[reviewId]?.filter((_, index) => index !== imageIndex) || []
    }));
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

  const reviews: Review[] = [
    {
      id: 1,
      name: "Devon Lane",
      avatar: "/friend.png",
      rating: 4.7,
      comment:
        "Great vendor with excellent customer service. Products arrived on time and in perfect condition.",
      date: "31/01/2024 - 19:30",
      images: reviewImages[1] || [],
    },
    {
      id: 2,
      name: "Sarah Wilson",
      avatar: "/friend.png",
      rating: 5,
      comment:
        "Outstanding vendor! Fast shipping and quality products. Will definitely order again.",
      date: "28/01/2024 - 14:15",
    },
    {
      id: 3,
      name: "Mike Johnson",
      avatar: "/friend.png",
      rating: 3,
      comment:
        "Good products but communication could be better. Delivery was slightly delayed.",
      date: "25/01/2024 - 10:22",
    },
    {
      id: 4,
      name: "Emma Davis",
      avatar: "/friend.png",
      rating: 4,
      comment:
        "Reliable vendor with good product quality. Had a minor issue but it was resolved quickly.",
      date: "20/01/2024 - 16:45",
    },
    {
      id: 5,
      name: "James Brown",
      avatar: "/friend.png",
      rating: 2,
      comment:
        "Product was not as described. Customer service was slow to respond.",
      date: "15/01/2024 - 11:30",
    },
    {
      id: 6,
      name: "Lisa Anderson",
      avatar: "/friend.png",
      rating: 1,
      comment:
        "Very disappointed with the service. Product quality was poor and return process was difficult.",
      date: "10/01/2024 - 09:15",
    },
  ];

  const filterButtons = [
    { label: "All", icon: "👍" },
    { label: "5", icon: "⭐" },
    { label: "4", icon: "⭐" },
    { label: "3", icon: "⭐" },
    { label: "2", icon: "⭐" },
    { label: "1", icon: "⭐" },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (activeFilter === "All") return true;
    return Math.floor(review.rating) === parseInt(activeFilter);
  });


  return (
    <div
      className="fixed inset-0 bg-black/80 bg-opacity-30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                Vendor Ratings & Reviews
              </h1>
            </div>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search reviews"
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Ratings & Reviews Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Vendor Ratings & Reviews
          </h2>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterButtons.map((button) => (
              <button
                key={button.label}
                onClick={() => setActiveFilter(button.label)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === button.label
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{button.icon}</span>
                <span>{button.label}</span>
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-600">
                        {review.name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.floor(review.rating))}
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          ({review.rating})
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <div className="text-sm text-gray-500 mb-3">
                      {review.date}
                    </div>

                    {/* Review Images with Delete and Add functionality */}
                    <div className="flex gap-3 flex-wrap mb-2">
                      {reviewImages[review.id]?.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden bg-gray-100"
                        >
                          <Image
                            src={image}
                            alt={`Review image ${index + 1}`}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleImageDelete(review.id, index)}
                            className="absolute top-5 right-6 bg-black/80 text-white rounded-full p-1 transition-opacity"
                            aria-label="Delete image"
                          >
                            <Trash2 className="w-9 h-9" />
                          </button>
                        </div>
                      ))}
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews found for this rating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}