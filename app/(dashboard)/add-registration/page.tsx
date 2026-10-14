"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { showSuccess, showError, lazySwal } from "@/lib/toast";
import typography from "../pages/PagesTypography.module.css";
import { Input, Textarea } from "@/components/ui/Input";
import {
  registrationCardsApi,
  RegistrationCard,
  RegistrationCardInput,
} from "@/lib/registrationCardsApi";
import { ApiRequestError } from "@/lib/api";

// The cards show on the website's Register Now page
const WEBSITE_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/register-now`;

const MAX_CARDS = 4;
const MAX_FEATURES = 6;

const EMPTY_FORM: RegistrationCardInput = {
  title: "",
  description: "",
  features: [""],
  buttonLabel: "Register Now",
  buttonHref: "/",
  image: "",
  imageAlt: "",
  isActive: true,
};

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError ? err.message || fallback : fallback;

/* =========================================================
   LIVE PREVIEW — the card as the website's Register Now page
   draws it (same colours and layout, without the animations).
========================================================= */
function CardPreview({ card }: { card: RegistrationCardInput }) {
  const features = card.features.map((f) => f.trim()).filter(Boolean);
  return (
    <div className="relative mx-auto flex w-full max-w-[340px] flex-col items-center overflow-hidden rounded-2xl border-2 border-gray-100 bg-[#fbfdfa] px-6 py-5 text-center shadow-[rgba(9,30,66,0.25)_0px_1px_1px,rgba(9,30,66,0.13)_0px_0px_1px_1px]">
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt={card.imageAlt} className="relative z-10 h-44 w-44 object-contain" />
      ) : (
        <div className="flex h-44 w-44 flex-col items-center justify-center gap-1 text-slate-300">
          <ImageIcon className="h-10 w-10" />
          <span className="text-[10px] font-medium">No image yet</span>
        </div>
      )}

      <h3 className="mb-1.5 text-xl font-semibold uppercase text-[#113111]">{card.title || "Card title"}</h3>

      <div className="mb-3 flex w-full items-center justify-center gap-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300" />
        <div className="h-1.5 w-1.5 rotate-45 bg-[#c1a052]" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300" />
      </div>

      <p className="mb-5 max-w-[300px] whitespace-pre-line text-sm font-medium text-black">{card.description}</p>

      <div className="mb-5 mt-auto flex w-full max-w-[300px] flex-col gap-2 text-left">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-gray-100/50 bg-gradient-to-r from-[#f4f7f4] to-transparent px-4 py-2 text-[13px] font-semibold text-gray-800"
          >
            <CheckCircle className="h-5 w-5 shrink-0 fill-[#1c4516] text-white" /> {feature}
          </div>
        ))}
      </div>

      <div className="flex w-[220px] items-center justify-center gap-2 rounded-full border border-[#c1a052]/30 bg-gradient-to-r from-[#173812] to-[#25541c] px-8 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(32,78,31,0.3)]">
        {card.buttonLabel || "Button"} <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

export default function AddRegistrationPage() {
  const [cards, setCards] = useState<RegistrationCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Heading above the cards
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [savingHeading, setSavingHeading] = useState(false);

  // The card shown in the preview while nothing is being edited
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Add / edit form: null = closed, "new" = adding, otherwise the id being edited
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<RegistrationCardInput>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await registrationCardsApi.get();
      setCards(data.cards);
      setHeading(data.heading);
      setSubheading(data.subheading);
      setSelectedId((prev) => (prev && data.cards.some((c) => c._id === prev) ? prev : data.cards[0]?._id ?? null));
    } catch (err) {
      showError(errorMessage(err, "Could not load the registration cards."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selected = cards.find((c) => c._id === selectedId) ?? cards[0] ?? null;
  const previewCard: RegistrationCardInput | null = editingId ? form : selected;

  const setField = <K extends keyof RegistrationCardInput>(key: K, value: RegistrationCardInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, features: [""] });
    setFormError("");
    setEditingId("new");
  };

  const openEdit = (card: RegistrationCard) => {
    setForm({
      title: card.title,
      description: card.description,
      features: card.features.length ? [...card.features] : [""],
      buttonLabel: card.buttonLabel,
      buttonHref: card.buttonHref,
      image: card.image,
      imageAlt: card.imageAlt,
      isActive: card.isActive,
    });
    setFormError("");
    setSelectedId(card._id);
    setEditingId(card._id);
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await registrationCardsApi.upload(file);
      setField("image", res.url);
      if (!form.imageAlt.trim()) setField("imageAlt", `${form.title.trim() || "Registration"} - Arogya Sangoshthi`);
      showSuccess(`Image uploaded to Cloudinary (${res.fileSize}).`);
    } catch (err) {
      showError(errorMessage(err, "Image upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const input: RegistrationCardInput = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      buttonLabel: form.buttonLabel.trim(),
      buttonHref: form.buttonHref.trim(),
      image: form.image.trim(),
      imageAlt: form.imageAlt.trim(),
      features: form.features.map((f) => f.trim()).filter(Boolean),
    };
    if (!input.title) return setFormError("Enter the card title.");
    if (!input.buttonLabel) return setFormError("Enter the button label.");
    if (!/^(\/(?!\/)|https?:\/\/)/.test(input.buttonHref)) {
      return setFormError('The button link must start with "/" (a page on this website) or "https://".');
    }
    if (input.image && !input.imageAlt) return setFormError("Enter the image alt text.");

    setSaving(true);
    setFormError("");
    try {
      if (editingId === "new") {
        const created = await registrationCardsApi.create(input);
        setSelectedId(created._id);
        showSuccess(`"${created.title}" added. It is now on the website's Register Now page.`);
      } else if (editingId) {
        await registrationCardsApi.update(editingId, input);
        showSuccess(`"${input.title}" saved.`);
      }
      setEditingId(null);
      await load();
    } catch (err) {
      const msg = errorMessage(err, "Could not save this card.");
      setFormError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (card: RegistrationCard) => {
    try {
      const saved = await registrationCardsApi.setActive(card._id, !card.isActive);
      setCards((prev) => prev.map((c) => (c._id === card._id ? saved : c)));
      showSuccess(saved.isActive ? `"${card.title}" is now shown on the website.` : `"${card.title}" is hidden from the website.`);
    } catch (err) {
      showError(errorMessage(err, "Could not change the status."));
    }
  };

  const handleMove = async (index: number, by: -1 | 1) => {
    const target = index + by;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[index], next[target]] = [next[target], next[index]];
    setCards(next);
    try {
      setCards(await registrationCardsApi.reorder(next.map((c) => c._id)));
    } catch (err) {
      showError(errorMessage(err, "Could not save the new order."));
      load();
    }
  };

  const handleDelete = async (card: RegistrationCard) => {
    const result = await lazySwal.fire({
      title: "Delete this card?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">Remove <strong>${card.title.replace(/</g, "&lt;")}</strong> from the website's Register Now page?<br/>This cannot be undone.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "No, Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
    });
    if (!result.isConfirmed) return;
    try {
      await registrationCardsApi.remove(card._id);
      showSuccess(`"${card.title}" deleted.`);
      await load();
    } catch (err) {
      showError(errorMessage(err, "Could not delete this card."));
    }
  };

  const handleSaveHeading = async () => {
    if (!heading.trim()) return showError("Enter the heading.");
    setSavingHeading(true);
    try {
      const saved = await registrationCardsApi.saveHeading({ heading: heading.trim(), subheading: subheading.trim() });
      setHeading(saved.heading);
      setSubheading(saved.subheading);
      showSuccess("Heading saved.");
    } catch (err) {
      showError(errorMessage(err, "Could not save the heading."));
    } finally {
      setSavingHeading(false);
    }
  };

  const iconButton =
    "flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* TOP HEADING */}
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]" style={{ color: "#4B1426" }}>
              Add Registration
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage the registration cards (Single, Group…) shown on the website&apos;s Register Now page.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] shadow-sm transition hover:bg-[#ffedd5]"
            >
              <ExternalLink className="h-[12px] w-[12px]" strokeWidth={1.7} />
              View on Website
            </a>
            <button
              type="button"
              onClick={openAdd}
              disabled={cards.length >= MAX_CARDS || editingId !== null}
              title={cards.length >= MAX_CARDS ? `You can have up to ${MAX_CARDS} cards` : undefined}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add Registration Card
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-[11px] text-[#64748b]">
            <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
            Loading registration cards...
          </div>
        ) : (
          <div className="grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* LEFT: heading + list, or the add / edit form */}
            <div className="flex min-w-0 flex-col gap-[14px]">
              {editingId === null ? (
                <>
                  {/* SECTION HEADING */}
                  <section className="rounded-[7px] border border-[#e8e5df] bg-white p-[14px]">
                    <h2 className="mb-[10px] text-[12px] font-bold text-[#19274a]">Heading above the cards</h2>
                    <div className="grid gap-[10px] md:grid-cols-[1fr_1.4fr_auto] md:items-end">
                      <Input label="Heading" required value={heading} onChange={(e) => setHeading(e.target.value.toUpperCase())} maxLength={40} />
                      <Input label="Sub-heading" value={subheading} onChange={(e) => setSubheading(e.target.value)} maxLength={120} />
                      <button
                        type="button"
                        onClick={handleSaveHeading}
                        disabled={savingHeading}
                        className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        {savingHeading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </button>
                    </div>
                  </section>

                  {/* CARDS LIST */}
                  <section className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                          <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                            {["Order", "Registration Card", "Button Link", "Status", "Actions"].map((label, i) => (
                              <th
                                key={label}
                                className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white ${i === 4 ? "text-right" : ""}`}
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f0ec]">
                          {cards.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-xs font-medium text-slate-500">
                                No registration cards yet — click &quot;Add Registration Card&quot; to add the first one.
                              </td>
                            </tr>
                          ) : (
                            cards.map((card, index) => (
                              <tr
                                key={card._id}
                                onClick={() => setSelectedId(card._id)}
                                className={`cursor-pointer transition hover:bg-slate-50/80 ${selected?._id === card._id ? "bg-[#e8f5e9]" : ""}`}
                              >
                                <td className="whitespace-nowrap px-[12px] py-[8px]">
                                  <div className="flex items-center gap-1">
                                    <span className="w-[18px] text-[8.5px] font-semibold text-[#293681]">#{index + 1}</span>
                                    <button
                                      type="button"
                                      title="Move up"
                                      disabled={index === 0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMove(index, -1);
                                      }}
                                      className={`${iconButton} !h-[20px] !w-[20px] border-[#d8dce2] bg-white text-[#334155]`}
                                    >
                                      <ArrowUp className="h-[10px] w-[10px]" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Move down"
                                      disabled={index === cards.length - 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMove(index, 1);
                                      }}
                                      className={`${iconButton} !h-[20px] !w-[20px] border-[#d8dce2] bg-white text-[#334155]`}
                                    >
                                      <ArrowDown className="h-[10px] w-[10px]" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-[12px] py-[8px]">
                                  <div className="flex min-w-[200px] items-center gap-[10px]">
                                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#e4e7eb] bg-white p-0.5">
                                      {card.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={card.image} alt={card.imageAlt} className="h-full w-full object-contain" />
                                      ) : (
                                        <ImageIcon className="h-4 w-4 text-slate-300" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block truncate text-[9px] font-semibold text-[#4B1426]">{card.title}</span>
                                      <span className="block truncate text-[7.5px] font-medium text-[#64748b]">
                                        {card.features.length} point{card.features.length === 1 ? "" : "s"}
                                        {card.updatedBy ? ` · updated by ${card.updatedBy}` : ""}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-[12px] py-[8px]">
                                  <span className="font-mono text-[8px] font-semibold text-[#233D4D]">{card.buttonHref}</span>
                                </td>
                                <td className="px-[12px] py-[8px]">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggle(card);
                                    }}
                                    title={card.isActive ? "Click to hide from the website" : "Click to show on the website"}
                                    className={`h-[22px] rounded-[4px] border px-[8px] text-[8px] font-bold transition ${
                                      card.isActive
                                        ? "border-[#a5d6a7] bg-[#e8f5e9] text-[#23714a]"
                                        : "border-[#ef9a9a] bg-[#ffebee] text-[#c62828]"
                                    }`}
                                  >
                                    {card.isActive ? "Active" : "Hidden"}
                                  </button>
                                </td>
                                <td className="px-[12px] py-[8px]">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      title="Preview"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(card._id);
                                      }}
                                      className={`${iconButton} border-orange-400/30 bg-orange-500/10 text-orange-600`}
                                    >
                                      <Eye className="h-[12px] w-[12px]" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEdit(card);
                                      }}
                                      className={`${iconButton} border-blue-400/30 bg-blue-500/10 text-blue-600`}
                                    >
                                      <Pencil className="h-[12px] w-[12px]" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(card);
                                      }}
                                      className={`${iconButton} border-red-400/30 bg-red-500/10 text-red-600`}
                                    >
                                      <Trash2 className="h-[12px] w-[12px]" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px] font-semibold text-[#2563eb]">
                      Total Cards: <strong className="font-bold text-[#1d4ed8]">{cards.length}</strong>
                      <span className="ml-2 font-medium text-[#8a92a0]">(up to {MAX_CARDS}; hidden cards are not shown on the website)</span>
                    </div>
                  </section>
                </>
              ) : (
                /* ADD / EDIT FORM — the preview on the right updates as you type */
                <section className="rounded-[7px] border border-[#e8e5df] bg-white p-[14px]">
                  <div className="mb-[12px] flex items-center justify-between border-b border-gray-100 pb-[8px]">
                    <h2 className="text-[12px] font-bold text-[#19274a]">
                      {editingId === "new" ? "New Registration Card" : "Edit Registration Card"}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      title="Close without saving"
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-[4px] transition hover:bg-red-50"
                    >
                      <X className="h-[14px] w-[14px] text-red-500" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="Title"
                      required
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value.toUpperCase())}
                      placeholder="e.g. SINGLE REGISTRATION"
                      maxLength={40}
                    />
                    <Textarea
                      label="Description"
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      rows={2}
                      maxLength={200}
                      hint="Press Enter to start a new line on the website."
                    />

                    {/* POINTS */}
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Points (tick marks)</span>
                        <button
                          type="button"
                          onClick={() => setField("features", [...form.features, ""])}
                          disabled={form.features.length >= MAX_FEATURES}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                          Add Point ({form.features.length}/{MAX_FEATURES})
                        </button>
                      </div>
                      <div className="space-y-2">
                        {form.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                value={feature}
                                onChange={(e) =>
                                  setField(
                                    "features",
                                    form.features.map((f, i) => (i === index ? e.target.value : f))
                                  )
                                }
                                placeholder={`Point ${index + 1}`}
                                maxLength={60}
                              />
                            </div>
                            <button
                              type="button"
                              title="Remove point"
                              onClick={() => setField("features", form.features.filter((_, i) => i !== index))}
                              className={`${iconButton} border-red-400/30 bg-red-500/10 text-red-600`}
                            >
                              <Trash2 className="h-[12px] w-[12px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Button Label"
                        required
                        value={form.buttonLabel}
                        onChange={(e) => setField("buttonLabel", e.target.value)}
                        maxLength={24}
                      />
                      <Input
                        label="Button Link (URL)"
                        required
                        value={form.buttonHref}
                        onChange={(e) => setField("buttonHref", e.target.value)}
                        placeholder="/new-single-registration"
                        maxLength={200}
                        hint='Start with "/" for a page on the website, or paste a full https:// link.'
                      />
                    </div>

                    {/* IMAGE */}
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Card Image</span>
                      <div className="flex items-center gap-3">
                        <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden border border-surface-border bg-surface-card p-1">
                          {form.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={form.image} alt="Card image preview" className="h-full w-full object-contain" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <Input value={form.image} onChange={(e) => setField("image", e.target.value)} placeholder="Image URL, or upload below" />
                          <div>
                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleUpload(e.target.files?.[0]);
                                e.target.value = "";
                              }}
                            />
                            <button
                              type="button"
                              disabled={uploading}
                              onClick={() => fileRef.current?.click()}
                              className="inline-flex h-[28px] items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[11px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:opacity-50"
                            >
                              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                              {uploading ? "Uploading to Cloudinary..." : "Upload Image"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Image Alt Text (SEO & Accessibility)"
                      required={Boolean(form.image)}
                      value={form.imageAlt}
                      onChange={(e) => setField("imageAlt", e.target.value)}
                      placeholder="Describe the image"
                      maxLength={150}
                    />

                    <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#18233b]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#16a34a]"
                        checked={form.isActive}
                        onChange={(e) => setField("isActive", e.target.checked)}
                      />
                      Show this card on the website
                    </label>

                    {formError && <p className="text-[11px] font-semibold text-red-500">{formError}</p>}

                    <div className="flex justify-end gap-[8px] border-t border-gray-100 pt-[12px]">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex h-[32px] items-center px-[14px] text-[12px] font-semibold text-red-600 transition hover:bg-red-100"
                        style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(220,38,38,0.15) 0px 0px 0px 1px" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || uploading}
                        className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {editingId === "new" ? "Add Card" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT: LIVE PREVIEW */}
            <aside className="rounded-[7px] border border-[#e8e5df] bg-[#f6f8f4] p-[14px] xl:sticky xl:top-[14px]">
              <div className="mb-[10px] flex items-center justify-between">
                <h2 className="text-[12px] font-bold text-[#19274a]">Live Preview</h2>
                <span className="rounded-[3px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-700">
                  {editingId ? "UPDATES AS YOU TYPE" : "AS SHOWN ON WEBSITE"}
                </span>
              </div>
              {previewCard ? (
                <CardPreview card={previewCard} />
              ) : (
                <p className="py-10 text-center text-[10px] font-medium text-[#64748b]">Add a card to see its preview here.</p>
              )}
              {previewCard && !previewCard.isActive && (
                <p className="mt-[10px] text-center text-[10px] font-semibold text-[#c62828]">
                  This card is hidden — it is not shown on the website.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
