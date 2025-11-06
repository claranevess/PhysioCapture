'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import ChatbotAI from "@/components/Chatbot/ChatbotAI";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Páginas públicas que não devem mostrar Header/BottomNav
  const publicPages = ['/', '/login', '/register', '/welcome'];
  const isPublicPage = publicPages.includes(pathname);

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="min-h-screen flex flex-col">
          {!isPublicPage && <Header />}
          <main className={!isPublicPage ? "flex-1 pb-20 md:pb-0" : "flex-1"}>
            {children}
          </main>
          {!isPublicPage && <BottomNav />}
          {!isPublicPage && <ChatbotAI />}
        </div>
      </body>
    </html>
  );
}
