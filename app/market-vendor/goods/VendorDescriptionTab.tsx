interface ProductDescriptionTabProps {
  product: {
    name: string;
    description: string;
  };
}

export function VendorDescriptionTab({}: ProductDescriptionTabProps) {
  const specs = [
    { label: "MAH", value: "600" },
    { label: "Weight", value: "12KG" },
    { label: "Charging time", value: "3 hours" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-8xl">
      {/* Left side - Description */}
      <div className="lg:w-[800px]">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Description
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim
        </p>
      </div>

      {/* Right side - Specs */}
      <div className="lg:w-[400px]">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Specs</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-2">
              <div
                className={`p-4 ${
                  index !== specs.length - 1 ? "border-b border-gray-200" : ""
                } bg-gray-50 font-medium`}
              >
                {spec.label}
              </div>
              <div
                className={`p-4 ${
                  index !== specs.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
