import Image from "next/image";

export default function Alerts() {
  // Generate random order IDs
  const generateOrderId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';
    
    // Add 2-3 letters
    for (let i = 0; i < 3; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Add 4-5 numbers
    for (let i = 0; i < 4; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
  };

  const alertItems = [
    {
      orderId: generateOrderId(),
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      date: "31 Jan, 2025",
      image: "/market.svg",
    },
    {
      orderId: generateOrderId(),
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      date: "28 Jan, 2025",
      image: "/market.svg",
    },
    {
      orderId: generateOrderId(),
      productName: "Yoobao 300w Mini Power Station",
      productDescription: "Lorem ipsum dolor sit amet, consectetur akage",
      date: "25 Jan, 2025",
      image: "/market.svg",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 p-3 sm:p-4 lg:p-6 min-h-screen bg-gray-50">
      {/* Alerts Section */}
      <div className="flex-1 lg:mr-20">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
          Your new order is #{alertItems[0]?.orderId}
        </h1>

        <div className="space-y-4 sm:space-y-6">
          {alertItems.map((item, index) => (
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
                    <div className="flex items-start justify-start">
                      <button className="text-blue-400 hover:bg-blue-500  px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        See Details
                      </button>
                    </div>
                  </div>
                </div>
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