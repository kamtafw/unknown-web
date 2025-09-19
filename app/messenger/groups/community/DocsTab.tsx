import React from "react";

interface DocItem {
  id: string;
  type: "PDF" | "MP3" | "MP4" | "DOC" | "SVG";
  title: string;
  size: string;
  date: string;
  color: string;
}

const docItems: DocItem[] = [
  {
    id: "1",
    type: "PDF",
    title: "Lorem ipsum dolor sit amet, tur",
    size: "2.3 GB • PDF",
    date: "28/10/2024",
    color: "bg-red-500",
  },
  {
    id: "2",
    type: "MP3",
    title: "Lorem ipsum dolotur",
    size: "2.3 GB • MP3",
    date: "28/10/2024",
    color: "bg-blue-500",
  },
  {
    id: "3",
    type: "MP4",
    title: "Lorem ipsum dolotur",
    size: "2.3 GB • MP3",
    date: "28/10/2024",
    color: "bg-blue-500",
  },
  {
    id: "4",
    type: "MP4",
    title: "Lorem ipsum dolor sit amet, consectetur...",
    size: "2.3 GB • MP4",
    date: "28/10/2024",
    color: "bg-blue-500",
  },
  {
    id: "5",
    type: "MP4",
    title: "Lorem ipsum dolor sit amet, consectetur...",
    size: "2.3 GB • MP4",
    date: "28/10/2024",
    color: "bg-blue-500",
  },
  {
    id: "6",
    type: "DOC",
    title: "Lorem i",
    size: "2.3 GB • DOC",
    date: "28/10/2024",
    color: "bg-blue-600",
  },
  {
    id: "7",
    type: "DOC",
    title: "lor sit amet, consectetur tetur",
    size: "2.3 GB • DOC",
    date: "28/10/2024",
    color: "bg-blue-600",
  },
  {
    id: "8",
    type: "SVG",
    title: "Lorem ipsum dolotur",
    size: "2.3 GB • SVG",
    date: "28/10/2024",
    color: "bg-purple-500",
  },
  {
    id: "9",
    type: "SVG",
    title: "ctur",
    size: "2.3 GB • SVG",
    date: "28/10/2024",
    color: "bg-purple-500",
  },
];

export function DocsTab() {

  return (
    <div className="p-4">
      <div className="space-y-3">
        {docItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          >
            {/* File Icon */}
            <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{item.type}</span>
            </div>
            
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 truncate">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500">{item.size}</p>
            </div>
            
            {/* Date */}
            <div className="text-xs text-gray-500 flex-shrink-0">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}