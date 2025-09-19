interface DescriptionProps {
  product: {
    description: string;
    specs?: {
      mah: string;
      weight: string;
      chargingTime: string;
    };
  };
}

export function Description({ product }: DescriptionProps) {
  const specs = product.specs || {
    mah: "600",
    weight: "12KG",
    chargingTime: "3 hours",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Description */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Description
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim
        </p>
      </div>

      {/* Right side - Specs */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Specs</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium">
              MAH
            </div>
            <div className="p-4 border-b border-gray-200">{specs.mah}</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium">
              Weight
            </div>
            <div className="p-4 border-b border-gray-200">{specs.weight}</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 bg-gray-50 font-medium">Charging time</div>
            <div className="p-4">{specs.chargingTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
