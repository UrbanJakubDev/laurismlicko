import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PinProvider } from "@/context/PinContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import Link from 'next/link'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Baby Tracker",
  description: "Track your baby's feeds and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PinProvider>
          <ProtectedRoute>
            {children}
            <Navigation />
          </ProtectedRoute>
        </PinProvider>
      </body>
    </html>
  );
}
