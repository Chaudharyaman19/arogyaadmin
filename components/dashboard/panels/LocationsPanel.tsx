"use client";

/* =========================================================
   LOCATIONS PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function LocationsPanel() {
  const { locationRows } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        LOCATIONS
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <a
            href="/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-blue-600 hover:underline"
          >
            View Report
          </a>
        }
      >
        Top Sewa Help
        Locations
      </PanelTitle>

      <div className="space-y-3 px-3 pt-1 pb-1">
        {locationRows.map(
          (
            [
              name,
              count,
              pct,
            ],

            index,
          ) => (
            <div
              key={String(
                name,
              )}
              className="
                grid
                grid-cols-[62px_1fr_28px_42px]
                items-center
                gap-1.5
                text-[9px]
                font-bold
              "
            >
              <span className="text-[#4B1426]">
                {
                  name
                }
              </span>

              <div className="h-1.5 rounded-full bg-[#edf2f8]">
                <div
                  className="h-full rounded-full bg-[#4B1426]"
                  style={{
                    width: `${88 -
                      index *
                      14
                      }%`,
                  }}
                />
              </div>

              <span className="text-right">
                {
                  count
                }
              </span>

              <span className="text-right text-emerald-700">
                (
                {
                  pct
                }
                )
              </span>
            </div>
          ),
        )}
      </div>
    </Panel>

    </>
  );
}
