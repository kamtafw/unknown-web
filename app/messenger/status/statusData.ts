export interface StatusStory {
  id: string;
  image: string;
  text: string;
  emoji: string;
}

export interface Status {
  id: string;
  name: string;
  avatar: string;
  time: string;
  date: string;
  count?: number;
  viewed?: boolean;
  stories: StatusStory[];
}

export const recentStatuses: Status[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    time: "14:23",
    date: "1st December 2024",
    count: 2,
    stories: [
      {
        id: "1",
        image: "/Ai Combo.png",
        text: "At the beach today",
        emoji: "🏖️",
      },
      {
        id: "2",
        image: "/Status.png",
        text: "Amazing sunset",
        emoji: "🌅",
      },
    ],
  },
  {
    id: "2",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    time: "13:45",
    date: "1st December 2024",
    count: 1,
    stories: [
      {
        id: "1",
        image: "/image.png",
        text: "New car purchase",
        emoji: "🚗",
      },
    ],
  },
  {
    id: "3",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    time: "12:30",
    date: "1st December 2024",
    count: 3,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Morning workout",
        emoji: "💪",
      },
      {
        id: "2",
        image: "/bottle.png",
        text: "Healthy breakfast",
        emoji: "🥗",
      },
      {
        id: "3",
        image: "/Beli.png",
        text: "Ready for the day",
        emoji: "✨",
      },
    ],
  },
  {
    id: "4",
    name: "Darlene Robertson",
    avatar: "/Rectangle 3.png",
    time: "11:15",
    date: "1st December 2024",
    count: 1,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Coffee time",
        emoji: "☕",
      },
    ],
  },
  {
    id: "5",
    name: "Kristin Watson",
    avatar: "/Rectangle 3.png",
    time: "10:45",
    date: "1st December 2024",
    count: 2,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Working from home",
        emoji: "🏠",
      },
      {
        id: "2",
        image: "/Status.png",
        text: "Productive day",
        emoji: "📈",
      },
    ],
  },
];

export const viewedStatuses: Status[] = [
  {
    id: "6",
    name: "Arlene McCoy",
    avatar: "/Rectangle 3.png",
    time: "22:30",
    date: "30th November 2024",
    viewed: true,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Good night everyone",
        emoji: "🌙",
      },
    ],
  },
  {
    id: "7",
    name: "Jane Cooper",
    avatar: "/Rectangle 3.png",
    time: "18:45",
    date: "30th November 2024",
    viewed: true,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Dinner with family",
        emoji: "🍽️",
      },
    ],
  },
  {
    id: "8",
    name: "Robert Kim",
    avatar: "/Rectangle 3.png",
    time: "16:20",
    date: "29th November 2024",
    viewed: true,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Weekend plans",
        emoji: "🎉",
      },
    ],
  },
  {
    id: "9",
    name: "Arlene Cane",
    avatar: "/Rectangle 3.png",
    time: "14:10",
    date: "29th November 2024",
    viewed: true,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Shopping day",
        emoji: "🛍️",
      },
    ],
  },
  {
    id: "10",
    name: "Wade Warren",
    avatar: "/Rectangle 3.png",
    time: "12:05",
    date: "28th November 2024",
    viewed: true,
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Travel memories",
        emoji: "✈️",
      },
    ],
  },
];

export const mutedStatuses: Status[] = [
  {
    id: "11",
    name: "Floyd Miles",
    avatar: "/Rectangle 3.png",
    time: "13:15",
    date: "1st December 2024",
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Gym session",
        emoji: "🏋️",
      },
    ],
  },
  {
    id: "12",
    name: "Jenny Wilson",
    avatar: "/Rectangle 3.png",
    time: "10:30",
    date: "1st December 2024",
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Morning jog",
        emoji: "🏃‍♀️",
      },
    ],
  },
  {
    id: "13",
    name: "Devon Lane",
    avatar: "/Rectangle 3.png",
    time: "20:45",
    date: "30th November 2024",
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Movie night",
        emoji: "🎬",
      },
    ],
  },
  {
    id: "14",
    name: "Courtney Henry",
    avatar: "/Rectangle 3.png",
    time: "15:20",
    date: "29th November 2024",
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Art gallery visit",
        emoji: "🎨",
      },
    ],
  },
  {
    id: "15",
    name: "Theresa Webb",
    avatar: "/Rectangle 3.png",
    time: "11:30",
    date: "28th November 2024",
    stories: [
      {
        id: "1",
        image: "/Status.png",
        text: "Book reading",
        emoji: "📚",
      },
    ],
  },
];