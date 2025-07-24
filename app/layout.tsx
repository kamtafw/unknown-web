import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
// import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ReactQueryProvider from "@/lib/react-query-provider";

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "AppCombo",
  description: "Social media network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={workSans.variable}>
      <body className={workSans.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
