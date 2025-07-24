"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import SecurityImage from "@/public/shield 1.png";
import { useState } from "react";

interface SecurityNotificationPageProps {
  onBack: () => void;
}

export default function SecurityNotificationPage({
  onBack,
}: SecurityNotificationPageProps) {
  const [isToggled, setIsToggled] = useState(false);

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Account"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Security Notification</h1>
          </div>
        </div>
        <div className="justify-center flex items-center">
          <Image
            src={SecurityImage}
            alt="Security Illustration"
            width={100}
            height={100}
            className="mt-1"
          />
        </div>
        <div className="ml-3 px-2 sm:px-4  py-3 flex flex-col items-start">
          <h2 className="mt-2 text-lg font-semibold text-[16px]">
            Your chats and calls are private
          </h2>
          <p className="mt-1 text-sm text-gray-500 text-[14px]">
            End to end encryption keeps your personal messages and calls between
            you and the people you choose. Not even Appscombo can read or listen
            to them, this include:
          </p>
          <ul className="list-disc pl-5 mt-6 space-y-2 text-[14px]">
            <li>Text and voice messages.</li>
            <li>Audio and voice call.</li>
            <li>Photos, Video and documents.</li>
            <li>Location sharing.</li>
            <li>Status updates.</li>
          </ul>
          <a href="#" className=" text-blue-500 text-sm text-[14px] hover:underline">
            Learn more
          </a>
          <hr className="my-6 w-full border-gray-200" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
            <span className="font-semibold text-[16px]">
              Show security notification on this
              <br className="sm:hidden" /> device
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isToggled}
                onChange={() => setIsToggled(!isToggled)}
                className="sr-only peer"
                aria-label="Toggle security notification"
              />
              <div className="w-[45px] h-[25px] bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-200 ease-in-out px-[3px] flex items-center">
                <div
                  className={`w-[22px] h-[20px] bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    isToggled ? "translate-x-[20px]" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500 text-[14px]">
            Get notified when you security code changes for a contact&apos;s phone in an
            end-to-end encrypted chat, if you have multiple devices, this settings must be 
            enabled on each devices where you want to get notification.
          </p>
          <a href="#" className="mt-5 text-blue-500 text-sm text-[14px] hover:underline">
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
