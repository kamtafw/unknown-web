```text
appscombo/
├── lib/
│   └── schemas.ts            # Zod schemas
│
├── app/                      # App Router based routing
│   ├── (auth)/               # Route groups for authentication pages
│   │   ├── login(sign-in)/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── create-new-password/page.tsx
│   ├── (onboarding)/
│   │   ├── verify/page.tsx
│   │   ├── security-verification/page.tsx
│   │   ├── complete-profile/page.tsx
│   │   ├── interests/page.tsx
│   │   └── friend-suggestions/page.tsx
│   ├── dashboard/            # Protected routes
│   │   └── page.tsx
│   └── layout.tsx            # Root layout
│
├── components/
│   ├── ui/                  # Shadcn-generated components
│   ├── layout/              # Layout-related components
│   ├── shared/              # Common UI: buttons, cards, etc.
│   ├── auth/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgot-password.tsx
│   │   ├── create-new-password.tsx
│   │   ├── terms-dialog.tsx
│   │   └── success-dialog.tsx
│   └── onboarding/
│       ├── otp-verification.tsx
│       ├── security-verification.tsx
│       ├── complete-profile.tsx
│       ├── choose-interests.tsx
│       └── friend-suggestions.tsx
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
```