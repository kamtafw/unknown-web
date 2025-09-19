"use client";

import { useState } from "react";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import { VscListFilter } from "react-icons/vsc";
import { VendorProductDetail } from "./VendorProductDetail";
import { AddEditProductModal } from "./AddEditProductModal";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const allProducts: ProductItem[] = [
  {
    id: "product-1",
    name: "Yoobao 300w Mini Power Station",
    description: "Portable power station with documentation",
    price: 30000,
    image: "/market 9.svg",
  },
  {
    id: "product-2",
    name: "Yoobao 300w Mini Power Station",
    description: "High-capacity portable power solution",
    price: 30000,
    image: "/market 2.svg",
  },
  {
    id: "product-3",
    name: "Yoobao 300w Mini Power Station",
    description: "Compact and reliable power bank",
    price: 30000,
    image: "/market 3.svg",
  },
  {
    id: "product-4",
    name: "Yoobao 300w Mini Power Station",
    description: "Professional grade power station",
    price: 30000,
    image: "/market 4.svg",
  },
  {
    id: "product-5",
    name: "Yoobao 300w Mini Power Station",
    description: "Emergency backup power solution",
    price: 30000,
    image: "/market 5.svg",
  },
  {
    id: "product-6",
    name: "Yoobao 300w Mini Power Station",
    description: "Travel-friendly power station",
    price: 30000,
    image: "/market.svg",
  },
  {
    id: "product-7",
    name: "Yoobao 300w Mini Power Station",
    description: "Outdoor adventure power bank",
    price: 30000,
    image: "/market 3.svg",
  },
  {
    id: "product-8",
    name: "Yoobao 300w Mini Power Station",
    description: "Home backup power solution",
    price: 30000,
    image: "/market 5.svg",
  },
  {
    id: "product-9",
    name: "Yoobao 300w Mini Power Station",
    description: "Solar compatible power station",
    price: 30000,
    image: "/market 2.svg",
  },
  {
    id: "product-10",
    name: "Yoobao 300w Mini Power Station",
    description: "Fast charging power bank",
    price: 30000,
    image: "/market 4.svg",
  },
  {
    id: "product-11",
    name: "Yoobao 300w Mini Power Station",
    description: "Wireless charging power station",
    price: 30000,
    image: "/market 6.svg",
  },
  {
    id: "product-12",
    name: "Yoobao 300w Mini Power Station",
    description: "Ultra-portable power solution",
    price: 30000,
    image: "/market 7.svg",
  },
];

export function GoodsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const handleProductClick = (product: ProductItem) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const handleRemoveProduct = (productId: string) => {
    // Add your remove logic here
    console.log("Remove product:", productId);
    setSelectedProduct(null);
  };

  const handleEditProduct = (productId: string) => {
    console.log("Edit product:", productId);
  };

  if (selectedProduct) {
    return (
      <VendorProductDetail
        product={selectedProduct}
        onClose={handleCloseDetail}
        onRemove={handleRemoveProduct}
        onEdit={handleEditProduct}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Section */}
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            {/* Product Count and List Button */}
            <div className="flex sm:hidden items-center gap-4 justify-between">
              <h1 className="text-lg font-bold text-black">
                {filteredProducts.length} Products Listed
              </h1>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowAddProductModal(true)}
              >
                List product
              </button>
            </div>

            {/* Desktop: Product Count */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-medium text-gray-900">
                {filteredProducts.length} Products Listed
              </h1>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              <button
                className="hidden sm:block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowAddProductModal(true)}
              >
                List product
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                />
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button
                type="button"
                aria-label="Filter products"
                className="border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <VscListFilter className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group text-left overflow-hidden"
              >
                {/* Product Image */}
                <div className="bg-gray-50 flex items-center justify-center p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="text-lg font-semibold text-blue-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* No Results Message */}
          {filteredProducts.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                No products found
              </div>
              <p className="text-gray-400">
                Try adjusting your search terms or browse all products
              </p>
            </div>
          )}
        </div>
      </div>
      {selectedProduct && (
        <VendorProductDetail
          product={selectedProduct}
          onClose={handleCloseDetail}
          onRemove={handleRemoveProduct}
          onEdit={handleEditProduct}
        />
      )}
      {showAddProductModal && (
        <AddEditProductModal
          isEdit={false}
          onClose={() => setShowAddProductModal(false)}
          onSave={(productData) => {
            console.log("New product:", productData);
            setShowAddProductModal(false);
          }}
        />
      )}
    </>
  );
}
