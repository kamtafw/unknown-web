// "use client";

// import { useState, useEffect } from "react";
// import { ChevronLeft, ChevronDown } from "lucide-react";

// interface Address {
//   id: number;
//   name: string;
//   phone: string;
//   street: string;
//   city: string;
//   state: string;
//   country: string;
//   zipCode: string;
// }

// interface AddEditAddressPopupProps {
//   address?: Address | null;
//   onSave: (address: Omit<Address, "id">) => void;
//   onClose: () => void;
// }

// const countries = [
//   { code: "NG", name: "Nigeria", flag: "🇳🇬" },
//   { code: "US", name: "United States", flag: "🇺🇸" },
//   { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
//   { code: "CA", name: "Canada", flag: "🇨🇦" },
//   { code: "AU", name: "Australia", flag: "🇦🇺" },
// ];

// export default function AddEditAddressPopup({
//   address,
//   onSave,
//   onClose,
// }: AddEditAddressPopupProps) {
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     phone2: "",
//     street: "",
//     city: "",
//     state: "",
//     country: "Nigeria",
//     zipCode: "",
//   });

//   const [showCountryDropdown, setShowCountryDropdown] = useState(false);

//   useEffect(() => {
//     if (address) {
//       setFormData({
//         name: address.name,
//         phone: address.phone,
//         phone2: "", 
//         street: address.street,
//         city: address.city,
//         state: address.state,
//         country: address.country,
//         zipCode: address.zipCode,
//       });
//     }
//   }, [address]);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleCountrySelect = (country: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       country: country,
//     }));
//     setShowCountryDropdown(false);
//   };

//   const handleSave = () => {
//     if (
//       !formData.name.trim() ||
//       !formData.phone.trim() ||
//       !formData.street.trim()
//     ) {
//       alert("Please fill in required fields");
//       return;
//     }

//     const addressData = {
//       name: formData.name,
//       phone: formData.phone,
//       street: formData.street,
//       city: formData.city,
//       state: formData.state,
//       country: formData.country,
//       zipCode: formData.zipCode,
//     };

//     onSave(addressData);
//   };

//   const selectedCountry =
//     countries.find((c) => c.name === formData.country) || countries[0];

//   return (
//     <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center p-4 border-b border-gray-200">
//           <button
//             onClick={onClose}
//             className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
//             title="Go back"
//           >
//             <ChevronLeft className="w-5 h-5 text-gray-600" />
//           </button>
//           <h2 className="text-lg font-semibold text-gray-900">
//             {address ? "Edit Address" : "Add/Edit new address"}
//           </h2>
//         </div>

//         {/* Form */}
//         <div className="p-4 space-y-4">
//           {/* Contact Information */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-3">
//               Contact information
//             </h3>

//             {/* Contact Name */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Contact name
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => handleInputChange("name", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Cameron Williamson"
//               />
//             </div>

//             {/* Country */}
//             <div className="mb-4 relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Country
//               </label>
//               <div
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50"
//                 onClick={() => setShowCountryDropdown(!showCountryDropdown)}
//               >
//                 <div className="flex items-center">
//                   <span className="mr-2">{selectedCountry.flag}</span>
//                   <span>{selectedCountry.name}</span>
//                 </div>
//                 <ChevronDown className="w-4 h-4 text-gray-400" />
//               </div>

//               {showCountryDropdown && (
//                 <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
//                   {countries.map((country) => (
//                     <div
//                       key={country.code}
//                       className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
//                       onClick={() => handleCountrySelect(country.name)}
//                     >
//                       <span className="mr-2">{country.flag}</span>
//                       <span>{country.name}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Phone Number */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone number
//               </label>
//               <div className="flex">
//                 <div className="flex items-center bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
//                   <span className="text-sm">📞 +234</span>
//                 </div>
//                 <input
//                   type="text"
//                   value={formData.phone.replace("+234 ", "")}
//                   onChange={(e) =>
//                     handleInputChange("phone", `+234 ${e.target.value}`)
//                   }
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="8161234567"
//                 />
//               </div>
//             </div>

//             {/* Phone Number 2 */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone number 2
//               </label>
//               <div className="flex">
//                 <div className="flex items-center bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
//                   <span className="text-sm">📞 +234</span>
//                 </div>
//                 <input
//                   type="text"
//                   value={formData.phone2}
//                   onChange={(e) => handleInputChange("phone2", e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="8161234567"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Location */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>

//             {/* Address */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Address
//               </label>
//               <input
//                 type="text"
//                 value={formData.street}
//                 onChange={(e) => handleInputChange("street", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="3 eyovolele oluyaes street"
//               />
//             </div>

//             {/* City */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 City
//               </label>
//               <input
//                 type="text"
//                 value={formData.city}
//                 onChange={(e) => handleInputChange("city", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Amuwo odofin"
//               />
//             </div>

//             {/* State */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 State
//               </label>
//               <input
//                 type="text"
//                 value={formData.state}
//                 onChange={(e) => handleInputChange("state", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Lagos State"
//               />
//             </div>

//             {/* Zip Code */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Zip Code
//               </label>
//               <input
//                 type="text"
//                 value={formData.zipCode}
//                 onChange={(e) => handleInputChange("zipCode", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="123456"
//               />
//             </div>
//           </div>

//           {/* Save Button */}
//           <button
//             onClick={handleSave}
//             className="w-full bg-blue-500 text-white py-3 px-6 rounded-full font-medium hover:bg-blue-600 transition-colors mt-6"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";

interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface AddEditAddressPopupProps {
  address?: Address | null;
  onSave: (address: Omit<Address, "id">) => void;
  onClose: () => void;
}

const countries = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

export default function AddEditAddressPopup({
  address,
  onSave,
  onClose,
}: AddEditAddressPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    phone2: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    zipCode: "",
  });

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone,
        phone2: "", 
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode,
      });
    }
  }, [address]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountrySelect = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      country: country,
    }));
    setShowCountryDropdown(false);
  };

  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim()
    ) {
      alert("Please fill in required fields");
      return;
    }

    const addressData = {
      name: formData.name,
      phone: formData.phone,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      zipCode: formData.zipCode,
    };

    onSave(addressData);
  };

  const selectedCountry =
    countries.find((c) => c.name === formData.country) || countries[0];

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md lg:w-[400px] max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center p-3 sm:p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="mr-2 sm:mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {address ? "Edit Address" : "Add/Edit new address"}
          </h2>
        </div>

        {/* Form */}
        <div className="p-3 sm:p-4 space-y-4">
          {/* Contact Information */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
              Contact information
            </h3>

            {/* Contact Name */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Contact name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cameron Williamson"
              />
            </div>

            {/* Country */}
            <div className="mb-3 sm:mb-4 relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <div
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <div className="flex items-center">
                  <span className="mr-2">{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </div>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="px-3 py-2 text-sm sm:text-base hover:bg-gray-50 cursor-pointer flex items-center"
                      onClick={() => handleCountrySelect(country.name)}
                    >
                      <span className="mr-2">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <div className="flex">
                <div className="flex items-center bg-gray-100 px-2 sm:px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-xs sm:text-sm">📞 +234</span>
                </div>
                <input
                  type="text"
                  value={formData.phone.replace("+234 ", "")}
                  onChange={(e) =>
                    handleInputChange("phone", `+234 ${e.target.value}`)
                  }
                  className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8161234567"
                />
              </div>
            </div>

            {/* Phone Number 2 */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone number 2
              </label>
              <div className="flex">
                <div className="flex items-center bg-gray-100 px-2 sm:px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-xs sm:text-sm">📞 +234</span>
                </div>
                <input
                  type="text"
                  value={formData.phone2}
                  onChange={(e) => handleInputChange("phone2", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8161234567"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Location</h3>

            {/* Address */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3 eyovolele oluyaes street"
              />
            </div>

            {/* City */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Amuwo odofin"
              />
            </div>

            {/* State */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lagos State"
              />
            </div>

            {/* Zip Code */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123456"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors mt-4 sm:mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
