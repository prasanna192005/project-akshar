import { AudioProvider } from "@/context/AudioContext";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akshar19.vercel.app"),
  title: "AKSHAR Typing Game | Tactical Multiplayer Battle",
  description: "Experience the ultimate tactical typing racer with AKSHAR. Deploy agents with unique abilities, master real-time protocols, and compete in the web's most distributed typing engine. Free online multiplayer typing game.",
  keywords: [
    "AKSHAR", "AKSHAR Typing Game", "tactical typing racer", "multiplayer typing game",
    "real-time distributed state", "cyberpunk typing game", "online typing contest",
    "competitive typing", "coding typing game", "Indian-themed agents"
  ],
  authors: [{ name: "Prasanna", url: "https://github.com/prasanna192005" }],
  publisher: "AKSHAR SYSTEMS",
  openGraph: {
    title: "AKSHAR Typing Game | Tactical Multiplayer Battle",
    description: "High-stakes tactical hero-racer. Experience sub-100ms synchronization and strategic agent abilities in the AKSHAR Typing Engine.",
    url: "https://akshar19.vercel.app",
    siteName: "AKSHAR Typing",
    images: [
      {
        url: "/architecture.png",
        width: 1200,
        height: 630,
        alt: "AKSHAR Tactical Engine Architecture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AKSHAR Typing Game | Tactical Multiplayer Battle",
    description: "Seize victory in the industrial-tactical typing arena with AKSHAR.",
    images: ["/architecture.png"],
  },
  alternates: {
    canonical: "https://akshar19.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "VideoGame",
      "name": "AKSHAR",
      "genre": ["Action", "Typing", "Tactical"],
      "gamePlatform": ["Web Browser"],
      "author": {
        "@type": "Person",
        "name": "Prasanna"
      },
      "description": "A high-performance tactical multiplayer typing battle set in an industrial universe.",
      "url": "https://akshar19.vercel.app"
    },
    {
      "@type": "SoftwareApplication",
      "name": "AKSHAR Engine",
      "operatingSystem": "Web",
      "applicationCategory": "GameApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} antialiased bg-[#0F1923] text-white font-rajdhani`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AudioProvider>
          {children}
        </AudioProvider>
        <Analytics />
      </body>
    </html>
  );
}
