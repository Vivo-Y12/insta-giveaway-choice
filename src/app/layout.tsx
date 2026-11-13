import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insta Giveaway Choice — Fair Instagram Winner Picker",
  description:
    "Free, transparent, cryptographically-secure Instagram giveaway picker. Paste comments, set rules, and draw random winners with animated reveal and confetti.",
  keywords: [
    "Instagram giveaway",
    "giveaway picker",
    "random winner",
    "comment picker",
    "insta giveaway choice",
    "raffle tool",
  ],
  authors: [{ name: "BS-Ji-007" }],
  openGraph: {
    title: "Insta Giveaway Choice",
    description: "Fair, transparent Instagram giveaway winner picker.",
    siteName: "Insta Giveaway Choice",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insta Giveaway Choice",
    description: "Fair, transparent Instagram giveaway winner picker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
