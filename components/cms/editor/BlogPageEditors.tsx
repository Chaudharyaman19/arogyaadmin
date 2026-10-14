"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import {
  blogCategoriesApi,
  blogHeroApi,
  blogStatsApi,
  BlogCategoryLink,
  BlogHero,
  BlogList,
  BlogStat,
} from "@/lib/blogPageApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   BLOGS PAGE — hero banner, category navigation and stats band
   of the website Blogs page. Each loads from and saves straight
   to backend-arogya (images go to Cloudinary), so each has its
   own Save button — page sections are only stored locally.
========================================================= */

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

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-4 text-[11px] text-[#64748b]">
      <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
      Loading {label}...
    </div>
  );
}

function SaveBar({ label, saving, onSave, updatedAt, updatedBy }: { label: string; saving: boolean; onSave: () => void; updatedAt?: string; updatedBy?: string }) {
  return (
    <div className="flex items-center justify-end gap-[10px]">
      {updatedAt && updatedBy && (
        <span className="text-[10px] text-[#64748b]">
          Last saved {new Date(updatedAt).toLocaleString("en-IN")} by {updatedBy}
        </span>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {label}
      </button>
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

const EMPTY_HERO: BlogHero = {
  title: "",
  description: "",
  descriptionHighlight: "",
  searchPlaceholder: "",
  bgImage: "",
  bgImageAlt: "",
};

export function BlogHeroEditor() {
  const [data, setData] = useState<BlogHero>(EMPTY_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    blogHeroApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY_HERO, ...res });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the hero."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof BlogHero, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.title.trim()) return setError("Enter the title.");
    if (data.bgImage.trim() && !data.bgImageAlt.trim()) return setError("Enter the background image alt text.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await blogHeroApi.save(input);
      setData({ ...EMPTY_HERO, ...saved });
      showSuccess("Blog Hero saved. Refresh the website Blogs page to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the hero.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Blog Hero" />;

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading & Text">
        <div>
          <FieldLabel required>Title (H1)</FieldLabel>
          <TextInput value={data.title} onChange={(v) => set("title", v)} maxLength={24} />
          <p className="mt-[2px] text-[10px] text-[#64748b]">The Blogs page&apos;s only H1 on the website.</p>
        </div>
        <div className="grid grid-cols-[1fr_200px] gap-[10px]">
          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea value={data.description} onChange={(v) => set("description", v)} rows={3} maxLength={250} />
            <p className="mt-[2px] text-[10px] text-[#64748b]">Press Enter to start a new line on the website.</p>
          </div>
          <div>
            <FieldLabel>Bold Text</FieldLabel>
            <TextInput value={data.descriptionHighlight} onChange={(v) => set("descriptionHighlight", v)} placeholder="e.g. Arogya Sanghosthi" maxLength={40} />
            <p className="mt-[2px] text-[10px] text-[#64748b]">Shown in bold. Must match words in the description.</p>
          </div>
        </div>
        <div>
          <FieldLabel>Search Placeholder</FieldLabel>
          <TextInput value={data.searchPlaceholder} onChange={(v) => set("searchPlaceholder", v)} maxLength={40} />
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner — keep the left side plain so the text stays readable. Leave empty to use the website's built-in banner.">
        <CloudImageField
          upload={blogHeroApi.upload}
          label="Background Image"
          value={data.bgImage}
          onChange={(v) => set("bgImage", v)}
          hint="About 1900 × 560 px, up to 5 MB"
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

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
      <SaveBar label="Save Blog Hero" saving={saving} onSave={save} updatedAt={data.updatedAt} updatedBy={data.updatedBy} />
    </div>
  );
}

/* ───────────────── Lists: category navigation, stats band ───────────────── */

interface ListField<T> {
  key: keyof T & string;
  label: string;
  maxLength: number;
  /** Two-line text (Enter = line break on the website) */
  multiline?: boolean;
  placeholder?: string;
}

interface ListEditorProps<T extends { icon: string; iconAlt: string }> {
  name: string;
  itemName: string;
  note: string;
  max: number;
  fields: ListField<T>[];
  blank: () => T;
  api: {
    get: () => Promise<BlogList<T>>;
    save: (items: T[]) => Promise<BlogList<T>>;
    upload: (file: File) => Promise<{ url: string; fileSize: string }>;
  };
}

function BlogListEditor<T extends { icon: string; iconAlt: string }>({ name, itemName, note, max, fields, blank, api }: ListEditorProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<{ updatedAt?: string; updatedBy?: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get()
      .then((res) => {
        setItems(res?.items ?? []);
        setMeta({ updatedAt: res?.updatedAt, updatedBy: res?.updatedBy });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : `Could not load the ${name.toLowerCase()}.`))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (index: number, key: keyof T, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const move = (index: number, by: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const target = index + by;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    if (items.length === 0) return setError(`Add at least one ${itemName.toLowerCase()}.`);
    for (const [i, item] of items.entries()) {
      for (const field of fields) {
        if (!String(item[field.key] ?? "").trim()) return setError(`${itemName} ${i + 1}: enter the ${field.label.toLowerCase()}.`);
      }
      if (item.icon.trim() && !item.iconAlt.trim()) return setError(`${itemName} ${i + 1}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const saved = await api.save(items);
      setItems(saved.items);
      setMeta({ updatedAt: saved.updatedAt, updatedBy: saved.updatedBy });
      showSuccess(`${name} saved. Refresh the website Blogs page to see it.`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : `Could not save the ${name.toLowerCase()}.`;
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label={name} />;

  const smallButton =
    "flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border transition disabled:opacity-30";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-[#64748b]">{note}</p>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, blank()])}
          disabled={items.length >= max}
          className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-[10px] text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          Add {itemName} ({items.length}/{max})
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <div className="text-[11px] font-bold text-[#1e40af]">
              {itemName} {index + 1}
              <span className="font-medium text-[#64748b]">
                {" — "}
                {fields.map((f) => String(item[f.key] ?? "").replace(/\s+/g, " ")).filter(Boolean).join(" · ")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" title="Move up" onClick={() => move(index, -1)} disabled={index === 0} className={`${smallButton} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50`}>
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" title="Move down" onClick={() => move(index, 1)} disabled={index === items.length - 1} className={`${smallButton} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50`}>
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" title={`Remove ${itemName.toLowerCase()}`} onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} className={`${smallButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className={`grid gap-[10px] ${fields.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {fields.map((field) => (
              <div key={field.key}>
                <FieldLabel required>{field.label}</FieldLabel>
                {field.multiline ? (
                  <Textarea value={String(item[field.key] ?? "")} onChange={(v) => update(index, field.key, v)} rows={2} maxLength={field.maxLength} />
                ) : (
                  <TextInput value={String(item[field.key] ?? "")} onChange={(v) => update(index, field.key, v)} placeholder={field.placeholder} maxLength={field.maxLength} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
            <CloudImageField
              upload={api.upload}
              label="Icon"
              value={item.icon}
              onChange={(v) => update(index, "icon", v)}
              hint="Small icon, transparent PNG"
              previewClass="h-[48px] w-[48px]"
            />
            <div>
              <FieldLabel required={Boolean(item.icon)}>Icon Alt Text</FieldLabel>
              <TextInput
                value={item.iconAlt}
                onChange={(v) => update(index, "iconAlt", v)}
                placeholder="Describe the icon (for SEO & screen readers)"
                maxLength={150}
              />
            </div>
          </div>
        </div>
      ))}

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
      <SaveBar label={`Save ${name}`} saving={saving} onSave={save} updatedAt={meta.updatedAt} updatedBy={meta.updatedBy} />
    </div>
  );
}

export function BlogCategoriesEditor() {
  return (
    <BlogListEditor<BlogCategoryLink>
      name="Category Navigation"
      itemName="Category"
      note="The strip of links under the banner, left to right in this order. Press Enter in a title to split it over two lines."
      max={10}
      fields={[{ key: "title", label: "Title", maxLength: 30, multiline: true }]}
      blank={() => ({ title: "", icon: "", iconAlt: "" })}
      api={blogCategoriesApi}
    />
  );
}

export function BlogStatsEditor() {
  return (
    <BlogListEditor<BlogStat>
      name="Blog Stats"
      itemName="Stat"
      note="The stats band near the bottom of the Blogs page, left to right in this order."
      max={6}
      fields={[
        { key: "value", label: "Value", maxLength: 10, placeholder: "e.g. 50+" },
        { key: "label", label: "Label", maxLength: 20, placeholder: "e.g. News Mentions" },
      ]}
      blank={() => ({ value: "", label: "", icon: "", iconAlt: "" })}
      api={blogStatsApi}
    />
  );
}
