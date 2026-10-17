"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import typography from "../pages/PagesTypography.module.css";
import RichTextEditor from "@/components/RichTextEditor";
import { ApiRequestError } from "@/lib/api";
import { legalPagesApi, type LegalPage, type LegalSlug } from "@/lib/legalPagesApi";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://arogya.namogange.org").replace(/\/$/, "");

type Draft = Pick<LegalPage, "title" | "effectiveDate" | "content">;

/* =========================================================
   LEGAL PAGES — Privacy Policy, Terms & Conditions, Refund Policy
========================================================= */

export default function LegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [active, setActive] = useState<LegalSlug>("privacy");
  const [drafts, setDrafts] = useState<Partial<Record<LegalSlug, Draft>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    legalPagesApi
      .list()
      .then((list) => {
        setPages(list);
        setDrafts(Object.fromEntries(list.map((p) => [p.slug, { title: p.title, effectiveDate: p.effectiveDate, content: p.content }])));
      })
      .catch((err) => setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not load the legal pages." }))
      .finally(() => setLoading(false));
  }, []);

  const page = pages.find((p) => p.slug === active);
  const draft = drafts[active];
  const unsaved = !!page && !!draft && (draft.title !== page.title || draft.effectiveDate !== page.effectiveDate || draft.content !== page.content);

  const update = (patch: Partial<Draft>) => {
    if (!draft) return;
    setDrafts((prev) => ({ ...prev, [active]: { ...draft, ...patch } }));
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    try {
      const saved = await legalPagesApi.save(active, draft);
      setPages((prev) => prev.map((p) => (p.slug === active ? saved : p)));
      setDrafts((prev) => ({ ...prev, [active]: { title: saved.title, effectiveDate: saved.effectiveDate, content: saved.content } }));
      setMessage({ type: "success", text: `${saved.title} saved — the website shows it within a minute.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not save this page." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        <div className="mb-[14px] flex flex-wrap items-end justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]">Legal Pages</h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Privacy Policy, Terms &amp; Conditions and Refund Policy — linked in the website footer and the registration forms.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!unsaved || saving}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-[5px] bg-[#166b40] px-3 text-[11px] font-semibold text-white transition hover:bg-[#11532f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {unsaved ? "Save Page" : "Saved"}
          </button>
        </div>

        {message && (
          <div
            className={`mb-[12px] rounded border p-2 text-[11px] font-medium ${
              message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-[12px] flex flex-wrap gap-[20px] border-b border-[#e8e5df]">
          {pages.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActive(p.slug)}
              className={`relative pb-[9px] text-[10.5px] font-bold transition-colors ${active === p.slug ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"}`}
            >
              {p.title}
              {p.isDraft && <span className="ml-1.5 rounded-[3px] bg-amber-100 px-1 text-[7.5px] font-bold text-amber-800">DRAFT</span>}
              {active === p.slug && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-[11px] text-[#6c7587]">Loading…</p>
        ) : page && draft ? (
          <div className="space-y-3">
            {page.isDraft && (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-[10.5px] font-medium text-amber-900">
                The website is showing a standard draft of this page. Please have the client (or their legal adviser) check it, edit it
                below if needed and click Save.
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#18233b]">Page Title</span>
                <input
                  value={draft.title}
                  maxLength={120}
                  onChange={(e) => update({ title: e.target.value })}
                  className="h-[32px] w-full rounded-[5px] border border-[#e5e6e2] px-[9px] text-[11px] font-medium outline-none focus:border-[#8fa98e]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#18233b]">Effective Date</span>
                <input
                  value={draft.effectiveDate}
                  maxLength={60}
                  placeholder="e.g. 17 October 2026"
                  onChange={(e) => update({ effectiveDate: e.target.value })}
                  className="h-[32px] w-full rounded-[5px] border border-[#e5e6e2] px-[9px] text-[11px] font-medium outline-none focus:border-[#8fa98e]"
                />
              </label>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#18233b]">Page Content</span>
                <a
                  href={`${SITE_URL}/${active}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0369a1] hover:underline"
                >
                  View on website <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <RichTextEditor
                key={active}
                value={draft.content}
                onChange={(content) => update({ content })}
                placeholder="Write the page content…"
                minHeight="420px"
              />
            </div>
            {page.updatedAt && (
              <p className="text-[9.5px] text-[#6c7587]">
                Last saved {new Date(page.updatedAt).toLocaleString("en-GB")} {page.updatedBy ? `by ${page.updatedBy}` : ""}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
