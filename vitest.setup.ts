import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: function Link({ 
    children, 
    href 
  }: { 
    children: React.ReactNode; 
    href: string 
  }) {
    return React.createElement('a', { href }, children);
  },
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => 
    React.createElement('img', props),
}));
