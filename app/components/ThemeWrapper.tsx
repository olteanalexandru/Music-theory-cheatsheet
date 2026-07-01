"use client";

import { useState } from "react";
import Footer from "./Footer";
import AppHeader from "./AppHeader";
import Mushrooms from "./Mushrooms";
import PsychedelicStars from "./PsychedelicStars";
import { AuthProvider } from "@/app/utils/AuthContext";
import { LocaleProvider } from "@/app/utils/i18n/LocaleContext";

// Assuming geistSans and geistMono are passed as props or defined/imported here
// For simplicity, let's assume they are passed as props for now.
// You might need to adjust this based on how fonts are handled in layout.tsx

export type AppTheme = "dark" | "light" | "psychedelic";

const THEME_BODY_CLASS: Record<AppTheme, string> = {
  dark: "",
  light: "light-mode",
  psychedelic: "psychedelic-mode",
};

export default function ThemeWrapper({
  children,
  geistSansVariable,
  geistMonoVariable,
}: {
  children: React.ReactNode;
  geistSansVariable: string;
  geistMonoVariable: string;
}) {
  const [theme, setTheme] = useState<AppTheme>("light");

  return (
    <body
      className={`${geistSansVariable} ${geistMonoVariable} antialiased ${THEME_BODY_CLASS[theme]} flex min-h-screen flex-col`}
    >
      <LocaleProvider>
        <AuthProvider>
          <AppHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer theme={theme} setTheme={setTheme} />
        </AuthProvider>
      </LocaleProvider>
      {theme === "psychedelic" && <Mushrooms />}
      {theme === "psychedelic" && <PsychedelicStars />}
    </body>
  );
}
