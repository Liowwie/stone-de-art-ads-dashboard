import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Link from "next/link";

export const metadata: Metadata = {
  title: "Stone De Art — Google Ads Dashboard",
  description: "Google Ads performance and lead dashboard for Stone De Art",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="print:hidden border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="font-semibold tracking-tight">
              Stone De Art <span className="text-slate-400 font-normal">· Google Ads Dashboard</span>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:text-slate-600">Dashboard</Link>
              <Link href="/report" className="hover:text-slate-600">Client Report</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
