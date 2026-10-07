"use client";

/* =========================================================
   ANALYTICS PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  ArrowRight,
  Users,
} from "lucide-react";
import {
  AnimatedCounter,
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function AnalyticsPanel() {
  const { analytics, number, growthText, duration, analyticsChartData } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        ANALYTICS
    ================================================= */}

    <Panel className="flex h-full flex-col justify-between">
      <div>
        <PanelTitle
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
              >
                View Report

                <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
              </button>
            </div>
          }
        >
          Analytics Overview
        </PanelTitle>

        <div className="grid grid-cols-4 gap-1.5 px-3 pt-3">
          {[
            {
              label:
                "Users",

              value:
                analytics
                  ? number(
                    analytics.users,
                  )
                  : "—",

              delta:
                analytics
                  ? growthText(
                    analytics
                      .growth
                      .users,
                  )
                  : "No Live Data",

              good:
                true,

              bg:
                "bg-[#eff6ff] border-[#dbeafe]",

              valColor:
                "text-blue-900",
            },

            {
              label:
                "Page Views",

              value:
                analytics
                  ? number(
                    analytics.pageViews,
                  )
                  : "—",

              delta:
                analytics
                  ? growthText(
                    analytics
                      .growth
                      .pageViews,
                  )
                  : "No Live Data",

              good:
                true,

              bg:
                "bg-[#f0fdf4] border-[#dcfce7]",

              valColor:
                "text-emerald-900",
            },

            {
              label:
                "Avg. Session",

              value:
                analytics
                  ? duration(
                    analytics.averageSessionSeconds,
                  )
                  : "—",

              delta:
                analytics
                  ? growthText(
                    analytics
                      .growth
                      .averageSession,
                  )
                  : "No Live Data",

              good:
                true,

              bg:
                "bg-[#faf5ff] border-[#f3e8ff]",

              valColor:
                "text-purple-900",
            },

            {
              label:
                "Bounce Rate",

              value:
                analytics
                  ? `${analytics.bounceRate.toFixed(
                    1,
                  )}%`
                  : "—",

              delta:
                analytics
                  ? growthText(
                    analytics
                      .growth
                      .bounceRate,

                    true,
                  )
                  : "No Live Data",

              good:
                false,

              bg:
                "bg-[#fff7ed] border-[#ffedd5]",

              valColor:
                "text-amber-900",
            },
          ].map(
            (item) => (
              <div
                key={
                  item.label
                }
                className={`
                  rounded-[7px]
                  border
                  px-2
                  py-1.5

                  ${item.bg}
                `}
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px",
                }}
              >
                <p className="text-[9px] font-bold text-[#334666]">
                  {
                    item.label
                  }
                </p>

                <p
                  className={`
                    mt-0.5
                    text-[17px]
                    font-semibold
                    ${item.valColor}
                  `}
                  style={{
                    fontWeight: 600,
                  }}
                >
                  <AnimatedCounter
                    value={
                      item.value
                    }
                  />
                </p>

                <p
                  className={`
                    mt-0.5
                    text-[9px]
                    font-bold

                    ${item.good
                      ? "text-emerald-700"
                      : "text-rose-600"
                    }
                  `}
                >
                  {
                    item.delta
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-auto w-full min-h-0 px-3 pt-0 pb-3">
        <svg
          viewBox="0 0 430 110"
          preserveAspectRatio="none"
          className="block h-[95px] w-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="bar-blue-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3b82f6"
              />

              <stop
                offset="100%"
                stopColor="#1d4ed8"
              />
            </linearGradient>

            <linearGradient
              id="bar-emerald-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#10b981"
              />

              <stop
                offset="100%"
                stopColor="#047857"
              />
            </linearGradient>
          </defs>

          <g
            className="animate-grow-chart"
            style={{
              transformOrigin:
                "215px 90px",
            }}
          >
            {[
              20,
              44,
              68,
            ].map(
              (y) => (
                <line
                  key={
                    y
                  }
                  x1="12"
                  x2="420"
                  y1={
                    y
                  }
                  y2={
                    y
                  }
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ),
            )}

            <line
              x1="12"
              x2="420"
              y1="90"
              y2="90"
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />

            {analyticsChartData.map(
              (item) => (
                <g
                  key={
                    item.date
                  }
                >
                  <rect
                    x={
                      item.x -
                      12
                    }
                    y={
                      90 -
                      item.blueH
                    }
                    width="10"
                    height={
                      item.blueH
                    }
                    rx="3"
                    ry="3"
                    fill="url(#bar-blue-gradient)"
                  />

                  <rect
                    x={
                      item.x +
                      2
                    }
                    y={
                      90 -
                      item.emH
                    }
                    width="10"
                    height={
                      item.emH
                    }
                    rx="3"
                    ry="3"
                    fill="url(#bar-emerald-gradient)"
                  />

                  <text
                    x={
                      item.x
                    }
                    y="108"
                    textAnchor="middle"
                    fill="#2563eb"
                    fontSize="10.5"
                    fontWeight="600"
                  >
                    {
                      item.date
                    }
                  </text>
                </g>
              ),
            )}
          </g>
        </svg>
      </div>
    </Panel>

    </>
  );
}
