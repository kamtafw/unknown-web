"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShareToFollowersPopup({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const users = [
    { id: 1, name: "Cameron Williamson", phone: "+234 123456789" },
    { id: 2, name: "Devon Lane", phone: "+234 987654321" },
    { id: 3, name: "Eleanor Pena", phone: "+234 111222333" },
    { id: 4, name: "Ralph Edwards", phone: "+234 444555666" },
    { id: 5, name: "Kathryn Murphy", phone: "+234 777888999" },
    { id: 6, name: "Kristin Watson", phone: "+234 123123123" },
    { id: 7, name: "Roland Richards", phone: "+234 456456456" },
    { id: 8, name: "Jenny Wilson", phone: "+234 789789789" },
    { id: 9, name: "Wade Warren", phone: "+234 321321321" },
    { id: 10, name: "Robert Fox", phone: "+234 654654654" },
  ];

  const handleSelect = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    router.push("/home");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold">
              Share to followers
            </h3>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
              aria-label="Close"
              title="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src="/profilepic.jpg"
                      alt={user.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-xs sm:text-sm lg:text-base text-left truncate">
                      {user.name}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-500 text-left truncate">
                      {user.phone}
                    </p>
                  </div>
                </div>
                <input
                  id={`share-checkbox-${user.id}`}
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelect(user.id)}
                  className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ml-2"
                  aria-label={`Select ${user.name}`}
                />
              </div>
            ))}
          </div>
          <button
            className="mt-3 sm:mt-4 px-4 py-2 w-full bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm sm:text-base"
            onClick={handleShare}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}