"use client";

/* =========================================================
   DASHBOARD PANEL PRIMITIVES + SHARED TYPES
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  Children,
  isValidElement,
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  FileSearch,
  FileText,
  Search,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type {
  DropdownKey,
  IssueTone,
  IssueLevel,
};

export {
  AnimatedCounter,
  defaultTopStats,
  toneClass,
  Panel,
  PanelTitle,
};

export type { DashboardIssue };

type DropdownKey =
  | "menu"
  | "website"
  | "date"
  | "notifications"
  | "profile"
  | "search-console-range"
  | "analytics-range"
  | "web-vitals-range"
  | "top-pages-range"
  | "keyword-range"
  | "location-range"
  | null;

/* =========================================================
   ANIMATED COUNTER
========================================================= */

function AnimatedCounter({
  value,
  duration = 1200,
}: {
  value: string | number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState<
    string | number
  >("");

  useEffect(() => {
    const strVal = String(value);

    const numericMatch = strVal.match(
      /^([^\d.]*)([\d,.]+)(.*)$/,
    );

    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const prefix = numericMatch[1];

    const rawNumberStr =
      numericMatch[2].replace(/,/g, "");

    const targetNum =
      parseFloat(rawNumberStr);

    const suffix = numericMatch[3];

    if (
      isNaN(targetNum) ||
      targetNum === 0
    ) {
      setDisplayValue(value);
      return;
    }

    const hasComma =
      numericMatch[2].includes(",");

    const decimalPlaces =
      (
        rawNumberStr.split(".")[1] ||
        ""
      ).length;

    let startTime: number | null =
      null;

    let animationFrameId: number;

    const step = (
      timestamp: number,
    ) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) /
        duration,
        1,
      );

      const easeProgress =
        1 -
        Math.pow(
          1 - progress,
          3,
        );

      const currentNum =
        targetNum *
        easeProgress;

      let formattedNum =
        currentNum.toFixed(
          decimalPlaces,
        );

      if (hasComma) {
        const parts =
          formattedNum.split(".");

        parts[0] = parseInt(
          parts[0],
          10,
        ).toLocaleString();

        formattedNum =
          parts.join(".");
      }

      setDisplayValue(
        `${prefix}${formattedNum}${suffix}`,
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(
            step,
          );
      }
    };

    animationFrameId =
      requestAnimationFrame(
        step,
      );

    return () =>
      cancelAnimationFrame(
        animationFrameId,
      );
  }, [value, duration]);

  return (
    <>
      {displayValue || value}
    </>
  );
}

/* =========================================================
   TYPES
========================================================= */

type IssueTone =
  | "rose"
  | "amber"
  | "violet";

type IssueLevel =
  | "High"
  | "Medium"
  | "Low";

interface DashboardIssue {
  label: string;
  level: IssueLevel;
  count: number;
  icon: LucideIcon;
  tone: IssueTone;
}

/* =========================================================
   TOP STATS
========================================================= */

const defaultTopStats = [
  {
    title: "SEO HEALTH SCORE",
    value: "—",
    suffix: "/100",
    note: "Loading",
    icon: TrendingUp,
    tone: "peach",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffedd5 100%)",
    borderColor: "#fed7aa",
    numColor: "#c2410c",
    footer:
      "View full SEO report",
    href: "/pages",
  },

  {
    title: "TOTAL PAGES",
    value: "—",
    note: "Loading",
    icon: FileText,
    tone: "coral",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fee2e2 100%)",
    borderColor: "#fecaca",
    numColor: "#dc2626",
    footer:
      "View all pages",
    href: "/pages",
  },

  {
    title: "TOTAL POSTS",
    value: "—",
    note: "Loading",
    icon: FileSearch,
    tone: "apricot",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fef3c7 100%)",
    borderColor: "#fde68a",
    numColor: "#b45309",
    footer:
      "View all posts",
    href: "/blogs",
  },

  {
    title: "INDEXED PAGES",
    value: "—",
    suffix: "",
    note: "Not Connected",
    icon: Search,
    tone: "rose",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffe4e6 100%)",
    borderColor: "#fecdd3",
    numColor: "#be123c",
    footer:
      "View details",
    href: "/seo",
  },

  {
    title:
      "EXPO ENQUIRIES (MTD)",
    value: "—",
    note: "Loading",
    icon: Users,
    tone: "gold",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fef9c3 100%)",
    borderColor: "#fef08a",
    numColor: "#a16207",
    footer:
      "View all submissions",
    href: "/submissions",
  },

  {
    title:
      "CONVERSION RATE",
    value: "—",
    note: "Loading",
    icon: Target,
    tone: "salmon",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffe4d6 100%)",
    borderColor: "#fdc9b0",
    numColor: "#ea580c",
    footer:
      "View analytics",
    href: "/analytics",
  },
];

const toneClass = {
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-100",

  violet:
    "bg-violet-50 text-violet-700 ring-violet-100",

  amber:
    "bg-amber-50 text-amber-700 ring-amber-100",

  blue:
    "bg-blue-50 text-blue-700 ring-blue-100",

  rose:
    "bg-rose-50 text-rose-700 ring-rose-100",

  // Warm "sunset" tones used by the dashboard KPI cards
  peach:
    "bg-orange-50 text-orange-700 ring-orange-100",

  coral:
    "bg-red-50 text-red-600 ring-red-100",

  apricot:
    "bg-amber-50 text-amber-700 ring-amber-100",

  gold:
    "bg-yellow-50 text-yellow-700 ring-yellow-100",

  salmon:
    "bg-orange-50 text-orange-600 ring-orange-100",
} as const;

/* =========================================================
   PANEL
========================================================= */

function Panel({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const items =
    Children.toArray(
      children,
    );

  const firstItem =
    items[0];

  const isHeader =
    isValidElement(
      firstItem,
    ) &&
    firstItem.type ===
    PanelTitle;

  const lastItem =
    items.at(-1);

  const hasFooter =
    isValidElement(
      lastItem,
    ) &&
    lastItem.type ===
    FooterButton;

  const bodyItems =
    isHeader
      ? hasFooter
        ? items.slice(
          1,
          -1,
        )
        : items.slice(1)
      : hasFooter
        ? items.slice(
          0,
          -1,
        )
        : items;

  return (
    <section
      className={`
        relative
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        rounded-[11px]
        border
        border-[#e5e7e6]
        bg-white
        ${className}
      `}
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",

        ...style,
      }}
    >
      {isHeader &&
        firstItem}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          justify-between
          overflow-auto
          pb-0
        "
      >
        {bodyItems}
      </div>

      {hasFooter &&
        lastItem}
    </section>
  );
}

/* =========================================================
   PANEL TITLE
========================================================= */

function PanelTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="
        sticky
        top-0
        z-20
        flex
        h-[32px]
        shrink-0
        items-center
        justify-between
        border-b
        border-slate-200/80
        bg-[#f0f3f6]
        px-2.5
        backdrop-blur-sm
      "
    >
      <h2
        className="
          text-[10.5px]
          font-semibold
          tracking-[-0.01em]
          text-black
        "
        style={{
          color: "#000000",
          fontWeight: 600,
        }}
      >
        {children}
      </h2>

      {right}
    </div>
  );
}

/* =========================================================
   FOOTER BUTTON
========================================================= */

function FooterButton({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      className={`
        mx-2.5
        mb-1.5
        mt-0.5
        flex
        h-[26px]
        shrink-0
        items-center
        justify-center
        gap-1.5
        rounded-md
        text-[8.5px]
        font-bold
        transition

        ${dark
          ? "bg-[#071d3c] text-white hover:bg-[#0b2a55]"
          : "border border-[#eee8dc] bg-[#fffdf8] text-[#27344c] hover:bg-[#fff9ed]"
        }
      `}
    >
      {children}

      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
