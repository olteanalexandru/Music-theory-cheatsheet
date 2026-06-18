"use client";

import { useState } from "react";
import Footer from "./Footer";

interface ThemeWrapperProps {
  children: React.ReactNode;
  geistSansVariable: string;
  geistMonoVariable: string;
}

export default function ThemeWrapper({ children, geistSansVariable, geistMonoVariable }: ThemeWrapperProps) {
  const [isLightMode, setIsLightMode] = useState(false);

  return (
    <body
      className={`${geistSansVariable} ${geistMonoVariable} antialiased ${isLightMode ? "light-mode" : ""}`}
    >
      {children}
      <Footer isLightMode={isLightMode} toggleLightMode={() => setIsLightMode((prev) => !prev)} />
    </body>
  );
}
