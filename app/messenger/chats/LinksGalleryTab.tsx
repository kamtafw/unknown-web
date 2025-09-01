import React from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

interface LinkGalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  hasImage?: boolean;
}

const linkGalleryItems: LinkGalleryItem[] = [
  {
    id: "1",
    title: "Lorem ipsum dolor sit amet, consectetur tetur",
    description: "Lorem ipsum dolor sit amet, consectetur tetur stur setur",
    url: "https://www.Loremipsumdolorsitamet.consectetur.tu...",
    hasImage: true,
    thumbnail: "/image.png",
  },
  {
    id: "2",
    title: "Lorem ipsum dolor sit amet, consectetur tetur",
    description: "Lorem ipsum dolor sit amet, consectetur tetur stur setur",
    url: "https://www.Loremipsumdolorsitamet.consectetur.tu...",
    hasImage: false,
  },
  {
    id: "3",
    title: "Lorem ipsum dolor sit amet, consectetur tetur",
    description: "Lorem ipsum dolor sit amet, consectetur tetur stur setur",
    url: "https://www.Loremipsumdolorsitamet.consectetur.tu...",
    hasImage: false,
  },
  {
    id: "4",
    title: "Lorem ipsum dolor sit amet, consectetur tetur",
    description: "Lorem ipsum dolor sit amet, consectetur tetur stur setur",
    url: "https://www.Loremipsumdolorsitamet.consectetur.tu...",
    hasImage: false,
  },
  {
    id: "5",
    title: "Lorem ipsum dolor sit amet, consectetur tetur",
    description: "Lorem ipsum dolor sit amet, consectetur tetur stur setur",
    url: "https://www.Loremipsumdolorsitamet.consectetur.tu...",
    hasImage: false,
  },
];

export function LinksGalleryTab() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {linkGalleryItems.map((item) => (
          <div key={item.id} className="cursor-pointer transition-colors">
            {/* Link with thumbnail */}
            {item.hasImage && item.thumbnail && (
              <div className="flex gap-3 mb-2 bg-blue-50 rounded-lg p-2">
                <div className="relative w-15 h-15 flex-shrink-0">
                  <Image
                    src={item.thumbnail}
                    alt="Link thumbnail"
                    fill
                    className="object-cover rounded"
                  />
                  {/* Link icon overlay on image */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                </div>
              </div>
            )}

            {/* Link without thumbnail */}
            {!item.hasImage && (
              <div className="flex items-start gap-3 mb-2">
                {/* Link icon beside the content box */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {item.description}
                  </p>
                </div>
              </div>
            )}

            {/* URL and arrow */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-blue-600 truncate">
                  {item.url}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}