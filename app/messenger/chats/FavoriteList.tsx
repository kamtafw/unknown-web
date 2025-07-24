"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function FavoritesList() {
  return (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <div className="mb-6">
        <Image
          src="/Favorite.png"
          alt="Add to Favorites"
          width={96}
          height={96}
          className="w-24 h-24 object-contain"
        />
      </div>
      <div className="mb-8 space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">Add to Favorites</h3>
        <p className="text-gray-500">
          Make it easy to find people and
        </p>
        <p className="text-gray-500">
          groups by adding them here
        </p>
      </div>
      <Button 
        className=" bg-blue-400 hover:bg-blue-600 text-white px-8 py-2 rounded-full"
      >
        Create list
      </Button>
    </div>
  );
}
