import Image from "next/image";


export function SimilarProducts() {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const similarProducts = [
    {
      id: 1,
      image: "/market.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation...",
    },
    {
      id: 2,
      image: "/market 2.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 3,
      image: "/market 3.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 4,
      image: "/market 4.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 5,
      image: "/market 5.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation...",
    },
    {
      id: 6,
      image: "/market 6.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 7,
      image: "/market 7.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 8,
      image: "/market 8.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 9,
      image: "/market.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation...",
    },
    {
      id: 10,
      image: "/market 2.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 11,
      image: "/market 3.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
    {
      id: 12,
      image: "/market 4.svg",
      price: 30000,
      name: "Yoobao 300w Mini Power Station, documentation",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similarProducts.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
           <div className="">
              <Image
                src={item.image}
                alt={item.name}
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4">
              <div className="text-blue-600 font-semibold text-lg mb-2">
                {formatPrice(item.price)}
              </div>
              <h4 className="text-gray-900 text-sm line-clamp-2 leading-relaxed">
                {item.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}