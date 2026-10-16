"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { CalendarDays, Compass, Plus, Settings2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { label: "Discover events", href: "/events", icon: Compass, exact: true },
  { label: "My events", href: "/events?view=mine", icon: CalendarDays, exact: false },
  { label: "Create an event", href: "/events/create", icon: Plus, exact: false },
]

export function EventsSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <aside className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col rounded-2xl border border-border bg-card overflow-hidden mb-5">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays size={21} />
          </div>
          <div>
            <p className="font-semibold text-foreground">Events</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Find your next gathering</p>
          </div>
        </div>
      </div>

      <nav aria-label="Events navigation" className="flex-1 space-y-1 p-3">
        {items.map(({ label, href, icon: Icon, exact }) => {
          const baseHref = href.split("?")[0]
          const active = href.includes("?view=mine")
            ? pathname === "/events" && searchParams.get("view") === "mine"
            : exact
              ? pathname === baseHref && searchParams.get("view") !== "mine"
              : pathname === baseHref || pathname.startsWith(`${baseHref}/`)

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings2 size={18} />
          Settings
        </Link>
        <div className="mt-3 rounded-xl bg-muted/60 p-4">
          <Users size={19} className="text-primary" />
          <p className="mt-3 text-sm font-semibold text-foreground">Bring people together</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Create an event and keep the details, guests, and resources in one place.
          </p>
          <Link href="/events/create" className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">
            Create event
          </Link>
        </div>
      </div>
    </aside>
  )
}
