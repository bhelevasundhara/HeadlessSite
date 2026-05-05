import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ABC Heavy Equipments | Find the Right Machine",
  description: "Search ABC heavy equipment products. Compact loaders, excavators, telehandlers and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-white" suppressHydrationWarning>
        {/* Navbar */}
        <header className="bg-[#1a1f2e] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#e63329] rounded-sm flex items-center justify-center font-black text-white text-sm">A</div>
              <span className="font-bold text-lg tracking-tight">ABC Heavy Equipments</span>
            </Link>
            <nav className="flex gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-[#e63329] transition-colors pb-1 border-b-2 border-transparent hover:border-[#e63329]">Home</Link>
              <Link href="/about" className="hover:text-[#e63329] transition-colors pb-1 border-b-2 border-transparent hover:border-[#e63329]">About</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-[#1a1f2e] text-gray-400 text-center py-4 text-sm">
          © 2024 All rights reserved
        </footer>
      </body>
    </html>
  );
}
