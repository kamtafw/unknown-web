"use client"

import { type FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock3, Compass, ImagePlus, LockKeyhole, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CreateEventPage() {
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [locked, setLocked] = useState(false)
  const [coverName, setCoverName] = useState("")
  const [passcode, setPasscode] = useState("")
  const [notice, setNotice] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const startDate = String(data.get("start_date") ?? "")
    const endDate = String(data.get("end_date") ?? "")
    const startTime = String(data.get("start_time") ?? "")
    const endTime = String(data.get("end_time") ?? "")

    if (startDate && endDate && `${endDate}T${endTime}` < `${startDate}T${startTime}`) {
      setNotice("The end date and time must be after the start date and time.")
      return
    }
    if (locked && !/^\d{4}$/.test(passcode)) {
      setNotice("Enter a 4-digit passcode. Leading zeroes are allowed.")
      return
    }

    setNotice("The form is ready, but event creation is not connected to the Events API yet.")
  }

  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-7 sm:py-8">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Back to events
        </Link>

        <div className="mt-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CalendarDays size={23} /></div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create an event</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Set up the essentials first. You can organise guests and share resources once your event is created.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Event details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Give people a clear idea of what you are planning.</p>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Event name <span className="text-destructive">*</span></span>
                <Input name="name" required maxLength={160} placeholder="e.g. Jos Creatives Meetup" className="h-11" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Description</span>
                <textarea name="description" rows={4} maxLength={5000} placeholder="What is the event about?" className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <div>
                <span className="text-sm font-medium text-foreground">Cover image</span>
                <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-border p-4 transition-colors hover:bg-accent/50">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ImagePlus size={21} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{coverName || "Add a cover image"}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">PNG or JPEG, up to 2 MB</span>
                  </span>
                  <span className="text-xs font-semibold text-primary">Browse</span>
                  <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 2 * 1024 * 1024) {
                      setNotice("Cover images must be 2 MB or smaller.")
                      e.target.value = ""
                      setCoverName("")
                      return
                    }
                    setCoverName(file.name)
                    setNotice("")
                  }} />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">When and where</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose the schedule and event location.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-foreground"><CalendarDays size={15} /> Start date *</span><Input type="date" name="start_date" required className="h-11" /></label>
              <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-foreground"><CalendarDays size={15} /> End date *</span><Input type="date" name="end_date" required className="h-11" /></label>
              <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-foreground"><Clock3 size={15} /> Start time *</span><Input type="time" name="start_time" required className="h-11" /></label>
              <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-foreground"><Clock3 size={15} /> End time *</span><Input type="time" name="end_time" required className="h-11" /></label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium text-foreground"><MapPin size={15} /> Location name</span><Input name="location_name" placeholder="Venue or meeting point" className="h-11" /></label>
              <label className="space-y-2"><span className="text-sm font-medium text-foreground">Address</span><Input name="address" placeholder="Street, area, city" className="h-11" /></label>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">A map pin and coordinates will be required before publishing. Location picking is not connected yet.</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Access and privacy</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose who can find and enter your event.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => { setVisibility("public"); setLocked(false) }} className={`rounded-xl border p-4 text-left transition-colors ${visibility === "public" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent/50"}`}>
                <Compass size={19} className="text-primary" /><span className="mt-3 block text-sm font-semibold text-foreground">Public event</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Discoverable by people nearby.</span>
              </button>
              <button type="button" onClick={() => { setVisibility("private"); setLocked(false) }} className={`rounded-xl border p-4 text-left transition-colors ${visibility === "private" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent/50"}`}>
                <Users size={19} className="text-primary" /><span className="mt-3 block text-sm font-semibold text-foreground">Private event</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Keep the event limited to your invitees.</span>
              </button>
            </div>
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-border p-4">
              <input type="checkbox" checked={locked} onChange={(e) => { setLocked(e.target.checked); if (e.target.checked) setVisibility("private") }} className="mt-1 size-4 accent-primary" />
              <span className="flex-1"><span className="flex items-center gap-2 text-sm font-semibold text-foreground"><LockKeyhole size={16} /> Require a passcode</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Guests will need a four-digit passcode to join. This makes the event private.</span></span>
            </label>
            {locked && <label className="mt-4 block space-y-2"><span className="text-sm font-medium text-foreground">4-digit passcode</span><Input value={passcode} onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="off" maxLength={4} placeholder="0000" className="h-11 max-w-xs tracking-[0.35em]" /></label>}
            <input type="hidden" name="visibility" value={visibility} />
          </section>

          {notice && <p role="status" className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground">{notice}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" className="h-11 rounded-xl"><Link href="/events">Cancel</Link></Button>
            <Button type="submit" className="h-11 rounded-xl px-6">Continue</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
