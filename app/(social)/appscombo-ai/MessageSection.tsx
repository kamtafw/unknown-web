"use client";

import Image from "next/image";
import { Smile } from "lucide-react";

import Logo from "@/assets/appcombohallogo.svg";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Paperclip,
  SendHorizontal,
} from "lucide-react";

export default function MessageSection() {
  return (
    <div className="flex justify-center sm:justify-start w-full ">
      <div className="w-full max-w-[600px]  min-h-[400px] bg-white text-gray-900 border border-gray-200 rounded-lg shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center justify-center gap-1 px-4 py-2 mt-4">
            <Button variant="ghost" size="icon" className="shrink-0 w-6 h-6">
              <Image
              src={Logo}
              alt="AppComboHal Logo"
              width={48}
              height={48}
              className="w-12 h-12"
              style={{ objectFit: 'contain' }}
              priority
            />
            </Button>
            <h1 className="text-base font-semibold">AI_Combo</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 space-y-1 lg:space-y-4 mt-2 lg:mt-5">
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-5 py-4 rounded-full max-w-xs">
              What is a chameleon?
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex flex-col items-center justify-center px-4 py-2">
              <div className="flex items-center gap-5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 w-7 h-7"
                >
                  <Image
                    src={Logo}
                    alt="AppComboHal Logo"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </Button>
                <div className="flex flex-col items-center">
                  <h1 className="text-base font-semibold">AI_Combo</h1>
                  <span className="text-sm text-gray-500">2 Hours ago</span>
                </div>
              </div>
            </div>

            <div className=" p-4 w-full">
              <p className="text-gray-800">
                A chameleon is a type of lizard known for its ability to change
                color. Here are some key facts about chameleons:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 lg:space-y-6 text-gray-700">
                <li>
                  <strong>Color Change</strong>: Chameleons change color to
                  blend into their environment, regulate temperature, or
                  communicate.
                </li>
                <li>
                  <strong>Unique Eyes</strong>: Their eyes can move
                  independently, providing 360-degree vision.
                </li>
                <li>
                  <strong>Tongue Projection</strong>: Chameleons have long,
                  sticky tongues to catch prey, extending faster than the human
                  eye can see.
                </li>
                <li>
                  <strong>Habitats</strong>: Found mainly in Africa and
                  Madagascar, they thrive in rainforest and deserts.
                </li>
                <li>
                  <strong>Species Diversity</strong>: Over 200 species exist,
                  varying in size, color, and behavior.
                </li>
                <li>
                  <strong>Species Diversity</strong>: Over 200 species exist,
                  varying in size, color, and behavior.Chameleons have long,
                  sticky tongues to catch prey, extending faster than the human
                  eye can see.
                </li>
              </ul>
            </div>
          </div>
          <div className="flex ml-3 space-x-4">
            <ThumbsUp className="w-5 h-5 text-gray-600 hover:text-blue-500 cursor-pointer" />
            <ThumbsDown className="w-5 h-5 text-gray-600 hover:text-red-500 cursor-pointer" />
            <Copy className="w-5 h-5 text-gray-600 hover:text-blue-500 cursor-pointer" />
            <RefreshCw className="w-5 h-5 text-gray-600 hover:text-blue-500 cursor-pointer" />
          </div>
          <div className="flex ml-1 mt-5 lg:mt-25 mb-5 items-center bg-white border rounded-full p-2 w-[320px] lg:w-[530px] relative">
            <Smile className="w-6 h-6 text-black mr-2" />
            <input
              type="text"
              placeholder="Ask anything"
              className="flex-1 outline-none"
            />
            <div className="flex items-center space-x-2">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <Image
                src="/languageai.png"
                alt="Small Image"
                width={20}
                height={20}
              />
            </div>
            <button
              className="absolute right-[-40px] bg-blue-500 rounded-full p-2"
              title="Send message"
              aria-label="Send message"
            >
              <SendHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
