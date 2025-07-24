import { ChatList } from "./ChatList";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar - Chat List */}
      <div className="w-[480px] border-r bg-white overflow-hidden">
        <ChatList />
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