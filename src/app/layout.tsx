import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jarvis — AI Business Manager for Creators & Sellers",
  description: "Jarvis analyzes your YouTube, TikTok, Amazon, or Etsy and tells you exactly what to do to grow faster, rank higher, and earn more.",
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
      <body className="min-h-full flex flex-col bg-[#0f1117]">
        <ToastProvider>
          <NavbarWrapper />
          <main className="flex-1">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
