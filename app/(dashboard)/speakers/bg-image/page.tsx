"use client";

import { useEffect, useState } from "react";
import { Calendar, Globe, Hash, ImageIcon, Loader2, Mic, Plus, Save, Target, UserCheck, Users, type LucideIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { CloudImageField } from "@/components/cms/editor/CloudImageField";
import { showError, showSuccess } from "@/lib/toast";
import {
  speakerHeroApi, SPEAKER_COUNTER_ICONS, SpeakerCounter, SpeakerCounterIcon, SpeakerCounterInput, SpeakerHero,
} from "@/lib/speakersApi";
import { Cell, confirmDelete, errorText, ModalFooter, RowActions, SpeakerPageShell } from "@/components/speakers/SpeakerAdminUI";

/* =========================================================
   SPEAKERS SECTION → ADD BG IMAGE — the banner at the top of the
   website Speakers page (heading, title, text, background image)
   and the counter strip under it.
========================================================= */

const ICONS: Record<SpeakerCounterIcon, { label: string; Icon: LucideIcon }> = {
  UserCheck: { label: "User Check", Icon: UserCheck },
  Mic: { label: "Microphone", Icon: Mic },
  Calendar: { label: "Calendar", Icon: Calendar },
  Users: { label: "Users", Icon: Users },
  Globe: { label: "Globe", Icon: Globe },
  Target: { label: "Target", Icon: Target },
};
const EMPTY_HERO: SpeakerHero = { heading: "", title: "", shortDescription: "", backgroundImage: "", backgroundImageAlt: "" };
const EMPTY_COUNTER: SpeakerCounterInput = { number: "", label: "", icon: "UserCheck", order: 0 };

function HeroCard() {
  const [hero, setHero] = useState<SpeakerHero | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    speakerHeroApi
      .get()
      .then((res) => setHero({ ...EMPTY_HERO, ...res }))
      .catch((err) => setError(errorText(err, "Could not load the banner.")));
  }, []);

  if (!hero) {
    return error ? <p className="text-[11px] font-semibold text-red-500">{error}</p> : (
      <span className="inline-flex items-center gap-2 text-[11px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin" /> Loading banner...</span>
    );
  }
  const set = (key: keyof SpeakerHero, value: string) => setHero({ ...hero, [key]: value });

  const save = async () => {
    if (!hero.heading.trim() || !hero.title.trim()) return setError("Heading and title are required.");
    if (hero.backgroundImage && !hero.backgroundImageAlt.trim()) return setError("Enter the background image alt text.");
    setSaving(true);
    setError("");
    try {
      const { heading, title, shortDescription, backgroundImage, backgroundImageAlt } = hero;
      const saved = await speakerHeroApi.save({
        heading: heading.trim(), title: title.trim(), shortDescription: shortDescription.trim(),
        backgroundImage, backgroundImageAlt: backgroundImage ? backgroundImageAlt.trim() : "",
      });
      setHero({ ...EMPTY_HERO, ...saved });
      showSuccess("Speakers banner saved. Refresh the website to see it.");
    } catch (err) {
      const msg = errorText(err, "Could not save the banner.");
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[7px] border border-[#e8e5df] bg-white p-[14px]">
      <h2 className="mb-[10px] flex items-center gap-[6px] border-b border-[#f0f0ec] pb-[8px] text-[11px] font-bold uppercase tracking-wide text-[#4B1426]">
        <ImageIcon className="h-[13px] w-[13px]" /> Banner
      </h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Heading" required maxLength={40} value={hero.heading} onChange={(e) => set("heading", e.target.value)} hint='First line, e.g. "Our Esteemed"' />
          <Input label="Title (H1)" required maxLength={40} value={hero.title} onChange={(e) => set("title", e.target.value)} hint={'The Speakers page\'s only H1, e.g. "Speakers"'} />
        </div>
        <Textarea label="Short Description" rows={3} maxLength={300} value={hero.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        <div className="space-y-3 rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
          <CloudImageField upload={speakerHeroApi.uploadImage} label="Background Image" value={hero.backgroundImage}
            onChange={(v) => set("backgroundImage", v)} hint="Wide image, about 1900 × 800 px — keep the left side plain" previewClass="h-[64px] w-[140px]" />
          <Input label="Background Alt Text" required={Boolean(hero.backgroundImage)} maxLength={150} disabled={!hero.backgroundImage}
            value={hero.backgroundImageAlt} onChange={(e) => set("backgroundImageAlt", e.target.value)} placeholder="Describe what the background shows (for SEO)" />
        </div>
        {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button type="button" onClick={save} disabled={saving}
            className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#1b5e20] px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Banner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpeakersBgImagePage() {
  const [counters, setCounters] = useState<SpeakerCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ id: string | null; form: SpeakerCounterInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    speakerHeroApi.counters
      .list()
      .then(setCounters)
      .catch((err) => showError(errorText(err, "Could not load the counters.")))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setForm = (patch: Partial<SpeakerCounterInput>) => modal && setModal({ ...modal, form: { ...modal.form, ...patch } });

  const save = async () => {
    if (!modal) return;
    const f = { ...modal.form, number: modal.form.number.trim(), label: modal.form.label.trim(), order: Number(modal.form.order) || 0 };
    if (!f.number || !f.label) return setError("Number and label are required.");
    setSaving(true);
    setError("");
    try {
      if (modal.id) await speakerHeroApi.counters.update(modal.id, f);
      else await speakerHeroApi.counters.create(f);
      showSuccess(modal.id ? "Counter updated." : "Counter added.");
      setModal(null);
      load();
    } catch (err) {
      setError(errorText(err, "Could not save the counter."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: SpeakerCounter) => {
    if (!(await confirmDelete(`Delete "${c.number} ${c.label}"?`, "The counter disappears from the website.")).isConfirmed) return;
    try {
      await speakerHeroApi.counters.remove(c._id);
      showSuccess("Counter deleted.");
      load();
    } catch (err) {
      showError(errorText(err, "Could not delete the counter."));
    }
  };

  const openNew = () => {
    setError("");
    setModal({ id: null, form: { ...EMPTY_COUNTER, order: counters.reduce((m, c) => Math.max(m, c.order || 0), 0) + 1 } });
  };

  return (
    <SpeakerPageShell title="Speakers Banner" description="Manage the banner at the top of the website Speakers page and the counter strip under it." websitePath="/speakers">
      <div className="grid grid-cols-1 gap-[14px] xl:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
        <HeroCard />

        <div className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="flex items-center justify-between bg-[#111844] px-[12px] py-[8px]">
            <h2 className="flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-wider text-white">
              <Hash className="h-[13px] w-[13px]" /> Counters
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8.5px]">{counters.length}</span>
            </h2>
            <button type="button" onClick={openNew}
              className="flex h-[26px] items-center gap-[5px] rounded-[5px] bg-[#1b5e20] px-[10px] text-[8.5px] font-semibold text-white hover:bg-[#14491a]">
              <Plus className="h-[11px] w-[11px]" /> Add Counter
            </button>
          </div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-[30px] border-b border-[#e8e5df] bg-[#f4f5f9]">
                {["S.No", "Counter", "Icon", "Order", "Actions"].map((h, i, all) => (
                  <th key={h} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-[#111844] ${i === all.length - 1 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec]">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center">
                  <span className="inline-flex items-center gap-2 text-[11px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin text-[#293681]" /> Loading...</span>
                </td></tr>
              ) : !counters.length ? (
                <tr><td colSpan={5} className="py-10 text-center text-[10px] text-[#6c7587]">No counters added yet.</td></tr>
              ) : counters.map((c, i) => {
                const { Icon, label } = ICONS[c.icon] ?? ICONS.UserCheck;
                return (
                  <tr key={c._id} className="hover:bg-slate-50/80">
                    <Cell className="font-semibold text-[#293681]">{i + 1}</Cell>
                    <Cell>
                      <span className="text-[12px] font-bold text-[#4B1426]">{c.number}</span>{" "}
                      <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#0A7C6E]">{c.label}</span>
                    </Cell>
                    <Cell><span className="inline-flex items-center gap-1 font-semibold"><Icon className="h-3.5 w-3.5 text-[#b8860b]" /> {label}</span></Cell>
                    <Cell className="font-bold">{c.order}</Cell>
                    <Cell>
                      <RowActions onEdit={() => { setError(""); const { _id, ...rest } = c; setModal({ id: _id, form: { ...EMPTY_COUNTER, ...rest } }); }} onDelete={() => remove(c)} />
                    </Cell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.id ? "Edit Counter" : "Add Counter"} size="md"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save Changes" : "Add Counter"} />}>
        {modal && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Number" required maxLength={12} placeholder="e.g. 150+" value={modal.form.number} onChange={(e) => setForm({ number: e.target.value.toUpperCase() })} />
              <Input label="Order" type="number" min={0} value={String(modal.form.order)} onChange={(e) => setForm({ order: Number(e.target.value) })} />
            </div>
            <Input label="Label" required maxLength={40} placeholder="e.g. EXPERT SPEAKERS" value={modal.form.label} onChange={(e) => setForm({ label: e.target.value.toUpperCase() })} />
            <Select label="Icon" value={modal.form.icon} onChange={(e) => setForm({ icon: e.target.value as SpeakerCounterIcon })}>
              {SPEAKER_COUNTER_ICONS.map((name) => <option key={name} value={name}>{ICONS[name].label}</option>)}
            </Select>
            {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </SpeakerPageShell>
  );
}
