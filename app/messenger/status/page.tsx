import { StatusList } from "./StatusList";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex">
      {/* Left Sidebar - Status List */}
      <div className="w-[480px] border-r bg-white">
        <StatusList />
      </div>
      
      {/* Right Main Content */}
      <div className="w-2/3 flex flex-col items-center justify-center">
        <Image
          src="/appcombo.svg" 
          alt="Logo"
          width={50}
          height={50}
          className="mb-4 object-contain"
        />
        <p className="text-lg text-gray-600">
          Send and receive messages with your laptop
        </p>
      </div>
    </div>
  );
}