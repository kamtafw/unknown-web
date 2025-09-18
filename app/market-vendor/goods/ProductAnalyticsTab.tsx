import Image from "next/image";
import { Info } from "lucide-react";

interface Transaction {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  date: string;
  image: string;
}

interface ProductAnalyticsTabProps {
  totalSales?: number;
  salesIncrease?: number;
  transactions?: Transaction[];
}

export function ProductAnalyticsTab({
  totalSales = 30000000,
  salesIncrease = 20,
  transactions = []
}: ProductAnalyticsTabProps) {
  const defaultTransactions: Transaction[] = [
    {
      id: "1",
      productName: "We have delivered your order. tap to confirm receipt of the pacYoobao 300w Mini Power Station, Lorem ipsum dolor sit amet, consectetur akage",
      price: 300550,
      quantity: 3,
      date: "31 Jan, 2025",
      image: "/market.svg"
    },
    {
      id: "2", 
      productName: "We have delivered your order. tap to confirm receipt of the pacYoobao 300w Mini Power Station, Lorem ipsum dolor sit amet, consectetur akage",
      price: 300550,
      quantity: 3,
      date: "31 Jan, 2025",
      image: "/market.svg"
    },
    {
      id: "3",
      productName: "We have delivered your order. tap to confirm receipt of the pacYoobao 300w Mini Power Station, Lorem ipsum dolor sit amet, consectetur akage", 
      price: 300550,
      quantity: 3,
      date: "31 Jan, 2025",
      image: "/market.svg"
    }
  ];

  const transactionList = transactions.length > 0 ? transactions : defaultTransactions;

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

//   const chartData = [
//     { month: 'Jan', value: 100 },
//     { month: 'Feb', value: 150 },
//     { month: 'Mar', value: 120 },
//     { month: 'Apr', value: 110 },
//     { month: 'May', value: 180 },
//     { month: 'Jun', value: 250 },
//     { month: 'Jul', value: 400 }
//   ];

  const timeFilters = ['3m', '6m', '1y', '2y', 'Max'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Sales Analytics */}
      <div>
        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Sales</h3>
              <p className="text-sm text-gray-600">Worldwide</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(totalSales)}</div>
              <div className="text-sm text-green-600">+{salesIncrease} pcs</div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative h-48 mb-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>1k+</span>
              <span>500</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>10</span>
            </div>
            
            {/* Chart container */}
            <div className="ml-8 h-full relative">
              {/* Chart line simulation */}
              <svg className="w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points="0,150 50,120 100,130 150,135 200,90 250,60 300,45"
                  className="drop-shadow-sm"
                />
                <circle cx="300" cy="45" r="4" fill="#3b82f6" />
                <line x1="300" y1="45" x2="300" y2="180" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" />
                <text x="305" y="40" className="text-xs fill-gray-700">5510</text>
              </svg>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-500 mb-4 ml-8">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>

          {/* Time filters */}
          <div className="flex space-x-4">
            {timeFilters.map((filter, index) => (
              <button
                key={filter}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  index === 2 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Transactions */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <Info className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-4">
          {transactionList.map((transaction) => (
            <div key={transaction.id} className=" p-4">
              <div className="flex items-start space-x-3">
                {/* Product Image */}
                <div className="w-20 h-25 relative">
                  <Image
                    src={transaction.image}
                    alt="Product"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Transaction Details */}
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {transaction.productName}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(transaction.price)}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {transaction.quantity}pcs
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2 bg-gray-100 rounded-lg py-3 text-center">
                    Date : {transaction.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}