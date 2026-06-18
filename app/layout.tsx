import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeWrapper from "./components/ThemeWrapper";

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
  title: "Music Theory Cheatsheet",
  description: "Explore scales, modes, arpeggios, and chords on an interactive bass or guitar fretboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <ThemeWrapper geistSansVariable={geistSans.variable} geistMonoVariable={geistMono.variable}>
        {children}
      </ThemeWrapper>
    </html>
  );
}
