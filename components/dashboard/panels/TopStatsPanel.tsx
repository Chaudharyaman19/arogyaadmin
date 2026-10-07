"use client";

/* =========================================================
   TOPSTATS PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  ArrowRight,
} from "lucide-react";
import {
  AnimatedCounter,
  Panel,
  toneClass,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function TopStatsPanel() {
  const { liveIssues, topStats } = useDashboardPanels();

  return (
    <>
  {/* =============================
      TOP STATS
  ============================== */}

  <div className="grid min-h-0 grid-cols-6 gap-2">
    {topStats.map(
      (item) => {
        const Icon =
          item.icon;

        return (
          <Panel
            key={
              item.title
            }
            className="
              flex
              flex-col
              !overflow-hidden
              p-2
              !pb-5.5
            "
            style={{
              background:
                item.gradient,

              borderColor:
                (item as any).borderColor || undefined,

              boxShadow:
                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            }}
          >
            <div className="flex items-start gap-1.5">
              <div
                className={`
                  grid
                  h-[30px]
                  w-[30px]
                  shrink-0
                  place-items-center
                  rounded-full
                  ring-1
                  bg-white/80
                  shadow-xs

                  ${toneClass[
                  item.tone as keyof typeof toneClass
                  ]
                  }
                `}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900"
                  style={{
                    fontWeight: 600,
                    color:
                      "#0f172a",
                  }}
                >
                  {
                    item.title
                  }
                </p>

                <div className="mt-1.5 flex items-end gap-1">
                  <span
                    className="text-[21px] !font-semibold leading-none tracking-[-0.04em]"
                    style={{
                      color:
                        item.numColor,

                      fontWeight: 600,
                    }}
                  >
                    <AnimatedCounter
                      value={
                        item.value
                      }
                    />
                  </span>

                  {item.suffix && (
                    <span className="mb-0.5 text-[9.5px] font-bold">
                      {
                        item.suffix
                      }
                    </span>
                  )}
                </div>

                <p
                  className={`
                    mt-0.5
                    text-[8.5px]
                    font-bold

                    ${item.title ===
                      "INDEXED PAGES"
                      ? "text-blue-600"
                      : "text-emerald-700"
                    }
                  `}
                >
                  {
                    item.note
                  }
                </p>
              </div>
            </div>

            <div
              onClick={() => window.open(item.href || "/pages", "_blank")}
              className="absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600"
            >
              {
                item.footer
              }

              <ArrowRight className="h-3 w-3" />
            </div>
          </Panel>
        );
      },
    )}
  </div>

    </>
  );
}
