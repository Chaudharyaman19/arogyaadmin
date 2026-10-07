"use client";

/* =========================================================
   RECENTSUBMISSIONS PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function RecentSubmissionsPanel() {
  const { submissionRows } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        RECENT SUBMISSIONS
    ================================================= */}

    <Panel
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px",
      }}
    >
      <PanelTitle
        right={
          <button
            type="button"
            onClick={() => window.open("/submissions", "_blank")}
            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
          >
            View All

            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      >
        Recent Form
        Submissions
      </PanelTitle>

      <div className="px-3">
        {submissionRows.map(
          (
            row,
            index,
          ) => (
            <div
              key={
                row.id
              }
              className="
                grid
                grid-cols-[20px_auto_auto_1fr]
                items-center
                gap-1.5
                py-[3px]
                text-[9px]
                font-bold
              "
            >
              <div
                className={`
                  grid
                  h-[20px]
                  w-[20px]
                  place-items-center
                  rounded-full

                  ${index === 0
                    ? "bg-emerald-50 text-emerald-700"
                    : index === 1
                      ? "bg-violet-50 text-violet-700"
                      : index === 2
                        ? "bg-amber-50 text-amber-700"
                        : index === 3
                          ? "bg-rose-50 text-rose-700"
                          : "bg-blue-50 text-blue-700"
                  }
                `}
              >
                <FileText className="h-3 w-3" />
              </div>

              <span className="whitespace-nowrap text-[#4B1426]">
                {
                  row.name
                }
              </span>

              <span className="whitespace-nowrap text-blue-600">
                {
                  row.action
                }
              </span>

              <span className="whitespace-nowrap text-right text-[#43526d]">
                {
                  row.date
                }
              </span>
            </div>
          ),
        )}
      </div>
    </Panel>

    </>
  );
}
