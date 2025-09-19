import Image from "next/image";

export default function HistoryPage() {
  const historyItems = [
    {
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      price: "₦300,550",
      quantity: "3pcs",
      date: "31 Jan, 2025",
      image: "/market.svg",
    },
    {
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      price: "₦300,550",
      quantity: "3pcs",
      date: "28 Jan, 2025",
      image: "/market.svg",
    },
    {
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      price: "₦300,550",
      quantity: "3pcs",
      date: "25 Jan, 2025",
      image: "/market.svg",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 p-3 sm:p-4 lg:p-6 min-h-screen bg-gray-50">
      {/* History Section */}
      <div className="flex-1 lg:mr-20">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
          Delivery History
        </h1>

        <div className="space-y-4 sm:space-y-6">
          {historyItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 w-full max-w-5xl shadow-sm"
            >
              {/* Product details */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      width={100}
                      height={120}
                      className="object-cover w-16 h-20 sm:w-20 sm:h-24"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 leading-relaxed mb-2">
                      We have delivered your order. tap to confirm receipt of
                      the pac <br className="hidden sm:block" />
                      <span className="font-medium">
                        {item.productName}
                      </span>, {item.productDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-base sm:text-lg text-gray-900">
                        {item.price}
                      </div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="text-center border bg-gray-50 rounded-lg py-2 sm:py-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  Date : {item.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADS/Promotion Section - stays hidden on mobile */}
      <div className="hidden lg:block w-[400px] mt-15">
        <div className="bg-gray-100 rounded-lg p-8 mb-4 h-48 flex items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900">ADS/Promotion</h2>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 mb-4 h-48 flex items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900">ADS/Promotion</h2>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 mb-4 h-48 flex items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900">ADS/Promotion</h2>
        </div>
      </div>
    </div>
  );
}
