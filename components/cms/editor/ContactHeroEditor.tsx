"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { contactHeroApi, ContactCardIcon, ContactHero, ContactInfoCard } from "@/lib/contactHeroApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   CONTACT HERO — the banner at the top of the website Contact
   page and the quick info cards under it. Loads from and saves
   straight to backend-arogya (the image goes to Cloudinary), so
   it has its own Save button — page sections are only stored locally.
========================================================= */

const EMPTY: ContactHero = {
  eyebrow: "",
  title: "",
  titleHighlight: "",
  subtitle: "",
  bgImage: "",
  bgImageAlt: "",
  cards: [],
};

const MAX_CARDS = 4;
const ICONS: { value: ContactCardIcon; label: string }[] = [
  { value: "MapPin", label: "Location pin" },
  { value: "Mail", label: "Envelope (email)" },
  { value: "Phone", label: "Phone" },
  { value: "Clock", label: "Clock (hours)" },
];

function Panel({ title, note, action, children }: { title: string; note?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
        <div>
          <div className="text-[11px] font-bold text-[#1e40af]">{title}</div>
          {note && <p className="mt-[2px] text-[10px] text-[#64748b]">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ContactHeroEditor() {
  const [data, setData] = useState<ContactHero>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    contactHeroApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the hero."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: Exclude<keyof ContactHero, "cards">, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const setCard = (index: number, key: keyof ContactInfoCard, value: string) =>
    setData((prev) => ({ ...prev, cards: prev.cards.map((c, i) => (i === index ? { ...c, [key]: value } : c)) }));

  const moveCard = (index: number, by: -1 | 1) =>
    setData((prev) => {
      const cards = [...prev.cards];
      const target = index + by;
      if (target < 0 || target >= cards.length) return prev;
      [cards[index], cards[target]] = [cards[target], cards[index]];
      return { ...prev, cards };
    });

  const save = async () => {
    if (!data.title.trim()) return setError("Enter the title.");
    if (data.bgImage.trim() && !data.bgImageAlt.trim()) return setError("Enter the background image alt text.");
    if (data.cards.length === 0) return setError("Add at least one info card.");
    for (const [i, card] of data.cards.entries()) {
      if (!card.title.trim()) return setError(`Card ${i + 1}: enter the title.`);
      if (!card.text.trim()) return setError(`Card ${i + 1}: enter the text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await contactHeroApi.save(input);
      setData({ ...EMPTY, ...saved });
      showSuccess("Contact Hero saved. Refresh the website Contact page to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the hero.";
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
        Loading Contact Hero...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading & Text" note="Press Enter in the title or subtitle to start a new line on the website.">
        <div>
          <FieldLabel>Eyebrow</FieldLabel>
          <TextInput value={data.eyebrow} onChange={(v) => set("eyebrow", v.toUpperCase())} maxLength={30} />
        </div>
        <div className="grid grid-cols-[1fr_180px] gap-[10px]">
          <div>
            <FieldLabel required>Title (H1)</FieldLabel>
            <Textarea value={data.title} onChange={(v) => set("title", v)} rows={2} maxLength={40} />
            <p className="mt-[2px] text-[10px] text-[#64748b]">The Contact page&apos;s only H1 on the website.</p>
          </div>
          <div>
            <FieldLabel>Highlighted Word</FieldLabel>
            <TextInput value={data.titleHighlight} onChange={(v) => set("titleHighlight", v)} placeholder="e.g. Connect" maxLength={20} />
            <p className="mt-[2px] text-[10px] text-[#64748b]">Shown in orange. Must match a word in the title.</p>
          </div>
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <Textarea value={data.subtitle} onChange={(v) => set("subtitle", v)} rows={2} maxLength={150} />
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner — keep the left side plain so the text stays readable. Leave empty to use the website's built-in banner.">
        <CloudImageField
          upload={contactHeroApi.upload}
          label="Background Image"
          value={data.bgImage}
          onChange={(v) => set("bgImage", v)}
          hint="About 1900 × 420 px, up to 5 MB"
          previewClass="h-[70px] w-[200px]"
        />
        <div>
          <FieldLabel required={Boolean(data.bgImage)}>Background Image Alt Text</FieldLabel>
          <TextInput
            value={data.bgImageAlt}
            onChange={(v) => set("bgImageAlt", v)}
            placeholder="Describe what the background shows (for SEO & screen readers)"
            maxLength={150}
          />
        </div>
      </Panel>

      <Panel
        title="Quick Info Cards"
        note="The row of cards under the banner, left to right in this order. Press Enter in the text for a new line."
        action={
          <button
            type="button"
            onClick={() => setData((prev) => ({ ...prev, cards: [...prev.cards, { title: "", text: "", icon: "MapPin" }] }))}
            disabled={data.cards.length >= MAX_CARDS}
            className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-[10px] text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Add Card ({data.cards.length}/{MAX_CARDS})
          </button>
        }
      >
        {data.cards.map((card, index) => (
          <div key={index} className="flex flex-col gap-[8px] rounded-[5px] border border-[#eef0f3] bg-[#fbfcfd] p-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#334155]">Card {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move up"
                  onClick={() => moveCard(index, -1)}
                  disabled={index === 0}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Move down"
                  onClick={() => moveCard(index, 1)}
                  disabled={index === data.cards.length - 1}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Remove card"
                  onClick={() => setData((prev) => ({ ...prev, cards: prev.cards.filter((_, i) => i !== index) }))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <FieldLabel required>Title</FieldLabel>
                <TextInput value={card.title} onChange={(v) => setCard(index, "title", v)} maxLength={30} />
              </div>
              <div>
                <FieldLabel>Icon</FieldLabel>
                <select
                  value={card.icon}
                  onChange={(e) => setCard(index, "icon", e.target.value)}
                  className="h-[34px] w-full cursor-pointer rounded-[4px] border border-[#cbd5e1] bg-white px-[10px] text-[11.5px] font-medium text-[#142347] outline-none focus:border-[#16a34a]"
                >
                  {ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <FieldLabel required>Text</FieldLabel>
              <Textarea value={card.text} onChange={(v) => setCard(index, "text", v)} rows={2} maxLength={120} />
            </div>
          </div>
        ))}
      </Panel>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedAt && data.updatedBy && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(data.updatedAt).toLocaleString("en-IN")} by {data.updatedBy}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Contact Hero
        </button>
      </div>
    </div>
  );
}
