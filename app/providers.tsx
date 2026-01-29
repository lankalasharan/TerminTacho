"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { DarkModeProvider } from "@/app/context/DarkModeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DarkModeProvider>{children}</DarkModeProvider>
    </SessionProvider>
  );
}
