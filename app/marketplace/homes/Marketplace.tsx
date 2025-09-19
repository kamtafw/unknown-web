"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Search } from "lucide-react";
import { ProductDetail } from "./ProductDetail";
import { CategoryPage } from "./CategoryPage";

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

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

const categories: CategoryItem[] = [
  {
    id: "mobile",
    name: "Mobile phone and laptops",
    icon: "/mobile.svg",
    productCount: 500,
  },
  {
    id: "fashion",
    name: "Fashion and bags",
    icon: "/fashion.svg",
    productCount: 500,
  },
  {
    id: "furniture",
    name: "Furniture and woodworks",
    icon: "/furniture.svg",
    productCount: 500,
  },
  {
    id: "foods",
    name: "Foods and drinks",
    icon: "/foods.svg",
    productCount: 500,
  },
  {
    id: "automobiles",
    name: "Automobiles",
    icon: "/automobiles.svg",
    productCount: 500,
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "/electronics.svg",
    productCount: 500,
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "/kitchen.svg",
    productCount: 500,
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "/gaming.svg",
    productCount: 500,
  },
];

const products: ProductItem[] = [
  {
    id: "power-station-1",
    name: "Yoobao 300w Mini Power Station",
    description: "Portable power station with documentation",
    price: 30000,
    image: "/market.svg",
  },
  {
    id: "power-station-2",
    name: "Yoobao 300w Mini Power Station",
    description: "High-capacity portable power solution",
    price: 30000,
    image: "/market 2.svg",
  },
  {
    id: "power-station-3",
    name: "Yoobao 300w Mini Power Station",
    description: "Compact and reliable power bank",
    price: 30000,
    image: "/market 3.svg",
  },
  {
    id: "power-station-4",
    name: "Yoobao 300w Mini Power Station",
    description: "Professional grade power station",
    price: 30000,
    image: "/market 4.svg",
  },
  {
    id: "power-station-5",
    name: "Yoobao 300w Mini Power Station",
    description: "Emergency backup power solution",
    price: 30000,
    image: "/market 5.svg",
  },
  {
    id: "power-station-6",
    name: "Yoobao 300w Mini Power Station",
    description: "Travel-friendly power station",
    price: 30000,
    image: "/market.svg",
  },
  {
    id: "power-station-7",
    name: "Yoobao 300w Mini Power Station",
    description: "Outdoor adventure power bank",
    price: 30000,
    image: "/market 3.svg",
  },
  {
    id: "power-station-8",
    name: "Yoobao 300w Mini Power Station",
    description: "Home backup power solution",
    price: 30000,
    image: "/market 5.svg",
  },
];

export function Marketplace() {
  const [selectedProduct, setSelectedProduct] = useState<DetailProduct | null>(
    null
  );
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
const [showCategoryPage, setShowCategoryPage] = useState(false);

const handleCategoryClick = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  if (category) {
    setSelectedCategory(category);
    setShowCategoryPage(true);
  }
};

const handleCloseCategoryPage = () => {
  setShowCategoryPage(false);
  setSelectedCategory(null);
};

  const handleProductClick = (productId: string) => {
    const product = products.find((p) => p.id === productId);
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
    {showCategoryPage && selectedCategory ? (
      <CategoryPage
        category={selectedCategory}
        onClose={handleCloseCategoryPage}
      />
    ) : showProductDetail && selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          onClose={handleCloseProductDetail}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Marketplace
            </h1>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group w-full text-left"
              >
                <div className="flex items-center space-x-4">
                  {/* Icon Container */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Image
                      src={category.icon}
                      alt={`${category.name} icon`}
                      width={43}
                      height={43}
                      style={{ width: "50px", height: "50px" }}
                      className="object-contain"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {category.productCount} products
                    </p>
                  </div>
                </div>

                {/* Chevron Icon */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Products Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Featured Products
            </h2>

            {/* Products Grid - 4 columns, 2 rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group text-left"
                >
                  {/* Product Image */}
                  <div className="flex items-center justify-center p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="object-contain transition-transform"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="text-lg font-semibold text-blue-600 mb-2">
                      {formatPrice(product.price)}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
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
