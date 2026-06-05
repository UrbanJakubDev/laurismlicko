import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PinProvider } from "@/context/PinContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TRPCReactProvider } from "@/trpc/client";
import { BabyProvider } from "@/components/providers/BabyProvider";
import { PushProvider } from "@/components/providers/PushProvider";
import { TabBar } from "@/components/layout/TabBar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3B82F6",
};

export const metadata: Metadata = {
  title: "MíšaMlíčko",
  description: "Sledování krmení pro Míšu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MíšaMlíčko",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <TRPCReactProvider>
          <PinProvider>
            <BabyProvider>
              <PushProvider>
                <ProtectedRoute>
                  {children}
                  <TabBar />
                </ProtectedRoute>
              </PushProvider>
            </BabyProvider>
          </PinProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
