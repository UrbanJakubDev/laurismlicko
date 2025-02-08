import type { Metadata } from "next";
import "./globals.css";
import { PinProvider } from "@/context/PinContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";



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
