"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperNeedHelpApi, PaperNeedHelp } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   NEED HELP? — the contact strip at the bottom of the website
   Paper Presentation page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9][0-9\s()-]{6,19}$/;

const EMPTY: PaperNeedHelp = {
  heading: "NEED HELP?",
  description: "",
  sameAsTopbar: true,
  email: "",
  phone: "",
  icon: "",
  iconAlt: "Need help document with magnifier icon",
  leafImage: "",
  leafImageAlt: "Green leaf branch decoration",
};

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
      <div className="border-b border-gray-100 pb-1.5">
        <div className="text-[11px] font-bold text-[#1e40af]">{title}</div>
        {note && <p className="mt-[2px] text-[10px] text-[#64748b]">{note}</p>}
      </div>
      {children}
    </div>
  );
}

export function PaperNeedHelpEditor() {
  const [data, setData] = useState<PaperNeedHelp>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperNeedHelpApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Need Help?."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PaperNeedHelp>(key: K, value: PaperNeedHelp[K]) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (!data.sameAsTopbar && (!data.email.trim() || !data.phone.trim())) {
      return setError('Enter the email and phone number, or turn on "Same as top bar".');
    }
    if (data.email.trim() && !EMAIL.test(data.email.trim())) return setError("Enter a valid email address.");
    if (data.phone.trim() && !PHONE.test(data.phone.trim())) return setError("Enter a valid phone number (digits, spaces, +, - only).");
    if (data.icon && !data.iconAlt.trim()) return setError("Enter the alt text of the icon.");
    if (data.leafImage && !data.leafImageAlt.trim()) return setError("Enter the alt text of the leaf image.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperNeedHelpApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Need Help? saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Need Help?.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-[11px] text-[#64748b]">
        <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
        Loading Need Help?...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!isSaved && (
        <span className="w-fit rounded-[3px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
          NOT SAVED YET
        </span>
      )}

      <Panel title="Text">
        <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={20} />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <TextInput value={data.description} onChange={(v) => set("description", v)} maxLength={120} />
          </div>
        </div>
      </Panel>

      <Panel title="Contact" note="Turn on “Same as top bar” to show the website top bar's first email and phone (Top Bar Contact). Turn it off to show the ones below.">
        <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] bg-gray-50 px-[12px] py-[9px]">
          <div>
            <p className="text-[11px] font-semibold text-[#3a4557]">Same as top bar</p>
            <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
              {data.sameAsTopbar ? "The website shows the top bar email and phone." : "The website shows the email and phone below."}
            </p>
          </div>
          <Toggle checked={data.sameAsTopbar} onChange={(v) => set("sameAsTopbar", v)} />
        </div>
        <div className={`grid grid-cols-2 gap-[10px] ${data.sameAsTopbar ? "opacity-60" : ""}`}>
          <div>
            <FieldLabel required={!data.sameAsTopbar}>Contact Email</FieldLabel>
            <TextInput value={data.email} onChange={(v) => set("email", v.trim().toLowerCase())} placeholder="papers@example.com" maxLength={120} />
          </div>
          <div>
            <FieldLabel required={!data.sameAsTopbar}>Phone Number</FieldLabel>
            <TextInput value={data.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" maxLength={20} />
          </div>
        </div>
      </Panel>

      <Panel title="Images" note="Leave an image empty to hide it.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={paperNeedHelpApi.upload}
            label="Icon (left)"
            value={data.icon}
            onChange={(v) => set("icon", v)}
            hint="Small icon, transparent"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.icon)}>Icon Alt Text</FieldLabel>
            <TextInput value={data.iconAlt} onChange={(v) => set("iconAlt", v)} maxLength={150} />
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={paperNeedHelpApi.upload}
            label="Leaf Decoration (right)"
            value={data.leafImage}
            onChange={(v) => set("leafImage", v)}
            hint="Transparent PNG"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.leafImage)}>Leaf Alt Text</FieldLabel>
            <TextInput value={data.leafImageAlt} onChange={(v) => set("leafImageAlt", v)} maxLength={150} />
          </div>
        </div>
      </Panel>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedAt && data.updatedBy !== "seed" && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(data.updatedAt).toLocaleString("en-IN")}
            {data.updatedBy ? ` by ${data.updatedBy}` : ""}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Need Help?
        </button>
      </div>
    </div>
  );
}
