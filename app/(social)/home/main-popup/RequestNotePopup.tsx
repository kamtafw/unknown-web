"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RequestNotePopup({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const notes = [
    {
      id: 1,
      image: "/profilepic.jpg",
      text: "Contributors will see alert on this post and get enough requests.",
    },
    {
      id: 2,
      image: "/profilepic.jpg",
      text: "If a note is written and rated helpful by other contributors, it will be shown on this post.",
    },
    {
      id: 3,
      image: "/profilepic.jpg",
      text: "AppsCombo doesn't choose which note to show community note is by the people for the people.",
    },
  ];

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Request note</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-[16px] text-black font-bold text-left">
          Request a note from appscombo about this post
        </p>
        <p className="text-sm text-gray-500 text-left">
          You think this post is misleading? Request a note from community
        </p>
        <div className="space-y-2 mt-2">
          {notes.map((note) => (
            <div key={note.id} className="flex items-center gap-2">
              <Image
                src={note.image}
                alt="Note"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-left">{note.text}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-6 text-left">
          Request are anonymized and made available to the public for transparency.
        </p>
        <button className="text-blue-400 text-sm mt-6">Learn more about community notes</button>
        <button
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 w-full"
          onClick={() => {
            router.push("/home");
            onClose();
          }}
        >
          Agree and request a note
        </button>
      </div>
    </div>
  );
}
