"use client";

/* =========================================================
   TOPPAGES PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  Search,
} from "lucide-react";
import {
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function TopPagesPanel() {
  const { liveTopPages } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        TOP PAGES
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <a
            href="/pages"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-blue-600 hover:underline"
          >
            View All
          </a>
        }
      >
        Top Pages by
        Traffic
      </PanelTitle>

      <div className="px-3 text-[9px]">
        {liveTopPages.map(
          (
            row,
            index,
          ) => (
            <div
              key={
                row[0]
              }
              className="
                grid
                grid-cols-[16px_1fr_76px_42px_14px]
                items-center
                gap-2
                py-1.5
                font-bold
              "
            >
              <span>
                {index +
                  1}
                .
              </span>

              <span>
                {
                  row[0]
                }
              </span>

              <span className="truncate text-[#4B1426]">
                {
                  row[1]
                }
              </span>

              <span className="text-right">
                {
                  row[2]
                }
              </span>

              <Search className="h-3 w-3 text-[#9aa5b4]" />
            </div>
          ),
        )}
      </div>
    </Panel>

    </>
  );
}
