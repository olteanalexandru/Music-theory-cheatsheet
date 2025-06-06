import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeWrapper from "./components/ThemeWrapper"; // Import the new client component

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

// Metadata remains here in the Server Component
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State logic is removed from here
  return (
    <html lang="en">
      {/* Use ThemeWrapper to handle client-side state and wrap the body */}
      <ThemeWrapper
        geistSansVariable={geistSans.variable}
        geistMonoVariable={geistMono.variable}
      >
        {children}
      </ThemeWrapper>
    </html>
  );
}
