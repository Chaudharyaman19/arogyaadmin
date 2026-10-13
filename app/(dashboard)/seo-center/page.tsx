"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  FileCode,
  FileSearch,
  Gauge,
  Globe2,
  Info,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  seoAuditApi,
  type SeoInsights,
  type SeoOverview,
  type SeoScoreExplanation,
  type SeoSeverity,
} from "@/lib/seoAuditApi";
import { formatDateTime } from "@/components/seo/SeoBadges";
import { TrendChart } from "@/components/charts/TrendChart";
import { MagnitudeBarChart, MagnitudeDatum } from "@/components/charts/MagnitudeBarChart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

const SEVERITY_TONE: Record<SeoSeverity, string> = {
  critical: "text-status-danger-text bg-status-danger-bg",
  warning: "text-amber-700 bg-amber-50",
  notice: "text-text-muted bg-surface-sunken",
};

const CATEGORY_LABELS: Array<{ key: keyof NonNullable<SeoOverview["scores"]>; label: string }> = [
  { key: "technical", label: "Technical" },
  { key: "onPage", label: "On-page" },
  { key: "content", label: "Content" },
  { key: "performance", label: "Performance" },
  { key: "visibility", label: "Visibility" },
];

export default function SeoCenterPage() {
  const [overview, setOverview] = useState<SeoOverview | null>(null);
  const [score, setScore] = useState<SeoScoreExplanation | null>(null);
  const [insights, setInsights] = useState<SeoInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyResults = useCallback(
    (
      ov: PromiseSettledResult<SeoOverview>,
      sc: PromiseSettledResult<SeoScoreExplanation>,
      ins: PromiseSettledResult<SeoInsights>
    ) => {
      if (ov.status === "fulfilled" && ov.value && typeof ov.value === "object" && "site" in ov.value) {
        setOverview(ov.value as SeoOverview);
        setLoadError(null);
      } else {
        setOverview(null);
        setLoadError(
          ov.status === "rejected"
            ? (ov.reason as Error)?.message || "Could not load the SEO overview."
            : "SEO overview returned an unexpected response. Please try again."
        );
      }

      if (sc.status === "fulfilled" && sc.value && typeof sc.value === "object") {
        setScore(sc.value as SeoScoreExplanation);
      } else {
        setScore(null);
      }

      if (ins.status === "fulfilled" && ins.value && typeof ins.value === "object") {
        setInsights(ins.value as SeoInsights);
      } else {
        setInsights(null);
      }

      setLoading(false);
    },
    []
  );

  const fetchSeoCenter = useCallback(() => {
    return Promise.allSettled([seoAuditApi.overview(), seoAuditApi.score(), seoAuditApi.insights()]).then(
      ([ov, sc, ins]) => {
        applyResults(ov, sc, ins);
      }
    );
  }, [applyResults]);

  useEffect(() => {
    fetchSeoCenter();
  }, [fetchSeoCenter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSeoCenter().finally(() => setRefreshing(false));
  };

  const counts = overview?.counts ?? {};
  const scores = overview?.scores ?? null;

  const stats = [
    { label: "Overall score", value: scores?.overall ?? "—", hint: "Latest site score", icon: Gauge, tone: "text-accent bg-accent-soft" },
    { label: "Critical issues", value: counts.criticalIssues ?? "—", hint: "Needs immediate action", icon: TriangleAlert, tone: "text-status-danger-text bg-status-danger-bg" },
    { label: "Warnings", value: counts.warnings ?? "—", hint: "Should be fixed", icon: AlertTriangle, tone: "text-amber-700 bg-amber-50" },
    { label: "Notices", value: counts.notices ?? "—", hint: "Low priority items", icon: Info, tone: "text-text-muted bg-surface-sunken" },
    { label: "Pages crawled", value: counts.urlsCrawled ?? "—", hint: `${counts.indexablePages ?? 0} indexable`, icon: Globe2, tone: "text-status-progress-text bg-status-progress-bg" },
    { label: "Healthy pages", value: counts.healthyPages ?? "—", hint: "No open issues", icon: ShieldCheck, tone: "text-status-success-text bg-status-success-bg" },
  ];

  const categoryData: MagnitudeDatum[] = CATEGORY_LABELS.filter(({ key }) => typeof scores?.[key] === "number").map(
    ({ key, label }) => ({ label, value: scores?.[key] ?? 0 })
  );

  const history = Array.isArray(overview?.history) ? overview.history : [];
  const historyData = history
    .filter((entry) => typeof entry?.scores?.overall === "number" && entry.capturedAt)
    .map((entry) => ({ label: shortDate(entry.capturedAt), value: entry.scores.overall as number }));

  const alerts = Array.isArray(overview?.alerts) ? overview.alerts : [];
  const topIssues = Array.isArray(overview?.topIssues) ? overview.topIssues : [];

  const insightChips = [
    { label: "Striking distance queries", value: Array.isArray(insights?.strikingDistance) ? insights.strikingDistance.length : 0 },
    { label: "Rising queries", value: Array.isArray(insights?.risingQueries) ? insights.risingQueries.length : 0 },
    { label: "Falling queries", value: Array.isArray(insights?.fallingQueries) ? insights.fallingQueries.length : 0 },
    { label: "High impressions, low CTR", value: Array.isArray(insights?.highImpressionLowCtr) ? insights.highImpressionLowCtr.length : 0 },
    { label: "Keyword cannibalization", value: Array.isArray(insights?.cannibalization) ? insights.cannibalization.length : 0 },
    { label: "Content gaps", value: Array.isArray(insights?.contentGaps) ? insights.contentGaps.length : 0 },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-[11px] font-medium">Loading SEO Center…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-surface-page">
      <div className="mx-auto flex min-h-full w-full max-w-[1800px] flex-col p-3 lg:p-4">
        {/* Header */}
        <div className="relative mb-2.5 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-surface-card px-4 py-3 shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-sm">
                  <SearchCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">SEO Intelligence</p>
                  <h1 className="text-[18px] font-bold leading-5 tracking-[-0.02em] text-text-primary">SEO Center</h1>
                </div>
              </div>
              <p className="max-w-2xl text-[11px] leading-4 text-text-secondary">
                Central SEO reports — site score, issue breakdown, crawl health and search visibility in one place.
              </p>
              {overview?.crawl?.completedAt && (
                <p className="mt-0.5 text-[9px] font-medium leading-4 text-text-muted">
                  Last completed audit · {formatDateTime(overview.crawl.completedAt)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 text-[11px] font-semibold text-text-secondary shadow-sm transition hover:border-accent/30 hover:text-accent disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <Link
                href="/seo"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 text-[11px] font-semibold text-text-secondary shadow-sm transition hover:border-accent/30 hover:text-accent"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> SEO overview
              </Link>
            </div>
          </div>
        </div>

        {/* Load error banner */}
        {loadError && (
          <div className="mb-2.5 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-700">
            <span className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {loadError}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-red-700 transition hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI grid */}
        <div className="mb-2.5 grid shrink-0 grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {stats.map(({ label, value, hint, icon: Icon, tone }) => (
            <div key={label} className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
                  <p className="mt-0.5 text-[21px] font-bold tracking-[-0.03em] text-text-primary">{value}</p>
                  <p className="truncate text-[10px] text-text-muted">{hint}</p>
                </div>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Score breakdown + history + crawl health */}
        <div className="mb-2.5 grid shrink-0 gap-2 lg:grid-cols-3">
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Score by category</h2>
            <MagnitudeBarChart data={categoryData} emptyLabel="No category scores yet — run an audit from SEO Audit." />
            {score && !score.available && score.message && (
              <p className="mt-2 text-[10px] text-text-muted">{score.message}</p>
            )}
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Overall score trend</h2>
            <TrendChart
              data={historyData}
              valueFormatter={(v) => `${v}`}
            />
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Crawl health</h2>
            {overview?.crawl ? (
              <dl className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-text-muted">Status</dt>
                  <dd className="font-semibold capitalize text-text-primary">{overview.crawl.status}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-text-muted">Trigger</dt>
                  <dd className="font-medium capitalize text-text-primary">{overview.crawl.trigger}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-text-muted">Robots.txt</dt>
                  <dd className={`font-semibold ${overview.crawl.robotsFound ? "text-status-success-text" : "text-status-danger-text"}`}>
                    {overview.crawl.robotsFound ? "Found" : "Missing"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-text-muted">Sitemap</dt>
                  <dd className={`font-semibold ${overview.crawl.sitemapFound ? "text-status-success-text" : "text-status-danger-text"}`}>
                    {overview.crawl.sitemapFound ? `Found · ${overview.crawl.sitemapUrlCount ?? 0} URLs` : "Missing"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-text-muted">Duration</dt>
                  <dd className="font-medium text-text-primary">
                    {typeof overview.crawl.durationMs === "number"
                      ? `${Math.max(1, Math.round(overview.crawl.durationMs / 1000))}s`
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-text-muted">Started</dt>
                  <dd className="font-medium text-text-primary">
                    {overview.crawl.startedAt ? formatDateTime(overview.crawl.startedAt) : "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-[11px] text-text-muted">No crawl data yet.</p>
            )}
          </div>
        </div>

        {/* Search insights */}
        <div className="mb-2.5 shrink-0 rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Search insights</h2>
            {insights && insights.available === false && (
              <span className="text-[10px] font-medium text-text-muted">{insights.message ?? "Not available"}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {insightChips.map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-surface-border bg-surface-page px-2.5 py-2">
                <p className="text-[16px] font-bold text-text-primary">{value}</p>
                <p className="text-[10px] leading-3 text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts + top issues */}
        <div className="grid shrink-0 gap-2 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Alerts</h2>
            {alerts.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-text-muted">No active alerts.</p>
            ) : (
              <ul className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
                {alerts.map((alert, index) => (
                  <li
                    key={alert.id || `${alert.title}-${index}`}
                    className="flex items-start justify-between gap-2 rounded-lg border border-surface-border bg-surface-page px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-text-primary">{alert.title}</p>
                      <p className="text-[10px] leading-3 text-text-muted">{alert.message}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_TONE[alert.severity] ?? SEVERITY_TONE.notice}`}>
                      {alert.severity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Top issues</h2>
            {topIssues.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-text-muted">No top issues recorded yet.</p>
            ) : (
              <ul className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
                {topIssues.map((issue, index) => (
                  <li
                    key={`${issue.ruleId}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-surface-border bg-surface-page px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-text-primary">{issue.title}</p>
                      <p className="text-[10px] leading-3 text-text-muted">
                        {issue.category} · {issue.affectedPages} page{issue.affectedPages === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_TONE[issue.severity] ?? SEVERITY_TONE.notice}`}>
                      {issue.severity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-2.5 grid shrink-0 gap-2 sm:grid-cols-3">
          <Link
            href="/seo"
            className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 shadow-sm transition hover:border-accent/40"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
              <Gauge className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-text-primary group-hover:text-accent">SEO Audit</span>
              <span className="block truncate text-[10px] text-text-muted">Full site health command center</span>
            </span>
          </Link>
          <Link
            href="/auditpage"
            className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 shadow-sm transition hover:border-accent/40"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
              <FileSearch className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-text-primary group-hover:text-accent">Audited Pages</span>
              <span className="block truncate text-[10px] text-text-muted">Inspect every discovered URL</span>
            </span>
          </Link>
          <Link
            href="/advanced-seo"
            className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 shadow-sm transition hover:border-accent/40"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
              <FileCode className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-text-primary group-hover:text-accent">Advanced SEO</span>
              <span className="block truncate text-[10px] text-text-muted">Global scripts & crawler settings</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
