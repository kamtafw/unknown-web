"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductDetail } from "../homes/ProductDetail";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface DetailProduct extends ProductItem {
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
}

const likedProducts: ProductItem[] = [
  {
    id: "liked-power-station-1",
    name: "Yoobao 300w Mini Power Station",
    description: "Portable power station with documentation",
    price: 30000,
    image: "/market 9.svg",
  },
  {
    id: "liked-power-station-2",
    name: "Yoobao 300w Mini Power Station",
    description: "High-capacity portable power solution",
    price: 30000,
    image: "/market 2.svg",
  },
  {
    id: "liked-power-station-3",
    name: "Yoobao 300w Mini Power Station",
    description: "Compact and reliable power bank",
    price: 30000,
    image: "/market 3.svg",
  },
  {
    id: "liked-power-station-4",
    name: "Yoobao 300w Mini Power Station",
    description: "Professional grade power station",
    price: 30000,
    image: "/market 4.svg",
  },
  {
    id: "liked-power-station-5",
    name: "Yoobao 300w Mini Power Station",
    description: "Emergency backup power solution",
    price: 30000,
    image: "/market 5.svg",
  },
  {
    id: "liked-power-station-6",
    name: "Yoobao 300w Mini Power Station",
    description: "Travel-friendly power station",
    price: 30000,
    image: "/market.svg",
  },
  {
    id: "liked-power-station-7",
    name: "Yoobao 300w Mini Power Station",
    description: "Outdoor adventure power bank",
    price: 30000,
    image: "/market 3.svg",
  },
  {
    id: "liked-power-station-8",
    name: "Yoobao 300w Mini Power Station",
    description: "Home backup power solution",
    price: 30000,
    image: "/market 5.svg",
  },
  {
    id: "liked-power-station-9",
    name: "Yoobao 300w Mini Power Station",
    description: "Solar compatible power station",
    price: 30000,
    image: "/market 2.svg",
  },
  {
    id: "liked-power-station-10",
    name: "Yoobao 300w Mini Power Station",
    description: "Fast charging power bank",
    price: 30000,
    image: "/market 4.svg",
  },
  {
    id: "liked-power-station-11",
    name: "Yoobao 300w Mini Power Station",
    description: "Wireless charging power station",
    price: 30000,
    image: "/market 6.svg",
  },
  {
    id: "liked-power-station-12",
    name: "Yoobao 300w Mini Power Station",
    description: "Ultra-portable power solution",
    price: 30000,
    image: "/market 7.svg",
  },
  {
    id: "liked-power-station-13",
    name: "Yoobao 300w Mini Power Station",
    description: "Heavy-duty power station",
    price: 30000,
    image: "/market 8.svg",
  },
  {
    id: "liked-power-station-14",
    name: "Yoobao 300w Mini Power Station",
    description: "Smart power management system",
    price: 30000,
    image: "/market 9.svg",
  },
];

export function LikedProducts() {
  const [selectedProduct, setSelectedProduct] = useState<DetailProduct | null>(
    null
  );
  const [showProductDetail, setShowProductDetail] = useState(false);

  const handleProductClick = (productId: string) => {
    const product = likedProducts.find((p) => p.id === productId);
    if (product) {
      const detailProduct: DetailProduct = {
        ...product,
        images: [product.image, product.image, product.image, product.image],
        rating: 4.7,
        totalRatings: 23,
        soldCount: 23,
        vendor: {
          name: "Somto Power Ventures",
          avatar: "/vendor-avatar.svg",
          productsCount: 53,
          positiveReviews: "71.5%",
          storeRating: 4.4,
        },
        shipping: {
          price: 300550,
          delivery: "Jan 17 - 31",
        },
      };
      setSelectedProduct(detailProduct);
      setShowProductDetail(true);
    }
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  return (
    <>
      {showProductDetail && selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          onClose={handleCloseProductDetail}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Liked Products
            </h1>
          </div>

          {/* Products Section */}
          <div className="mb-2">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {likedProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group text-left border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="flex items-center justify-center p-2 sm:p-3 md:p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="object-contain transition-transform w-full h-20 sm:h-24 md:h-auto"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-2 sm:p-3 md:p-4">
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 mb-1 sm:mb-2">
                      {formatPrice(product.price)}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 text-xs sm:text-sm leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 hidden sm:block">
                      {product.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
