"use client";

/* =========================================================
   KEYWORDPERFORMANCE PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function KeywordPerformancePanel() {
  const { liveKeywordRows } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        KEYWORD PERFORMANCE
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <a
            href="/seo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-blue-600 hover:underline"
          >
            View Data
          </a>
        }
      >
        Keyword Performance
      </PanelTitle>

      <div className="grid grid-cols-[1fr_42px_62px_50px] gap-1 px-3 text-[9px] font-bold">
        <span>
          Keyword
        </span>

        <span>
          Clicks
        </span>

        <span>
          Impressions
        </span>

        <span>
          Position
        </span>

        {liveKeywordRows.map(
          (row) => (
            <div
              className="contents"
              key={
                row[0]
              }
            >
              <span className="py-[3px]">
                {
                  row[0]
                }
              </span>

              <span className="py-[3px]">
                {
                  row[1]
                }
              </span>

              <span className="py-[3px]">
                {
                  row[2]
                }
              </span>

              <span className="py-[3px] text-emerald-700">
                {
                  row[3]
                }{" "}
                ↑
              </span>
            </div>
          ),
        )}
      </div>
    </Panel>

    </>
  );
}
