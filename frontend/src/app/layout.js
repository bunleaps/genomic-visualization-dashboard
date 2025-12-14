import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { Inter } from 'next/font/google';

// Configure the font loader
const inter = Inter({
  subsets: ['latin'], // Specify the necessary subsets (e.g., 'latin')
  display: 'swap', // 'swap' ensures text remains visible while the font loads
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Genome Visualizer",
  description: "Interactive visualization of genomic features with detailed analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}
