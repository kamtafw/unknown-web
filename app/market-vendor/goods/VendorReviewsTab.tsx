import Image from "next/image";
import { Star, ChevronRight } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

interface VendorReviewsTabProps {
  totalReviews?: number;
  averageRating?: number;
  onOpenModal?: () => void;
}

export function VendorReviewsTab({
  totalReviews = 14,
  averageRating = 4.8,
  onOpenModal,
}: VendorReviewsTabProps) {
  const ratingBreakdown = [
    { stars: 5, count: 10, percentage: 20 },
    { stars: 4, count: 3, percentage: 10 },
    { stars: 3, count: 1, percentage: 40 },
    { stars: 2, count: 0, percentage: 35 },
    { stars: 1, count: 0, percentage: 15 },
  ];

  const reviews: Review[] = [
    {
      id: "1",
      userName: "Devon Lane",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
      avatar: "/friend.png",
    },
    {
      id: "2",
      userName: "Devon Lane",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
      avatar: "/friend.png",
    },
    {
      id: "3",
      userName: "Devon Lane",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
      avatar: "/friend.png",
    },
    {
      id: "4",
      userName: "Devon Lane",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
      avatar: "/friend.png",
    },
    {
      id: "5",
      userName: "Devon Lane",
      rating: 4.7,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      date: "31/01/2024 - 19:30",
      avatar: "/friend.png",
    },
  ];

  const renderStars = (rating: number, showRating: boolean = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center space-x-1">
        {stars}
        {showRating && (
          <span className="ml-2 text-sm font-medium">({rating})</span>
        )}
      </div>
    );
  };

  const renderRatingBar = (starCount: number, percentage: number) => (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium w-2">{starCount}</span>
      <div className="w-90 bg-gray-200 rounded-full h-1.5 relative overflow-hidden mx-3">
        <div
          className="bg-yellow-400 h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-0">
      {/* Left side - Rating Overview */}
      <div>
        <div className="flex items-center justify-between mb-6 ml-0 lg:ml-9" onClick={onOpenModal}>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Product ratings & Reviews
          </h3>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-2 lg:ml-55" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 ml-0 lg:ml-9 space-y-4 sm:space-y-0 sm:space-x-2">
          {/* Overall Rating */}
          <div className="text-center sm:text-left">
            <div className="text-4xl sm:text-6xl font-bold text-gray-900 mb-2">
              {averageRating}
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-1 mb-2">
              {renderStars(5)}
            </div>
            <div className="text-sm text-gray-500">
              ({totalReviews} Reviews)
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1 w-full sm:w-auto space-y-2">
            {ratingBreakdown.map((item) => (
              <div key={item.stars}>
                {renderRatingBar(item.stars, item.percentage)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Reviews List */}
      <div className="space-y-4 sm:space-y-6">
        {/* Reviews */}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0"
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={review.avatar}
                  alt={review.userName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <h4 className="font-medium text-blue-600 truncate">
                    {review.userName}
                  </h4>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {renderStars(Math.floor(review.rating))}
                    <span className="text-sm font-medium text-gray-700 ml-1">
                      ({review.rating})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-2 text-sm sm:text-base">{review.comment}</p>

                <div className="text-xs sm:text-sm text-gray-500">{review.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
