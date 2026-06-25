"use client";

import { useState } from "react";
import Footer from "./Footer";
import AppHeader from "./AppHeader";
import { AuthProvider } from "@/app/utils/AuthContext";

// Assuming geistSans and geistMono are passed as props or defined/imported here
// For simplicity, let's assume they are passed as props for now.
// You might need to adjust this based on how fonts are handled in layout.tsx

export default function ThemeWrapper({
  children,
  geistSansVariable,
  geistMonoVariable,
}: {
  children: React.ReactNode;
  geistSansVariable: string;
  geistMonoVariable: string;
}) {
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <body
      className={`${geistSansVariable} ${geistMonoVariable} antialiased ${
        isLightMode ? "light-mode" : ""
      }`}
    >
      <AuthProvider>
        <AppHeader />
        {children}
        <Footer isLightMode={isLightMode} toggleLightMode={toggleLightMode} />
      </AuthProvider>
    </body>
  );
}
