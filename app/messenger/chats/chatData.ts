export interface Chat {
  id: string;
  name: string;
  status?: string;
  iconType?: string;
  iconColor?: string;
  time: string;
  message: string;
  badge?: number;
  online?: boolean;
  pinned?: boolean;
  statusIcon?: string;
  avatar?: string;
  hasStatusIndicator?: boolean;
  statusIndicatorType?: "active" | "viewed";
}

export const chatsData: Chat[] = [
  {
    id: "1",
    name: "Louigi Dash",
    avatar: "/Rectangle 1.png",
    iconType: "phone-callback",
    iconColor: "text-red-500",
    message: "Missed voice call",
    time: "00:57",
    badge: 4,
    pinned: true,
  },
  {
    id: "2",
    name: "Cameron Williamson",
    avatar: "/Rectangle5.png",
    iconType: "messenger",
    iconColor: "text-gray-600",
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    badge: 4,
    online: true,
  },
  {
    id: "3",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    iconType: "checkmark-done",
    iconColor: "text-blue-500",
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    hasStatusIndicator: true,
    statusIndicatorType: "active",
  },
  {
    id: "4",
    name: "Marvin McKinney",
    avatar: "/Rectangle 2.png",
    iconType: "check",
    iconColor: "text-gray-600",
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    hasStatusIndicator: true,
    statusIndicatorType: "viewed",
  },
  {
    id: "5",
    name: "Darlene Robertson",
    avatar: "/Rectangle 1.png",
    iconType: "microphone",
    iconColor: "text-blue-500",
    message: "0:25",
    time: "00:57",
  },
  {
    id: "6",
    name: "Kristin Watson",
    avatar: "/Rectangle5.png",
    message: "Typing a message",
    time: "05:57",
  },
  {
    id: "7",
    name: "Arlene McCoy",
    avatar: "/Rectangle 2.png",
    iconType: "phone-callback",
    iconColor: "text-red-500",
    message: "Missed voice call",
    time: "06:57",
    badge: 4,
  },
  {
    id: "8",
    name: "Jane Cooper",
    avatar: "/Rectangle 3.png",
    iconType: "phone-callback",
    iconColor: "text-gray-600",
    message: "Voice call",
    time: "07:52",
    badge: 4,
  },
  {
    id: "9",
    name: "Robert Kim",
    avatar: "/Rectangle 4.png",
    iconType: "checkmark-done",
    iconColor: "text-gray-600",
    message: "Lorem ipsum dolor sit amet, co...",
    time: "07:58",
    hasStatusIndicator: true,
    statusIndicatorType: "viewed",
  },
  {
    id: "10",
    name: "Arlene Cane",
    avatar: "/Rectangle5.png",
    iconType: "video",
    iconColor: "text-blue-500",
    message: "Video",
    time: "08:51",
    badge: 4,
  },
  {
    id: "11",
    name: "Wade Warren",
    avatar: "/Rectangle 4.png",
    iconType: "image",
    iconColor: "text-gray-600",
    message: "Image",
    time: "08:55",
  },
  {
    id: "12",
    name: "Kristin Watson",
    avatar: "/Rectangle 1.png",
    message: "Recording a voice message",
    time: "09:00",
  },
];

// Tab configuration
export interface Tab {
  id: string;
  label: string;
}

export const tabsData: Tab[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "favorites", label: "Favorites" },
  { id: "groups", label: "Groups" },
];