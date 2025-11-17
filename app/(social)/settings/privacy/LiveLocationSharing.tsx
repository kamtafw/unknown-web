// "use client";

// import { ArrowLeft } from "lucide-react";
// import Image from "next/image";
// import { useAuthStore } from "@/store/userStore";
// import {
//   useToggleLiveLocationSharing,
// } from "@/services/privacy/usePrivacyService";
// import { useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";

// interface LiveLocationSharingPageProps {
//   onBack: () => void;
// }

// export default function LiveLocationSharingPage({
//   onBack,
// }: LiveLocationSharingPageProps) {
//   const user = useAuthStore((state) => state.user);
//   const { mutate: toggleSharing, isPending } = useToggleLiveLocationSharing();
//   const queryClient = useQueryClient();
//   const router = useRouter();

// const handleStopSharing = () => {
//   toggleSharing(
//     { location_sharing_enabled: false },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: ["live-location-sharing"] });
//         router.push("/settings?view=privacy");
//       },
//     }
//   );
// };

 
//   const getTimeLeft = () => {
//     if (locationData?.data?.expires_at) {
//       const expiresAt = new Date(locationData.data.expires_at);
//       const now = new Date();
//       const diffMs = expiresAt.getTime() - now.getTime();
//       const diffMins = Math.floor(diffMs / 60000);
//       const hours = Math.floor(diffMins / 60);
//       const mins = diffMins % 60;
//       return `${hours} hour ${mins} min left`;
//     }
//     return "1 hour 0 min left";
//   };

//   return (
//     <div className="flex ml-3 justify-center sm:justify-start w-full">
//       <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
//         <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
//           <div className="px-4 py-3 flex items-center gap-2">
//             <button
//               onClick={onBack}
//               className="p-2 rounded-full hover:bg-gray-100"
//               aria-label="Back to Live Location"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <h1 className="text-xl font-bold">Live Location</h1>
//           </div>
//         </div>
//         <div className="flex flex-col items-start px-4 py-6 space-y-6">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
//               <Image
//                 src={user?.user?.profile_photo || "/profilepic.jpg"}
//                 alt={user?.user?.username || "User"}
//                 width={64}
//                 height={64}
//                 className="object-cover w-full h-full"
//               />
//             </div>
//             <div>
//               <p className="text-[16px] text-black">
//                 @{user?.user?.username || "User"}
//               </p>
//               <p className="text-[14px] text-gray-500">{getTimeLeft()}</p>
//             </div>
//           </div>

//           <p className="text-[14px] text-gray-500 text-left">
//             Live location requires background location. You can manage this in
//             your device settings.
//           </p>
//           <button
//             onClick={handleStopSharing}
//             disabled={isPending}
//             className="w-full mt-120 bg-red-500 text-white py-2 rounded-full disabled:opacity-50"
//           >
//             {isPending ? "Stopping..." : "Stop Sharing"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/userStore";
import {
  useGetLiveLocationSharing,
  useToggleLiveLocationSharing,
} from "@/services/privacy/usePrivacyService";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface LiveLocationSharingPageProps {
  onBack: () => void;
}

export default function LiveLocationSharingPage({
  onBack,
}: LiveLocationSharingPageProps) {
  const user = useAuthStore((state) => state.user);
  const { data: locationData } = useGetLiveLocationSharing();
  const { mutate: toggleSharing, isPending } = useToggleLiveLocationSharing();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleStopSharing = () => {
    toggleSharing(
      { location_sharing_enabled: false },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["live-location-sharing"] });
          router.push("/settings?view=privacy");
        },
      }
    );
  };

  const getTimeLeft = () => {
    if (locationData?.data?.expires_at) {
      const expiresAt = new Date(locationData.data.expires_at);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} hour ${mins} min left`;
    }
    return "1 hour 0 min left";
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Live Location"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Live Location</h1>
          </div>
        </div>
        <div className="flex flex-col items-start px-4 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
              <Image
                src={user?.user?.profile_photo || "/profilepic.jpg"}
                alt={user?.user?.username || "User"}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-[16px] text-black">
                @{user?.user?.username || "User"}
              </p>
              <p className="text-[14px] text-gray-500">{getTimeLeft()}</p>
            </div>
          </div>

          <p className="text-[14px] text-gray-500 text-left">
            Live location requires background location. You can manage this in
            your device settings.
          </p>
          <button
            onClick={handleStopSharing}
            disabled={isPending}
            className="w-full mt-120 bg-red-500 text-white py-2 rounded-full disabled:opacity-50"
          >
            {isPending ? "Stopping..." : "Stop Sharing"}
          </button>
        </div>
      </div>
    </div>
  );
}
