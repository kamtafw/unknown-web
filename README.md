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

