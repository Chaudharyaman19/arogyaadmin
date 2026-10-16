"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, FileText, ImageIcon, Loader2, Save, Upload } from "lucide-react";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api";
import { brandingApi, type Branding } from "@/lib/brandingApi";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://arogya.namogange.org").replace(/\/$/, "");

type Draft = Omit<Branding, "updatedAt">;

/**
 * Settings → Website Logo & Brochure: the website navbar logo (+ alt text) and the PDF behind
 * every "Download PDF" button. Files are uploaded to Cloudinary; "Save" puts them live.
 */
export default function WebsiteBrandingCard() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "brochure" | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const [logoLinkCopied, setLogoLinkCopied] = useState(false);
  const pdfInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    brandingApi
      .get()
      .then(({ updatedAt: _updatedAt, ...data }) => {
        setDraft(data);
        setSaved(data);
      })
      .catch((err) => setLoadError(err instanceof ApiRequestError ? err.message : "Could not load the logo & brochure."));
  }, []);

  const handleUpload = async (kind: "logo" | "brochure", file?: File) => {
    if (!file || !draft) return;
    setMessage(null);
    if (kind === "logo" && !/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      setMessage({ type: "error", text: "Logo must be a PNG, JPG, WEBP or SVG image." });
      return;
    }
    if (kind === "brochure" && file.type !== "application/pdf") {
      setMessage({ type: "error", text: "Brochure must be a PDF file." });
      return;
    }
    setUploading(kind);
    try {
      if (kind === "logo") {
        const { url } = await brandingApi.uploadLogo(file);
        setDraft({ ...draft, logo: url });
      } else {
        const { url, fileName } = await brandingApi.uploadBrochure(file);
        setDraft({ ...draft, brochureUrl: url, brochureFileName: fileName || file.name });
      }
      setMessage({ type: "success", text: `${kind === "logo" ? "Logo" : "PDF"} uploaded to Cloudinary — click Save to put it on the website.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Upload failed. Please try again." });
    } finally {
      setUploading(null);
      if (logoInput.current) logoInput.current.value = "";
      if (pdfInput.current) pdfInput.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.logoAlt.trim()) {
      setMessage({ type: "error", text: "Logo alt text is required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const { updatedAt: _updatedAt, ...data } = await brandingApi.save(draft);
      setDraft(data);
      setSaved(data);
      setMessage({ type: "success", text: "Logo & brochure saved — the website shows them now." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const unsaved = !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);
  const pdfIsUploaded = /^https:\/\//.test(draft?.brochureUrl ?? "");

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">Website Logo &amp; Brochure</h2>
          <p className="text-[11px] text-[#4B1426]">
            The logo in the website navbar and the PDF behind every &quot;Download PDF&quot; button. Files are stored on
            Cloudinary; nothing changes on the website until you click Save.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft || saving || !!uploading || !unsaved}
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[5px] bg-[#166b40] px-3 text-[11px] font-semibold text-white transition hover:bg-[#11532f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {unsaved ? "Save Logo & PDF" : "Saved"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-3 rounded border p-2 text-[11px] font-medium ${
            message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {loadError ? (
        <p className="text-[11px] font-semibold text-red-600">{loadError}</p>
      ) : !draft ? (
        <p className="text-[11px] text-[#6c7587]">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* LOGO */}
          <div className="rounded-[6px] border border-[#e5e7eb] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#18233b]">
              <ImageIcon className="h-3.5 w-3.5" /> Website Logo
            </p>
            <div className="mb-2 flex h-[86px] items-center justify-center rounded-[5px] border border-dashed border-[#d6d9de] bg-[#fafafa] p-2">
              {draft.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.logo} alt={draft.logoAlt || "Website logo"} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[10px] text-[#9aa0aa]">No logo yet</span>
              )}
            </div>
            {/* The logo's own Cloudinary address, for the SEO team (schema, listings, social profiles) */}
            {/^https?:\/\//.test(draft.logo || "") && (
              <div className="mb-2">
                <p className="mb-1 text-[10px] font-semibold text-[#18233b]">Logo Link (Cloudinary)</p>
                <div className="flex items-center gap-1.5">
                  <input
                    readOnly
                    value={draft.logo}
                    onFocus={(e) => e.currentTarget.select()}
                    aria-label="Logo Cloudinary link"
                    className="h-[28px] min-w-0 flex-1 rounded-[5px] border border-[#d6d9de] bg-[#fafafa] px-2 font-mono text-[9.5px] text-[#334155] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard
                        ?.writeText(draft.logo)
                        .then(() => {
                          setLogoLinkCopied(true);
                          setTimeout(() => setLogoLinkCopied(false), 2000);
                        })
                        .catch(() => {})
                    }
                    className="inline-flex h-[28px] shrink-0 items-center gap-1 rounded-[5px] border border-[#d6d9de] bg-white px-2 text-[10px] font-semibold text-[#334155] transition hover:bg-slate-50"
                  >
                    {logoLinkCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {logoLinkCopied ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={draft.logo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-[28px] shrink-0 items-center gap-1 rounded-[5px] border border-[#d6d9de] bg-white px-2 text-[10px] font-semibold text-[#0369a1] transition hover:bg-slate-50"
                  >
                    Open <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                {unsaved && <p className="mt-1 text-[9.5px] text-amber-700">Click Save to show this logo on the website.</p>}
              </div>
            )}
            <input
              ref={logoInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => handleUpload("logo", e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => logoInput.current?.click()}
              disabled={!!uploading}
              className="mb-2 inline-flex h-[28px] items-center gap-1.5 rounded-[5px] border border-[#d6d9de] bg-white px-3 text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-50 disabled:opacity-50"
            >
              {uploading === "logo" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading === "logo" ? "Uploading…" : "Upload New Logo"}
            </button>
            <p className="mb-2 text-[9.5px] text-[#6c7587]">PNG, JPG, WEBP or SVG, up to 5 MB. A wide logo with a transparent background looks best.</p>
            <Input
              label="Logo Alt Text"
              value={draft.logoAlt}
              maxLength={150}
              onChange={(e) => setDraft({ ...draft, logoAlt: e.target.value })}
              hint="Read out by screen readers and used by Google Images."
            />
          </div>

          {/* BROCHURE PDF */}
          <div className="rounded-[6px] border border-[#e5e7eb] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#18233b]">
              <FileText className="h-3.5 w-3.5" /> Brochure PDF (&quot;Download PDF&quot;)
            </p>
            <div className="mb-2 flex h-[86px] items-center gap-3 rounded-[5px] border border-dashed border-[#d6d9de] bg-[#fafafa] p-3">
              <div className="grid h-[48px] w-[40px] shrink-0 place-items-center rounded-[4px] bg-red-600 text-[10px] font-bold text-white">PDF</div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-[#18233b]">
                  {draft.brochureFileName || (pdfIsUploaded ? "Uploaded brochure" : "Brochure bundled with the website")}
                </p>
                <p className="truncate text-[9.5px] text-[#6c7587]" title={draft.brochureUrl}>
                  {pdfIsUploaded ? "Stored on Cloudinary" : draft.brochureUrl || "No PDF yet"}
                </p>
                <a
                  href={`${SITE_URL}/brochure`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#0369a1] hover:underline"
                >
                  Open the live PDF <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
            <input
              ref={pdfInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleUpload("brochure", e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => pdfInput.current?.click()}
              disabled={!!uploading}
              className="mb-2 inline-flex h-[28px] items-center gap-1.5 rounded-[5px] border border-[#d6d9de] bg-white px-3 text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-50 disabled:opacity-50"
            >
              {uploading === "brochure" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading === "brochure" ? "Uploading…" : "Upload New PDF"}
            </button>
            <p className="text-[9.5px] text-[#6c7587]">
              PDF only, up to 10 MB. Visitors download it from the navbar and footer &quot;Download PDF&quot; buttons
              (website address: /brochure). The footer editor in Pages &amp; CMS uses the same PDF.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
