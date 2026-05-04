import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const nunitoSans = Nunito_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "EGORBUYER.COM",
  description: "Скоро...",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <head />
      <body className={nunitoSans.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f1f29",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
              border: "1px solid #282834",
            },
            success: {
              iconTheme: { primary: "#41a1cf", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            },
          }}
        />
      </body>
    </html>
  );
}
