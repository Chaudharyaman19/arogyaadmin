"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import Link from "next/link";

import typography from "./DashboardTypography.module.css";

import {
  dashboardApi,
  type LiveDashboardOverview,
} from "@/lib/dashboardApi";
import { useAppSelector } from "@/store/hooks";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileSearch,
  FileText,
  Globe2,
  ImageIcon,
  Link2,
  LockKeyhole,
  Menu,
  MousePointerClick,
  Search,
  ShieldCheck,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
  X,
  Edit,
  Trash2,
  Eye,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatedCounter,
  Panel,
  PanelTitle,
  defaultTopStats,
  toneClass,
  type DashboardIssue,
  type DropdownKey,
} from "@/components/dashboard/DashboardPanels";
import {
  TopStatsPanel,
  SeoHealthPanel,
  SearchConsolePanel,
  AnalyticsPanel,
  CoreWebVitalsPanel,
  SiteStatusPanel,
  TopPagesPanel,
  KeywordPerformancePanel,
  LocationsPanel,
  RecentSubmissionsPanel,
} from "@/components/dashboard/panels";
import {
  DashboardPanelsProvider,
  type DashboardPanelsContextValue,
} from "@/components/dashboard/DashboardPanelsContext";

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const { admin } = useAppSelector((state) => state.auth);
  const [cachedPageSpeed, setCachedPageSpeed] = useState<LiveDashboardOverview["sources"]["pageSpeed"]["data"]>(null);
  const [
    liveDashboard,
    setLiveDashboard,
  ] =
    useState<LiveDashboardOverview | null>(
      null,
    );

  const [
    openDropdown,
    setOpenDropdown,
  ] =
    useState<DropdownKey>(
      null,
    );

  const [
    selectedWebsite,
    setSelectedWebsite,
  ] = useState(
    "arogyabharat.org",
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    "31 May 2026",
  );

  const [
    activeMenuItem,
    setActiveMenuItem,
  ] = useState(
    "Dashboard",
  );

  const [
    notificationCount,
    setNotificationCount,
  ] = useState(8);

  /* =========================================================
     DASHBOARD DATA
  ========================================================= */

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("arogya-dashboard-pagespeed");
      if (stored) setCachedPageSpeed(JSON.parse(stored));
    } catch {
      // Ignore an invalid or unavailable browser cache.
    }
  }, []);

  useEffect(() => {
    const current = liveDashboard?.sources.pageSpeed;
    if (current?.status === "connected" && current.data) {
      setCachedPageSpeed(current.data);
      window.localStorage.setItem("arogya-dashboard-pagespeed", JSON.stringify(current.data));
    }
  }, [liveDashboard?.sources.pageSpeed]);

  useEffect(() => {
    let active = true;

    dashboardApi
      .overview()
      .then((data) => {
        if (active) {
          setLiveDashboard(
            data,
          );
        }
      })
      .catch(() => {
        if (active) {
          setLiveDashboard(
            null,
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !liveDashboard ||
      liveDashboard.sources.pageSpeed.data?.lighthouseAvailable === true
    ) {
      return;
    }

    let active = true;

    const refresh =
      async () => {
        try {
          const pageSpeed =
            await dashboardApi.pageSpeed();

          if (active) {
            setLiveDashboard(
              (current) =>
                current
                  ? {
                    ...current,

                    sources: {
                      ...current.sources,

                      pageSpeed,
                    },
                  }
                  : current,
            );
          }
        } catch {
          // Keep latest truthful state.
        }
      };

    const timer =
      window.setInterval(
        refresh,
        10_000,
      );

    void refresh();

    return () => {
      active = false;

      window.clearInterval(
        timer,
      );
    };
  }, [
    liveDashboard?.sources.pageSpeed.data?.lighthouseAvailable,
  ]);

  useEffect(() => {
    if (
      !liveDashboard ||
      liveDashboard.sources
        .indexCoverage
        ?.status ===
      "connected"
    ) {
      return;
    }

    let active = true;

    const refresh =
      async () => {
        try {
          const indexCoverage =
            await dashboardApi.indexCoverage();

          if (active) {
            setLiveDashboard(
              (current) =>
                current
                  ? {
                    ...current,

                    sources: {
                      ...current.sources,

                      indexCoverage,
                    },
                  }
                  : current,
            );
          }
        } catch {
          // Preserve last source state.
        }
      };

    const timer =
      window.setInterval(
        refresh,
        10_000,
      );

    return () => {
      active = false;

      window.clearInterval(
        timer,
      );
    };
  }, [
    liveDashboard?.sources
      .indexCoverage
      ?.status,
  ]);

  useEffect(() => {
    if (
      !liveDashboard ||
      liveDashboard.sources
        .siteStatus
        ?.status ===
      "connected"
    ) {
      return;
    }

    let active = true;

    const refresh =
      async () => {
        try {
          const siteStatus =
            await dashboardApi.siteStatus();

          if (active) {
            setLiveDashboard(
              (current) =>
                current
                  ? {
                    ...current,

                    sources: {
                      ...current.sources,

                      siteStatus,
                    },
                  }
                  : current,
            );
          }
        } catch {
          /* retry */
        }
      };

    const timer =
      window.setInterval(
        refresh,
        5_000,
      );

    return () => {
      active = false;

      window.clearInterval(
        timer,
      );
    };
  }, [
    liveDashboard?.sources
      .siteStatus
      ?.status,
  ]);

  /* =========================================================
     LIVE DATA
  ========================================================= */

  const internal =
    liveDashboard?.sources
      .internal.data;

  const analytics =
    liveDashboard?.sources
      .analytics.data;

  const searchConsole =
    liveDashboard?.sources
      .searchConsole.data;

  const pageSpeedSource =
    liveDashboard?.sources
      .pageSpeed;

  const pageSpeed =
    liveDashboard?.sources
      .pageSpeed.data ?? cachedPageSpeed;

  const indexCoverageSource =
    liveDashboard?.sources
      .indexCoverage;

  const indexCoverage =
    indexCoverageSource?.data;

  const siteStatus =
    liveDashboard?.sources
      .siteStatus?.data;

  const seoScore =
    pageSpeed?.seoScore ?? 0;

  /* =========================================================
     ACTION REQUIRED
  ========================================================= */

  const liveIssues: DashboardIssue[] = [
    {
      label: "3 Exhibitor Stall Bookings pending approval",
      level: "High" as const,
      count: 3,
      icon: FileSearch,
      tone: "rose" as const,
    },
    {
      label: "12 International Buyer Registrations requiring verification",
      level: "Medium" as const,
      count: 12,
      icon: Activity,
      tone: "amber" as const,
    },
    {
      label: "2 Sponsorship Enquiries for Premium Pavilion",
      level: "Medium" as const,
      count: 2,
      icon: AlertCircle,
      tone: "amber" as const,
    },
    {
      label: "5 Trade Visitor Pass Requests queued",
      level: "Low" as const,
      count: 5,
      icon: Timer,
      tone: "violet" as const,
    },
  ];

  const number = (
    value: number,
  ) =>
    new Intl.NumberFormat(
      "en-IN",
    ).format(
      Math.round(value),
    );

  const duration = (
    seconds: number,
  ) =>
    `${String(
      Math.floor(
        seconds / 60,
      ),
    ).padStart(
      2,
      "0",
    )}:${String(
      Math.round(
        seconds % 60,
      ),
    ).padStart(
      2,
      "0",
    )}`;

  const growthText = (
    value:
      | number
      | null
      | undefined,

    inverse = false,
  ) => {
    if (value == null) {
      return "—";
    }

    const adjusted =
      inverse
        ? -value
        : value;

    return `${adjusted >= 0
      ? "↑"
      : "↓"
      } ${Math.abs(
        value,
      ).toFixed(1)}%`;
  };

  const locationRows =
    internal?.topLocations
      .length
      ? internal.topLocations.map(
        (item) =>
          [
            item.city,

            item.count,

            `${internal.totalEnquiries >
              0
              ? (
                (item.count /
                  internal.totalEnquiries) *
                100
              ).toFixed(
                1,
              )
              : "0.0"
            }%`,
          ] as [
            string,
            number,
            string,
          ],
      )
      : [];

  const submissionRows =
    internal?.recentSubmissions
      ?.length
      ? internal.recentSubmissions.map(
        (item) => {
          let typeStr = item.type.toLowerCase().replace("contact", "form").replaceAll("_", " ");

          // To simulate an activity log visually, we can just use "Created" 
          // (Since we don't have edited/deleted status in the API yet)
          let actionText = `Created ${typeStr}`;

          return {
            id: item.id || item.name,
            name: item.name.split(" ")[0],
            action: actionText,
            date: new Date(item.createdAt).toLocaleDateString("en-IN", {
              weekday: "long",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
      )
      : [];

  const liveTopPages = (
    analytics?.pages ?? []
  )
    .slice(0, 5)
    .map((item) => {
      const name =
        item.path === "/"
          ? "Home"
          : item.path
            .split("/")
            .filter(
              Boolean,
            )
            .pop()
            ?.replaceAll(
              "-",
              " ",
            ) ||
          item.path;

      return [
        name,
        item.path,
        number(item.views),
      ] as [
          string,
          string,
          string,
        ];
    });

  const liveKeywordRows = (
    searchConsole?.queries ??
    []
  )
    .slice(0, 5)
    .map((item) => [
      item.query,

      number(item.clicks),

      number(
        item.impressions,
      ),

      item.position.toFixed(
        1,
      ),
    ]) as [
      string,
      string,
      string,
      string,
    ][];

  const analyticsDaily =
    analytics?.daily ?? [];

  const analyticsChartSamples =
    analyticsDaily.length <=
      5
      ? analyticsDaily
      : [
        0,
        0.25,
        0.5,
        0.75,
        1,
      ].map(
        (ratio) =>
          analyticsDaily[
          Math.round(
            (analyticsDaily.length -
              1) *
            ratio,
          )
          ],
      );

  const analyticsChartMax =
    Math.max(
      1,

      ...analyticsChartSamples.flatMap(
        (item) => [
          item.users,
          item.pageViews,
        ],
      ),
    );

  const analyticsChartData =
    analyticsChartSamples.map(
      (
        item,
        index,
      ) => {
        const date =
          item.date.length === 8
            ? new Date(
              `${item.date.slice(
                0,
                4,
              )}-${item.date.slice(
                4,
                6,
              )}-${item.date.slice(
                6,
                8,
              )}T00:00:00`,
            ).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month:
                  "short",
              },
            )
            : item.date;

        return {
          date,

          x:
            48 +
            index * 90,

          blueH:
            (item.users /
              analyticsChartMax) *
            72,

          emH:
            (item.pageViews /
              analyticsChartMax) *
            72,
        };
      },
    );

  /* =========================================================
     TOP STATS LIVE DATA
  ========================================================= */

  const topStats =
    defaultTopStats.map(
      (item) => {
        if (
          item.title ===
          "SEO HEALTH SCORE" &&
          pageSpeed
        ) {
          return {
            ...item,

            value: String(
              pageSpeed.seoScore,
            ),

            note:
              pageSpeed.seoScore >=
                90
                ? "Excellent"
                : pageSpeed.seoScore >=
                  70
                  ? "Good"
                  : "Needs Work",
          };
        }

        if (
          item.title ===
          "SEO HEALTH SCORE"
        ) {
          return {
            ...item,

            value: "—",

            note:
              pageSpeedSource?.message ??
              "Connecting to PageSpeed",
          };
        }

        if (
          item.title ===
          "TOTAL PAGES" &&
          internal
        ) {
          return {
            ...item,

            value: String(
              internal.totalPages,
            ),

            note:
              "Live from CMS",
          };
        }

        if (
          item.title ===
          "TOTAL POSTS" &&
          internal
        ) {
          return {
            ...item,

            value: String(
              internal.totalPosts,
            ),

            note:
              growthText(
                internal.growth
                  .posts,
              ),
          };
        }

        if (
          item.title ===
          "INDEXED PAGES" &&
          indexCoverage
        ) {
          return {
            ...item,

            value: `${indexCoverage.indexed}/${indexCoverage.total}`,

            note: `${indexCoverage.total >
              0
              ? (
                (indexCoverage.indexed /
                  indexCoverage.total) *
                100
              ).toFixed(1)
              : "0.0"
              }% Indexed`,
          };
        }

        if (
          item.title ===
          "INDEXED PAGES"
        ) {
          return {
            ...item,

            value: "—",

            note:
              indexCoverageSource?.message ??
              "Connecting to Search Console",
          };
        }

        if (
          item.title ===
          "EXPO ENQUIRIES (MTD)" &&
          internal
        ) {
          return {
            ...item,

            value: String(
              internal.enquiriesMtd,
            ),

            note:
              growthText(
                internal.growth
                  .enquiriesMtd,
              ),
          };
        }

        if (
          item.title ===
          "CONVERSION RATE" &&
          analytics
        ) {
          const rate =
            analytics.sessions >
              0
              ? (analytics.conversions /
                analytics.sessions) *
              100
              : 0;

          return {
            ...item,

            value: `${rate.toFixed(
              1,
            )}%`,

            note:
              growthText(
                analytics.growth
                  .conversionRate,
              ),
          };
        }

        return item;
      },
    );

  /* =========================================================
     DROPDOWN
  ========================================================= */

  const toggleDropdown = (
    key: DropdownKey,
  ) => {
    setOpenDropdown(
      (current) =>
        current === key
          ? null
          : key,
    );
  };

  const [
    searchConsoleRange,
    setSearchConsoleRange,
  ] = useState(
    "Last 28 Days",
  );

  const [
    analyticsRange,
    setAnalyticsRange,
  ] = useState(
    "Last 30 Days",
  );

  const [
    webVitalsRange,
    setWebVitalsRange,
  ] = useState(
    "Last 28 Days",
  );

  const [
    topPagesRange,
    setTopPagesRange,
  ] = useState(
    "This Month",
  );

  const [
    keywordRange,
    setKeywordRange,
  ] = useState(
    "This Month",
  );

  const [
    locationRange,
    setLocationRange,
  ] = useState(
    "This Month",
  );

  useEffect(() => {
    const handleMouseDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          "[data-dashboard-dropdown]",
        )
      ) {
        setOpenDropdown(
          null,
        );
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setOpenDropdown(
          null,
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleMouseDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const panelsCtx: DashboardPanelsContextValue = {
    liveDashboard,
    liveIssues,
    topStats,
    analytics,
    number,
    growthText,
    duration,
    analyticsChartData,
    pageSpeedSource,
    pageSpeed,
    seoScore,
    searchConsole,
    liveKeywordRows,
    searchConsoleRange, setSearchConsoleRange,
    analyticsRange, setAnalyticsRange,
    indexCoverageSource,
    indexCoverage,
    siteStatus,
    internal,
    submissionRows,
    locationRows,
    liveTopPages,
    webVitalsRange, setWebVitalsRange,
    topPagesRange, setTopPagesRange,
    keywordRange, setKeywordRange,
    locationRange, setLocationRange,
  };

  const content = (
    <div
      className={`
        ${typography.dashboard}
        min-h-full
        w-full
        overflow-visible
        bg-white
        text-[#13213d]
      `}
    >
      <div className="flex min-h-full flex-col overflow-visible">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="hidden">
          <div className="flex h-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">

              <div
                className="relative shrink-0"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown(
                      "menu",
                    )
                  }
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-[12px]
                    bg-[#30392d]
                    text-white
                    transition
                    hover:bg-[#222b20]
                  "
                >
                  {openDropdown ===
                    "menu" ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {openDropdown ===
                  "menu" && (
                    <div className="absolute left-0 top-[48px] z-[120] w-[210px] overflow-hidden rounded-[12px] border border-[#e5e2da] bg-white p-2 shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
                      <div className="border-b border-[#ecece7] px-2.5 pb-2 pt-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8a92a0]">
                          Navigation
                        </p>
                      </div>

                      {[
                        "Dashboard",
                        "Website Pages",
                        "Blog Posts",
                        "SEO Manager",
                        "Analytics",
                        "Form Submissions",
                        "Media Library",
                        "Settings",
                      ].map(
                        (item) => (
                          <button
                            key={
                              item
                            }
                            type="button"
                            onClick={() => {
                              setActiveMenuItem(
                                item,
                              );

                              setOpenDropdown(
                                null,
                              );
                            }}
                            className={`
                            mt-1
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-[8px]
                            px-3
                            py-2
                            text-left
                            text-[10px]
                            font-bold
                            transition

                            ${activeMenuItem ===
                                item
                                ? "bg-[#30392d] text-white"
                                : "text-[#33415a] hover:bg-[#f5f6f3]"
                              }
                          `}
                          >
                            {item}

                            {activeMenuItem ===
                              item && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                          </button>
                        ),
                      )}
                    </div>
                  )}
              </div>

              <div
                className="min-w-0 rounded-md border border-black bg-white px-3 py-1.5"
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <h1 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.025em]">
                  Welcome back,{" "}
                  {admin?.name || "Admin"}!{" "}

                  <span className="text-[18px]">
                    👋
                  </span>
                </h1>

                <p className="truncate text-[11px] font-semibold leading-tight text-[#4a5261]">
                  Here&apos;s an
                  overview of your
                  website today{" "}

                  <b className="font-semibold">
                    arogyabharat.org
                  </b>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main
          className="
            min-h-0
            flex-1
            overflow-visible
            pl-5
            pr-5
            pt-4
            pb-5
          "
        >
          {/* =================================================
              IMPORTANT HEIGHT CHANGE

              Top stats = 98px
              Every section row below = 260px
              Bottom row = 160px
          ================================================= */}

          <div
            className="
              grid
              h-full
              min-h-0
              w-full
              grid-rows-[98px_260px_260px_160px]
              gap-2
            "
          >
            <TopStatsPanel />
            {/* =============================
                ROW 2 — 260PX
            ============================== */}

            <div
              className="
                grid
                h-full
                min-h-0
                grid-cols-[0.92fr_1.12fr_1.06fr]
                gap-2
              "
            >
            <SeoHealthPanel />
            <SearchConsolePanel />
              {/* =================================================
                  ACTION REQUIRED
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      onClick={() => window.open("/pages", "_blank")}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      View All

                      <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  }
                >
                  Action Required
                </PanelTitle>

                <div className="px-3 pt-2">
                  {liveIssues.map(
                    ({
                      label,
                      level,
                      count,
                      icon: Icon,
                      tone,
                    }) => (
                      <div
                        key={
                          label
                        }
                        className={`
                          grid
                          grid-cols-[24px_1fr_auto_22px]
                          items-center
                          gap-2
                          border-b
                          border-[#f0f0ec]
                          py-[6px]
                          px-2
                          mb-1
                          text-[10px]
                          last:border-b-0
                          last:mb-0
                          rounded-[6px]
                          
                          ${level === "High"
                            ? "bg-red-100"
                            : level === "Medium"
                              ? "bg-orange-100"
                              : "bg-yellow-100"
                          }
                        `}
                      >
                        <div
                          className={`
                            grid
                            h-[24px]
                            w-[24px]
                            place-items-center
                            rounded-[6px]

                            ${toneClass[
                            tone
                            ]
                            }
                          `}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <span
                          className="truncate font-semibold text-slate-900"
                          style={{
                            color:
                              "#0f172a",

                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </span>

                        {/* ======================================
                            HIGH / MEDIUM / LOW BACKGROUND
                        ====================================== */}

                        <span
                          className={`
                            inline-flex
                            h-[22px]
                            min-w-[58px]
                            items-center
                            justify-center
                            rounded-[6px]
                            border
                            px-2
                            text-[9px]
                            font-semibold

                            ${level ===
                              "High"
                              ? "border-red-200 bg-red-100 text-red-700"
                              : level ===
                                "Medium"
                                ? "border-orange-200 bg-orange-100 text-orange-700"
                                : "border-yellow-200 bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {level}
                        </span>

                        <span
                          className="
                            grid
                            h-[20px]
                            min-w-[20px]
                            place-items-center
                            rounded-full
                            bg-[#f8f2ee]
                            px-1
                            font-semibold
                            text-[#695b50]
                          "
                        >
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>
            </div>

            {/* =============================
                ROW 3 — 260PX
            ============================== */}

            <div
              className="
                grid
                h-full
                min-h-0
                grid-cols-[0.92fr_1.12fr_1.06fr]
                gap-2
              "
            >
            <AnalyticsPanel />
            <CoreWebVitalsPanel />
            <SiteStatusPanel />
            </div>
            {/* =============================
                BOTTOM ROW — 160PX
            ============================== */}

            <div
              className="
                grid
                h-full
                min-h-0
                grid-cols-[1.02fr_1fr_1fr_1.12fr]
                gap-2
              "
            >
            <TopPagesPanel />
            <KeywordPerformancePanel />
            <LocationsPanel />
            <RecentSubmissionsPanel />
            </div>
          </div>
        </main>
        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28px] bg-[linear-gradient(to_top,rgba(214,230,220,0.55),rgba(250,249,246,0))]" />

          <div
            className="pointer-events-none absolute bottom-0 right-0 z-0 h-full w-[370px] bg-no-repeat"
            style={{
              backgroundImage:
                'url("/assets/footer-arogya-scene.png")',

              backgroundSize:
                "370px 64px",

              backgroundPosition:
                "right bottom",
            }}
          />

          <div className="relative z-10 flex h-full items-center px-4 pr-[390px]">
            <div className="flex w-full items-center justify-center">
              <p className="text-center text-[11px] font-semibold text-slate-600">
                &copy;{" "}
                {new Date().getFullYear()}{" "}

                <span className="font-semibold text-slate-900">
                  Namo Gange Trust
                </span>{" "}

                — Free Cremation
                Assistance. Admin
                Panel. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  return <DashboardPanelsProvider value={panelsCtx}>{content}</DashboardPanelsProvider>;
}
