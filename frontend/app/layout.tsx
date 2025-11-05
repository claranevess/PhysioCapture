import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import BottomNav from "@/components/Layout/BottomNav";
import ChatbotAI from "@/components/Chatbot/ChatbotAI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhysioCapture - Gestão de Prontuários",
  description: "Sistema de gestão unificado para clínicas de fisioterapia - Corehive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
          <ChatbotAI />
        </div>
      </body>
    </html>
  );
}
