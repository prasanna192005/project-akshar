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
  title: "AKSHAR | Tactical Multiplayer Battle",
  description: "A competitive multiplayer typing race set in an industrial-tactical universe. Master your protocols, deploy your agents, and seize victory.",
  keywords: ["typing racer", "multiplayer game", "tactical typing", "AKSHAR"],
  authors: [{ name: "Prasanna" }],
  openGraph: {
    title: "AKSHAR | Tactical Multiplayer Battle",
    description: "A high-stakes typing battle with agents and abilities. Compete in real-time.",
    type: "website",
    locale: "en_US",
    siteName: "AKSHAR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AKSHAR | Tactical Multiplayer Battle",
    description: "The ultimate tactical typing experience. Deploy your agent now.",
  },
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
        {children}
      </body>
    </html>
  );
}
