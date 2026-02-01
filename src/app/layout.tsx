import type { Metadata } from "next";
import { Inter, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Primary font: DM Sans - friendly, modern, great readability
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Secondary/body font: Inter - clean, professional
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mono font for any code/technical display
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Physiotherapist",
  description: "Interactive pain assessment tool with AI-powered analysis",
  manifest: "/manifest.json",
  themeColor: "#0d9488",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PhysioAI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
