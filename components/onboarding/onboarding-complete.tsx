"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface OnboardingCompleteProps {
  username?: string
}

export function OnboardingComplete({ username }: OnboardingCompleteProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter")

  useEffect(() => {
    const hold = setTimeout(() => setPhase("hold"), 600)
    const exit = setTimeout(() => setPhase("exit"), 1800)
    return () => {
      clearTimeout(hold)
      clearTimeout(exit)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      style={{
        animation:
          phase === "exit"
            ? "onboarding-fade-out 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards"
            : undefined,
      }}
    >
      <style>{`
        @keyframes onboarding-logo-in {
          from { opacity: 0; transform: scale(0.8) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes onboarding-text-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes onboarding-bar-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes onboarding-fade-out {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.04); }
        }
        .logo-anim {
          animation: onboarding-logo-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .text-anim {
          opacity: 0;
          animation: onboarding-text-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.35s forwards;
        }
        .sub-anim {
          opacity: 0;
          animation: onboarding-text-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.55s forwards;
        }
        .bar-anim {
          animation: onboarding-bar-fill 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
        }
      `}</style>

      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {/* Logo */}
        <div className="logo-anim">
          <Image
            src="/logo.svg"
            alt="AppsCombo"
            width={160}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Welcome text */}
        <div className="text-anim">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {username ? `Welcome, ${username}! 🎉` : "Welcome aboard! 🎉"}
          </h1>
        </div>

        <p className="sub-anim text-sm text-gray-500 max-w-xs leading-relaxed">
          Your feed is getting personalised. This will only take a moment.
        </p>

        {/* Progress bar */}
        <div className="sub-anim w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="bar-anim h-full rounded-full"
            style={{ width: 0, background: "#6A88D1" }}
          />
        </div>
      </div>
    </div>
  )
}