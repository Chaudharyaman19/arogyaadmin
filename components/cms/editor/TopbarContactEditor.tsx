"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel } from "./FormPrimitives";
import { siteSettingsApi } from "@/lib/siteSettingsApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   TOPBAR CONTACT — emails & phones in the website header strip.
   Loads from and saves straight to backend-arogya (topbarEmails /
   topbarPhones), which the website Topbar reads. It has its own
   Save button because page sections are only stored locally.
========================================================= */

const MAX_ITEMS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{6,19}$/;

type Kind = "emails" | "phones";

function ContactList({
  kind,
  values,
  onChange,
}: {
  kind: Kind;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const isEmail = kind === "emails";
  const Icon = isEmail ? Mail : Phone;

  const update = (index: number, value: string) =>
    onChange(values.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(values.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-[6px]">
      <FieldLabel required>{isEmail ? "Contact Emails" : "Phone Numbers"}</FieldLabel>

      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-[6px]">
          <div className="relative flex-1">
            <Icon className="pointer-events-none absolute left-[10px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#64748b]" />
            <input
              type={isEmail ? "email" : "tel"}
              value={value}
              maxLength={isEmail ? 120 : 20}
              placeholder={isEmail ? "info@arogyasangoshthi.com" : "+91 98765 43210"}
              onChange={(e) => update(index, e.target.value)}
              className="h-[35px] w-full rounded-none bg-white pl-[30px] pr-[10px] text-[12px] text-[#1e293b] shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)] outline-none focus:shadow-[0_0_0_1px_#0f766e]"
            />
          </div>
          <button
            type="button"
            title={values.length <= 1 ? "At least one is required" : "Remove"}
            disabled={values.length <= 1}
            onClick={() => remove(index)}
            className="grid h-[35px] w-[35px] shrink-0 place-items-center border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-[13px] w-[13px]" />
          </button>
        </div>
      ))}

      <button
        type="button"
        disabled={values.length >= MAX_ITEMS}
        onClick={() => onChange([...values, ""])}
        className="flex h-[30px] w-fit items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-[12px] w-[12px]" />
        {isEmail ? "Add Email" : "Add Phone"}
        <span className="font-medium text-[#64748b]">
          ({values.length}/{MAX_ITEMS})
        </span>
      </button>
    </div>
  );
}

export function TopbarContactEditor() {
  const [emails, setEmails] = useState<string[]>([""]);
  const [phones, setPhones] = useState<string[]>([""]);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    siteSettingsApi
      .topbarContact()
      .then((data) => {
        setEmails(data.emails?.length ? data.emails : [""]);
        setPhones(data.phones?.length ? data.phones : [""]);
        setIsDefault(Boolean(data.isDefault));
      })
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : "Could not load the topbar contact details.");
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const cleanEmails = emails.map((e) => e.trim().toLowerCase()).filter(Boolean);
    const cleanPhones = phones.map((p) => p.trim()).filter(Boolean);

    if (!cleanEmails.length) return setError("Add at least one email.");
    if (!cleanPhones.length) return setError("Add at least one phone number.");
    const badEmail = cleanEmails.find((e) => !EMAIL_PATTERN.test(e));
    if (badEmail) return setError(`"${badEmail}" is not a valid email address.`);
    const badPhone = cleanPhones.find((p) => !PHONE_PATTERN.test(p));
    if (badPhone) return setError(`"${badPhone}" is not a valid phone number.`);

    setSaving(true);
    setError("");
    try {
      const saved = await siteSettingsApi.updateTopbarContact({ emails: cleanEmails, phones: cleanPhones });
      setEmails(saved.emails);
      setPhones(saved.phones);
      setIsDefault(false);
      showSuccess("Topbar email & phone saved. The website is updated.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the topbar contact details.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="col-span-2 flex flex-col gap-3 rounded-[6px] border border-[#e2e8f0] bg-white p-3">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
        <div>
          <div className="text-[11px] font-bold text-[#1e40af]">Website Topbar — Email & Phone</div>
          <p className="mt-[2px] text-[10px] text-[#64748b]">
            Shown in the green strip at the top of every website page. Saved directly to the live website.
          </p>
        </div>
        {isDefault && !loading && (
          <span className="shrink-0 rounded-[3px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
            SHOWING WEBSITE DEFAULTS
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-[11px] text-[#64748b]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
          Loading current website details...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ContactList kind="emails" values={emails} onChange={setEmails} />
            <ContactList kind="phones" values={phones} onChange={setPhones} />
          </div>

          {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Email & Phone
            </button>
          </div>
        </>
      )}
    </div>
  );
}
