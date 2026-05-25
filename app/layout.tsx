import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MatchAnimation from "@/components/MatchAnimation";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  weight: ['700'],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stake - World's Largest Online Casino and Sportsbook",
  description: "Play online casino games and sports betting at Stake.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, dancingScript.variable)}
    >
      <body className="min-h-full flex flex-col">
        <MatchAnimation />
        {children}
      </body>
    </html>
  );
}
