This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


appCombo/
│
├── app/                      # App Router based routing
│   ├── (auth)/               # Route groups for authentication pages
│   │   └── login/page.tsx
│   ├── dashboard/            # Protected routes
│   │   └── page.tsx
│   └── layout.tsx            # Root layout
│
├── components/              # Reusable components
│   ├── ui/                  # Shadcn-generated components
│   ├── layout/              # Layout-related components
│   ├── shared/              # Common UI: buttons, cards, etc.
│   └── auth/                # Auth-specific UI like LoginForm
│
├── hooks/                   # Reusable hooks
│   ├── useAuth.ts           # Auth context hook (Lucia)
│   └── useUser.ts           # User fetching hook (React Query)
│
├── lib/                     # Core logic and config
│   ├── auth/                # Lucia auth config, middleware
│   ├── api/                 # API wrappers (e.g., axios or fetch logic)
│   ├── queryClient.ts       # React Query client config
│   └── utils.ts             # Utility functions
│
├── store/                   # Zustand global state
│   └── userStore.ts
│
├── types/                   # TypeScript types/interfaces
│   └── index.d.ts
│
├── styles/                  # Tailwind base styles
│   └── globals.css
│
├── middleware.ts            # Next.js Middleware (e.g. auth checks)
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js

