"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, Loader2, Pencil, Plus, Save, Trash2, Type } from "lucide-react";
import typography from "@/app/(dashboard)/pages/PagesTypography.module.css";
import { Input } from "@/components/ui/Input";
import { showError, showSuccess, lazySwal } from "@/lib/toast";
import { ApiRequestError } from "@/lib/api";

/* Shared building blocks for the Speakers Section pages — colours follow Roles & Permissions. */

export const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);

export const initials = (name: string) =>
  name
    .replace(/^(dr|prof|mr|mrs|ms|shri|smt|vaidya)\.?\s+/i, "")
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const confirmDelete = (title: string, text: string) =>
  lazySwal.fire({
    title, text, icon: "warning", showCancelButton: true,
    confirmButtonColor: "#dc2626", cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, Delete", cancelButtonText: "Cancel",
    background: "#1e2433", color: "#e2e8f0",
  });

/** Page frame: title, subtitle, "View on Website" and an optional primary action */
export function SpeakerPageShell({ title, description, websitePath, action, children }: {
  title: string; description: string; websitePath: string; action?: { label: string; onClick: () => void }; children: ReactNode;
}) {
  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]" style={{ color: "#4B1426" }}>
              {title}
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">{description}</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <a href={`${WEBSITE_URL}${websitePath}`} target="_blank" rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] shadow-sm transition hover:bg-[#ffedd5]">
              <ExternalLink className="h-[12px] w-[12px]" strokeWidth={1.7} /> View on Website
            </a>
            {action && (
              <button type="button" onClick={action.onClick}
                className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]">
                <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} /> {action.label}
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/** A section heading saved on its own ("Save Heading") */
export function HeadingCard({ load, save, label = "Heading", hint, maxLength = 60, uppercase = true }: {
  load: () => Promise<{ heading: string }>;
  save: (heading: string) => Promise<{ heading: string }>;
  label?: string; hint?: string; maxLength?: number; uppercase?: boolean;
}) {
  const [heading, setHeading] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load()
      .then((res) => setHeading(res.heading))
      .catch((err) => setError(errorText(err, "Could not load the heading.")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!heading.trim()) return setError(`Enter the ${label.toLowerCase()}.`);
    setSaving(true);
    setError("");
    try {
      const res = await save(heading.trim());
      setHeading(res.heading);
      showSuccess("Heading saved. Refresh the website to see it.");
    } catch (err) {
      const msg = errorText(err, "Could not save the heading.");
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[7px] border border-[#e8e5df] bg-white p-[14px]">
      <h2 className="mb-[10px] flex items-center gap-[6px] border-b border-[#f0f0ec] pb-[8px] text-[11px] font-bold uppercase tracking-wide text-[#4B1426]">
        <Type className="h-[13px] w-[13px]" /> Section Heading
      </h2>
      {loading ? (
        <span className="inline-flex items-center gap-2 text-[10px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</span>
      ) : (
        <div className="space-y-2">
          <Input label={label} required maxLength={maxLength} value={heading}
            onChange={(e) => setHeading(uppercase ? e.target.value.toUpperCase() : e.target.value)} hint={hint} />
          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          <button type="button" onClick={submit} disabled={saving}
            className="inline-flex h-[32px] w-full items-center justify-center gap-1.5 rounded-[4px] bg-[#1b5e20] px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Heading
          </button>
        </div>
      )}
    </div>
  );
}

export function InfoNote({ title = "On the website", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-[7px] border border-[#e8e5df] bg-[#fafafa] p-[12px] text-[9px] leading-relaxed text-[#64748b]">
      <p className="mb-1 font-bold uppercase tracking-wide text-[#4B1426]">{title}</p>
      {children}
    </div>
  );
}

export const Cell = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <td className={`px-[12px] py-[8px] text-[9px] text-[#334155] ${className}`}>{children}</td>
);

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" title="Edit" onClick={onEdit}
        className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 transition hover:scale-105 hover:bg-blue-500/20">
        <Pencil className="h-[12px] w-[12px]" />
      </button>
      <button type="button" title="Delete" onClick={onDelete}
        className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 transition hover:scale-105 hover:bg-red-500/20">
        <Trash2 className="h-[12px] w-[12px]" />
      </button>
    </div>
  );
}

export function ModalFooter({ onCancel, onSave, saving, label }: { onCancel: () => void; onSave: () => void; saving: boolean; label: string }) {
  return (
    <>
      <button type="button" onClick={onCancel}
        className="inline-flex h-[32px] items-center px-[14px] text-[12px] font-semibold text-red-600 hover:bg-red-100"
        style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(220,38,38,0.15) 0px 0px 0px 1px" }}>
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={saving}
        className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
        style={{ background: "#1b5e20", borderRadius: "4px" }}>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {label}
      </button>
    </>
  );
}

/** Round photo, or the person's initials when there is none */
export function PersonAvatar({ name, image, alt }: { name: string; image: string; alt?: string }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={alt || name} className="h-[38px] w-[38px] shrink-0 rounded-full border border-[#e2e8f0] object-cover" />
  ) : (
    <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border border-[#e2e8f0] bg-[#f0f4f8] text-[10px] font-bold text-[#4B1426]" title="No photo">
      {initials(name) || "?"}
    </div>
  );
}
