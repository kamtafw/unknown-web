"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";

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

interface CategoryPageProps {
  category: CategoryItem;
  onClose: () => void;
}

const generateCategoryProducts = (categoryName: string): ProductItem[] => {
  const products: ProductItem[] = [];
  const imageFiles = [
    "/market.svg",
    "/market 2.svg",
    "/market 3.svg",
    "/market 4.svg",
    "/market 5.svg",
    "/market 6.svg",
    "/market 7.svg",
    "/market 8.svg",
    "/market 2.svg",
  ];

  for (let i = 1; i <= 14; i++) {
    const imageIndex = (i - 1) % imageFiles.length;
    products.push({
      id: `${categoryName.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      name: `Product ${i}`,
      description: `High quality ${categoryName.toLowerCase()} product with excellent features`,
      price: Math.floor(Math.random() * 50000) + 10000,
      image: imageFiles[imageIndex],
    });
  }

  return products;
};

export function CategoryPage({ category, onClose }: CategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState(() => generateCategoryProducts(category.name));

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const handleProductClick = (productId: string) => {
    console.log(`Clicked product: ${productId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {category.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group text-left"
          >
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="text-lg font-semibold text-blue-600 mb-2">
                {formatPrice(product.price)}
              </div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {product.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* No results message */}
      {filteredProducts.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400">
            Try adjusting your search terms or browse all products
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
