import { Star, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ReviewsProps {
  product: {
    rating: number;
    totalRatings: number;
  };
}

export function Reviews({ product }: ReviewsProps) {
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

  const renderRatingBar = (starCount: number, percentage: number) => (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium w-2">{starCount}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
        <div
          className="bg-yellow-400 h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  const reviews = [
    {
      id: 1,
      name: "Devon Lane",
      avatar: "/friend.png",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
    },
    {
      id: 2,
      name: "Devon Lane",
      avatar: "/friend.png",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
    },
    {
      id: 3,
      name: "Devon Lane",
      avatar: "/friend.png",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
    },
    {
      id: 4,
      name: "Devon Lane",
      avatar: "/friend.png",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
    },
    {
      id: 5,
      name: "Devon Lane",
      avatar: "/friend.png",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Rating Summary */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Product ratings & Reviews
          </h3>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="flex items-start space-x-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">4.8</div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {renderStars(5)}
            </div>
            <div className="text-sm text-gray-500">
              ({product.totalRatings || 14} Reviews)
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1 space-y-2">
            {renderRatingBar(5, 20)}
            {renderRatingBar(4, 10)}
            {renderRatingBar(3, 40)}
            {renderRatingBar(2, 35)}
            {renderRatingBar(1, 15)}
          </div>
        </div>
      </div>

      {/* Right side - Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-6 last:border-b-0"
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
                  <h4 className="font-medium text-blue-600">{review.name}</h4>
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.floor(review.rating))}
                    <span className="text-sm font-medium text-gray-700 ml-1">
                      ({review.rating})
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{review.comment}</p>
                <div className="text-sm text-gray-500">{review.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
