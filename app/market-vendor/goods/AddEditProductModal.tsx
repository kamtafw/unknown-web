"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Plus, Info } from "lucide-react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
}

interface ProductData {
  name: string;
  price: number;
  images: string[];
  discount: number;
}

interface AddEditProductModalProps {
  isEdit?: boolean;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
  };
  onClose: () => void;
  onSave?: (productData: ProductData) => void;
}

export function AddEditProductModal({
  isEdit = false,
  product,
  onClose,
  onSave,
}: AddEditProductModalProps) {
  const [productName, setProductName] = useState(product?.name || "");
  const [productPrice, setProductPrice] = useState(
    product?.price?.toString() || ""
  );
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [images, setImages] = useState<ProductImage[]>(
    product?.images.map((url, index) => ({ id: `${index}`, url })) || [
      { id: "1", url: "/market 9.svg" },
      { id: "2", url: "/market 2.svg" },
      { id: "3", url: "/market 3.svg" },
      { id: "4", url: "/market 4.svg" },
      { id: "5", url: "/market 5.svg" },
      { id: "6", url: "/market 6.svg" },
    ]
  );

  const handleImageDelete = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleImageAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newImage: ProductImage = {
        id: Date.now().toString(),
        url: imageUrl,
      };
      setImages((prev) => [...prev, newImage]);
    }
  };

  const handleSave = () => {
    const productData = {
      name: productName,
      price: parseFloat(productPrice),
      images: images.map((img) => img.url),
      discount: hasDiscount ? parseInt(discountPercentage) : 0,
    };
    onSave?.(productData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 bg-opacity-30 z-50 flex items-center justify-center p-8 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-[90vw] max-w-md h-[80vh] sm:h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-3 sm:px-4 py-3 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-base sm:text-lg font-medium text-gray-900">
              {isEdit ? "Edit product" : "Add/List product"}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Add Images Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-base font-medium text-gray-900">
                Add Images (6 Max)
              </h3>
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                >
                  <Image
                    src={image.url}
                    alt="Product image"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleImageDelete(image.id)}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
                    aria-label="Delete image"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}

              {images.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-center">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageAdd}
                    aria-label="Add product image"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
              Product name
            </label>
            <div className="relative">
              <textarea
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
                rows={3}
                maxLength={100}
              />
              <div className="absolute bottom-1 right-2 sm:bottom-2 text-xs text-gray-500">
                {productName.length}/100
              </div>
            </div>
          </div>

          {/* Product Price */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
              Product Price (₦)
            </label>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="₦"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>

          {/* Add Discount */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  Add Discount
                </span>
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => setHasDiscount(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle discount"
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-400"></div>
              </label>
            </div>

            {hasDiscount && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 border border-gray-300 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600">%</span>
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="0"
                  className="flex-1 outline-none text-xs sm:text-sm"
                  min="0"
                  max="100"
                />
                <span className="text-xs text-gray-500">
                  (₦
                  {hasDiscount
                    ? (
                        (parseFloat(productPrice) *
                          (100 - parseInt(discountPercentage))) /
                        100
                      ).toFixed(2)
                    : "0.00"}
                  )
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
