// "use client";

// import { ArrowLeft } from "lucide-react";
// import Image from "next/image";

// interface LiveLocationPageProps {
//   onBack: () => void;
//   onNavigate: (view: string) => void;
// }

// export default function LiveLocationPage({
//   onBack,
//   onNavigate,
// }: LiveLocationPageProps) {
//   return (
//     <div className="flex ml-3 justify-center sm:justify-start w-full">
//       <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
//         <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
//           <div className="px-4 py-3 flex items-center gap-2">
//             <button
//               onClick={onBack}
//               className="p-2 rounded-full hover:bg-gray-100"
//               aria-label="Back to Privacy"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <h1 className="text-xl font-bold">Live Location</h1>
//           </div>
//         </div>
//         <div className="px-4 py-6 space-y-6">
//           <div className="w-32 h-32 overflow-hidden mx-auto">
//             <Image
//               src="/Frame.png"
//               alt="Live Location"
//               width={128}
//               height={128}
//               className="object-cover w-full h-full"
//             />
//           </div>
//           <div className="flex flex-col items-start">
//             <p className="text-[16px] text-black font-bold text-left">
//               You aren&#39;t sharing live location in any chats
//             </p>
//             <p className="text-[14px] text-gray-500 text-left mt-4">
//               Live location requires background location, you can manage this in
//               your device settings
//             </p>
//           </div>
//           <button
//             onClick={() => onNavigate("liveLocationSharing")}
//             className="w-full mt-95 bg-blue-500 text-white py-2 rounded-full"
//           >
//             Start Sharing
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useGetLiveLocationSharing } from "@/services/privacy/usePrivacyService";

interface LiveLocationPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  onStartSharing: () => void;
}

export default function LiveLocationPage({
  onBack,
  onNavigate,
  onStartSharing,
}: LiveLocationPageProps) {
  const { data: locationData, isLoading } = useGetLiveLocationSharing();
  
  const isSharing = locationData?.data?.is_sharing || false;

  const handleButtonClick = () => {
    if (isSharing) {
      onNavigate("liveLocationSharing");
    } else {
      onStartSharing();
    }
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Privacy"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Live Location</h1>
          </div>
        </div>
        <div className="px-4 py-6 space-y-6">
          <div className="w-32 h-32 overflow-hidden mx-auto">
            <Image
              src="/Frame.png"
              alt="Live Location"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-[16px] text-black font-bold text-left">
              {isSharing
                ? "You are currently sharing your location"
                : "You aren't sharing live location in any chats"}
            </p>
            <p className="text-[14px] text-gray-500 text-left mt-4">
              Live location requires background location, you can manage this in
              your device settings
            </p>
          </div>
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className={`w-full mt-95 ${
              isSharing ? "bg-red-500" : "bg-blue-500"
            } text-white py-2 rounded-full disabled:opacity-50`}
          >
            {isLoading
              ? "Loading..."
              : isSharing
              ? "View Sharing Details"
              : "Start Sharing"}
          </button>
        </div>
      </div>
    </div>
  );
}
