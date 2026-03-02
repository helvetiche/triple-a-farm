import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "yet-another-react-lightbox/styles.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Triple A Gamefarm - Rooster Farm Management System",
  description: "A comprehensive management system for gamefowl breeders to track rooster health, feed schedules, inventory, and sales.",
  icons: {
    icon: [
      { url: '/images/logo-png.png', media: '(prefers-color-scheme: light)' },
      { url: '/images/logo-white-png.png', media: '(prefers-color-scheme: dark)' },
      { url: '/images/logo-png.png' }, // fallback
    ],
    apple: [
      { url: '/images/logo-png.png', media: '(prefers-color-scheme: light)' },
      { url: '/images/logo-white-png.png', media: '(prefers-color-scheme: dark)' },
      { url: '/images/logo-png.png' }, // fallback
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
