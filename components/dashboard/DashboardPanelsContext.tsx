"use client";

/* =========================================================
   Shared dashboard state consumed by the individual
   dashboard panels.
========================================================= */

import { createContext, useContext, type ReactNode } from "react";

export type DashboardPanelsContextValue = Record<string, any>;

const DashboardPanelsContext = createContext<DashboardPanelsContextValue | null>(null);

export function useDashboardPanels(): DashboardPanelsContextValue {
  const ctx = useContext(DashboardPanelsContext);
  if (!ctx) throw new Error("useDashboardPanels must be used inside <DashboardPanelsProvider>");
  return ctx;
}

export function DashboardPanelsProvider({
  value,
  children,
}: {
  value: DashboardPanelsContextValue;
  children: ReactNode;
}) {
  return <DashboardPanelsContext.Provider value={value}>{children}</DashboardPanelsContext.Provider>;
}
