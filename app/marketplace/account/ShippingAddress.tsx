// "use client";

// import { useState } from "react";
// import { ChevronLeft } from "lucide-react";
// import AddEditAddressPopup from "./AddEditAddressPopup";


// interface ShippingAddressPageProps {
//   onBack: () => void;
// }

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

// export default function ShippingAddressPage({
//   onBack,
// }: ShippingAddressPageProps) {
//   const [showAddEditPopup, setShowAddEditPopup] = useState(false);
//   const [editingAddress, setEditingAddress] = useState<Address | null>(null);
//   const [addresses, setAddresses] = useState<Address[]>([
//     {
//       id: 1,
//       name: "Cameron Williamson",
//       phone: "+234 08112345678",
//       street: "3 eyovolele oluyaes street",
//       city: "Amuwo odofin",
//       state: "Lagos State",
//       country: "Nigeria",
//       zipCode: "123456",
//     },
//     {
//       id: 2,
//       name: "Cameron Williamson",
//       phone: "+234 08112345678",
//       street: "15 Allen Avenue",
//       city: "Ikeja",
//       state: "Lagos State",
//       country: "Nigeria",
//       zipCode: "100271",
//     },
//     {
//       id: 3,
//       name: "Cameron Williamson",
//       phone: "+234 08112345678",
//       street: "42 Independence Layout",
//       city: "Enugu",
//       state: "Enugu State",
//       country: "Nigeria",
//       zipCode: "400001",
//     },
//     {
//       id: 4,
//       name: "Cameron Williamson",
//       phone: "+234 08112345678",
//       street: "78 Ring Road",
//       city: "Ibadan",
//       state: "Oyo State",
//       country: "Nigeria",
//       zipCode: "200001",
//     },
//   ]);

//   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
//     null
//   );

//   const handleAddressSelect = (addressId: number) => {
//     setSelectedAddressId(selectedAddressId === addressId ? null : addressId);
//   };

//   const handleEdit = (address: Address) => {
//     setEditingAddress(address);
//     setShowAddEditPopup(true);
//   };

//   const handleAddNew = () => {
//     setEditingAddress(null);
//     setShowAddEditPopup(true);
//   };

//   const handleDelete = (addressId: number) => {
//     setAddresses(addresses.filter((addr) => addr.id !== addressId));
//     setSelectedAddressId(null);
//   };

//   const handleSaveAddress = (addressData: Omit<Address, "id">) => {
//     if (editingAddress) {
//       setAddresses(
//         addresses.map((addr) =>
//           addr.id === editingAddress.id
//             ? { ...addressData, id: editingAddress.id }
//             : addr
//         )
//       );
//     } else {
//       const newId = Math.max(...addresses.map((a) => a.id), 0) + 1;
//       setAddresses([...addresses, { ...addressData, id: newId }]);
//     }
//     setShowAddEditPopup(false);
//     setEditingAddress(null);
//   };

//   return (
//     <div className="w-[600px] bg-white rounded-lg overflow-hidden">
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex items-center mb-6">
//           <button
//             onClick={onBack}
//             className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
//             title="Go back"
//           >
//             <ChevronLeft className="w-5 h-5 text-gray-600" />
//           </button>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Shipping Address
//           </h1>
//         </div>

//         {/* Address List */}
//         <div className="space-y-4">
//           {addresses.map((address) => (
//             <div key={address.id} className="space-y-0">
//               {/* Address Card */}
//               <div
//                 className={`p-4 cursor-pointer transition-all duration-200 ${
//                   selectedAddressId === address.id ? "" : "hover:bg-gray-50"
//                 }`}
//                 onClick={() => handleAddressSelect(address.id)}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center mb-2">
//                       <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
//                         <div
//                           className={`w-3 h-3 rounded-full transition-all duration-200 ${
//                             selectedAddressId === address.id
//                               ? "bg-blue-500"
//                               : "bg-gray-300"
//                           }`}
//                         ></div>
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">
//                           {address.name}
//                         </h3>
//                         <p className="text-sm text-gray-600">{address.phone}</p>
//                       </div>
//                     </div>
//                     <div className="ml-9">
//                       <p className="text-gray-700">{address.street}</p>
//                       <p className="text-gray-600">
//                         {address.city}, {address.state}, {address.country},{" "}
//                         {address.zipCode}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons - Show immediately below selected address */}
//               {selectedAddressId === address.id && (
//                 <div className="bg-gray-50 p-4 -mt-1">
//                   <div className="flex gap-4">
//                     <button
//                       onClick={() => handleDelete(address.id)}
//                       className="flex-1 bg-red-200 text-red-600 border border-red-400 py-3 px-6 rounded-full font-medium hover:bg-red-100 transition-colors"
//                     >
//                       Delete
//                     </button>
//                     <button
//                       onClick={() => handleEdit(address)}
//                       className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-full font-medium hover:bg-blue-700 transition-colors"
//                     >
//                       Edit
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//           {/* Add New Address Button */}
//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <button
//               onClick={handleAddNew}
//               className="w-full bg-blue-500 text-white py-3 px-6 rounded-full font-medium hover:bg-blue-600 transition-colors"
//             >
//               Add new address
//             </button>
//           </div>
//         </div>
//       </div>
//       {showAddEditPopup && (
//         <AddEditAddressPopup
//           address={editingAddress}
//           onSave={handleSaveAddress}
//           onClose={() => {
//             setShowAddEditPopup(false);
//             setEditingAddress(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import AddEditAddressPopup from "./AddEditAddressPopup";

interface ShippingAddressPageProps {
  onBack: () => void;
}

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

export default function ShippingAddressPage({
  onBack,
}: ShippingAddressPageProps) {
  const [showAddEditPopup, setShowAddEditPopup] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: "Cameron Williamson",
      phone: "+234 08112345678",
      street: "3 eyovolele oluyaes street",
      city: "Amuwo odofin",
      state: "Lagos State",
      country: "Nigeria",
      zipCode: "123456",
    },
    {
      id: 2,
      name: "Cameron Williamson",
      phone: "+234 08112345678",
      street: "15 Allen Avenue",
      city: "Ikeja",
      state: "Lagos State",
      country: "Nigeria",
      zipCode: "100271",
    },
    {
      id: 3,
      name: "Cameron Williamson",
      phone: "+234 08112345678",
      street: "42 Independence Layout",
      city: "Enugu",
      state: "Enugu State",
      country: "Nigeria",
      zipCode: "400001",
    },
    {
      id: 4,
      name: "Cameron Williamson",
      phone: "+234 08112345678",
      street: "78 Ring Road",
      city: "Ibadan",
      state: "Oyo State",
      country: "Nigeria",
      zipCode: "200001",
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(selectedAddressId === addressId ? null : addressId);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddEditPopup(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddEditPopup(true);
  };

  const handleDelete = (addressId: number) => {
    setAddresses(addresses.filter((addr) => addr.id !== addressId));
    setSelectedAddressId(null);
  };

  const handleSaveAddress = (addressData: Omit<Address, "id">) => {
    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addressData, id: editingAddress.id }
            : addr
        )
      );
    } else {
      const newId = Math.max(...addresses.map((a) => a.id), 0) + 1;
      setAddresses([...addresses, { ...addressData, id: newId }]);
    }
    setShowAddEditPopup(false);
    setEditingAddress(null);
  };

  return (
    <div className="w-full max-w-2xl lg:w-[600px] bg-white rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="mr-3 sm:mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Shipping Address
          </h1>
        </div>

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="space-y-0">
              {/* Address Card */}
              <div
                className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
                  selectedAddressId === address.id ? "" : "hover:bg-gray-50"
                }`}
                onClick={() => handleAddressSelect(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <div
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                            selectedAddressId === address.id
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          {address.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">{address.phone}</p>
                      </div>
                    </div>
                    <div className="ml-7 sm:ml-9">
                      <p className="text-sm sm:text-base text-gray-700">{address.street}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {address.city}, {address.state}, {address.country},{" "}
                        {address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Show immediately below selected address */}
              {selectedAddressId === address.id && (
                <div className="bg-gray-50 p-3 sm:p-4 -mt-1">
                  <div className="flex gap-3 sm:gap-4">
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="flex-1 bg-red-200 text-red-600 border border-red-400 py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Add New Address Button */}
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleAddNew}
              className="w-full bg-blue-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors"
            >
              Add new address
            </button>
          </div>
        </div>
      </div>
      {showAddEditPopup && (
        <AddEditAddressPopup
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => {
            setShowAddEditPopup(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}
