"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, ExternalLink, FileText, Printer, QrCode } from "lucide-react";
import typography from "../../../pages/PagesTypography.module.css";
import { ApiRequestError } from "@/lib/api";
import { delegatesApi, type Delegate } from "@/lib/delegatesApi";

/* =========================================================
   HELPERS
========================================================= */

const fmtDate = (value?: string) => {
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (value?: string) => {
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const cleanPassName = (value?: string) =>
  (value || "").replace(/\s*\((All \d+ Days?|All Days|\d+ Day|Single Day|1 Day)\)/gi, "").trim() || "—";

const titleCase = (value?: string) => (value ? value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "—");

const fullName = (d: Pick<Delegate, "title" | "fullName">) => [d.title, d.fullName].filter(Boolean).join(" ");

/** "All Days (19, 20, 21 Feb 2027)" / "Day 2 (20 February 2027)" / "Day 1, Day 2" */
const daysText = (days: number[]) =>
  days.length === 3
    ? "All Days (19, 20, 21 Feb 2027)"
    : days.length === 1
      ? `Day ${days[0]} (${18 + days[0]} February 2027)`
      : days.map((d) => `Day ${d}`).join(", ");

function DaysBadge({ days }: { days: number[] }) {
  const label =
    days.length === 3
      ? "All 3 Days (19 Feb + 20 Feb + 21 Feb)"
      : days.length === 2
        ? `${days.map((d) => `Day ${d} (${18 + d} Feb)`).join(" + ")} (2 Days)`
        : `Day ${days[0]} (${18 + days[0]} February 2027)`;
  return <span className="whitespace-nowrap rounded-[5px] border border-slate-200 bg-slate-50 text-slate-800 px-2 py-0.5 text-[9.5px] font-semibold">{label}</span>;
}

/** Text inside the entry QR — same lines as the admin-arogya delegate page, so scanners read it the same way */
const qrText = (d: Delegate) => {
  const id = d.delegateId || d._id.slice(0, 8).toUpperCase();
  const common = [`Mobile: ${d.mobile || d.whatsappNumber || "N/A"}`, `Email: ${d.email || "N/A"}`, `Pass: ${cleanPassName(d.planName)}`, `Days: ${daysText(d.days)}`];
  const amount = `₹${String(d.price || "0").replace(/^₹\s*/, "")}`;
  if (d.registrationType === "group") {
    const members = d.groupMembers?.length ? d.groupMembers : [d];
    return [
      `DELEGATE PASS (GROUP - ${members.length} Members)`,
      `Delegate ID: ${id}`,
      `Primary: ${fullName(d)}`,
      ...common,
      `Total Amount: ${amount}`,
      `Members: ${members.map(fullName).join(", ")}`,
      "Status: VERIFIED",
    ].join("\n");
  }
  return ["DELEGATE PASS (SINGLE)", `Delegate ID: ${id}`, `Name: ${fullName(d)}`, ...common, `Amount: ${amount}`, "Status: VERIFIED"].join("\n");
};

/* =========================================================
   TABLE CELLS
========================================================= */

function Th({ children }: { children: React.ReactNode }) {
  return <th className="w-1/4 border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-left align-middle text-[10px] font-bold text-slate-600">{children}</th>;
}

function Td({ children, colSpan, className = "" }: { children?: React.ReactNode; colSpan?: number; className?: string }) {
  return (
    <td colSpan={colSpan} className={`w-1/4 border border-slate-200 bg-white px-3 py-2.5 text-left align-middle text-[10px] text-slate-800 ${className}`}>
      {children || "—"}
    </td>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-4 w-1 rounded-full bg-[#00291b]" />
      <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-[#00291b]">{children}</h2>
    </div>
  );
}

/* =========================================================
   DELEGATE DETAILS PAGE
========================================================= */

export default function DelegateDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    delegatesApi
      .get(id)
      .then(setDelegate)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load this delegate."));
  }, [id]);

  // QR is drawn in the browser, so delegate details never go to a third-party QR service
  useEffect(() => {
    if (!delegate) return;
    QRCode.toDataURL(qrText(delegate), { width: 400, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [delegate]);

  const otherMembers = useMemo(
    () => (delegate?.groupMembers ?? []).filter((m) => m._id !== delegate?._id),
    [delegate]
  );

  if (error) {
    return (
      <div className={`${typography.pages} flex min-h-[60vh] flex-col items-center justify-center gap-3`}>
        <p className="text-[11px] font-semibold text-red-600">{error}</p>
        <button type="button" onClick={() => router.back()} className="rounded-[5px] bg-[#00291b] px-3 py-1.5 text-[10px] font-bold text-white">
          Go back
        </button>
      </div>
    );
  }

  if (!delegate) {
    return (
      <div className={`${typography.pages} flex min-h-[60vh] flex-col items-center justify-center gap-3`}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00291b] border-t-transparent" />
        <p className="text-[10px] font-semibold text-[#6c7587]">Loading delegate data…</p>
      </div>
    );
  }

  const delId = delegate.delegateId || delegate._id.slice(0, 8).toUpperCase();
  const docUrl = delegate.documentUrl || delegate.groupMembers?.find((m) => m.documentUrl)?.documentUrl;
  const typeLabel = delegate.registrationType === "group" ? "Group Registration" : "Single Registration";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-slate-50 px-[18px] pb-[16px] pt-[14px] text-[#18233b] print:bg-white`}>
      {/* TOP BAR */}
      <div className="mb-[14px] flex items-center justify-between rounded-[6px] bg-[#00291b] px-4 py-2.5 text-white shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-[10.5px] font-medium">
          <button type="button" onClick={() => router.back()} className="transition hover:opacity-80" title="Back">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <span>Delegates / {typeLabel} / {delegate.fullName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-[4px] bg-white px-3 py-1 text-[10px] font-bold text-slate-800 shadow-sm transition hover:bg-slate-100"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-[4px] border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-bold text-white shadow-sm transition hover:bg-white/25"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
      </div>

      <div className="rounded-[6px] border border-slate-200 bg-white p-4 shadow-sm">
        {/* SECTION HEADER */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionHeading>Delegate Overview</SectionHeading>
          <span className="rounded-[5px] border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-700">
            {typeLabel}
          </span>
        </div>

        {/* QR ENTRY PASS */}
        <div className="mb-4 flex flex-col items-center justify-between gap-3 rounded-[8px] border border-emerald-200 bg-[#f0fdf4] p-3 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-[8px] border-2 border-emerald-600 bg-white p-2 shadow-sm">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Delegate Entry QR Code" className="h-32 w-32 object-contain" />
              ) : (
                <div className="grid h-32 w-32 place-items-center text-[9px] text-slate-400">Generating…</div>
              )}
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-emerald-950">Official Entry QR Pass</h3>
                <span className="rounded-[3px] bg-emerald-700 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">Scannable</span>
              </div>
              <p className="mb-1.5 text-[9.5px] font-medium text-emerald-800">
                Scan this QR Code using Paytm, Phone Camera, Google Lens or any QR App for instant verification.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9.5px] font-bold text-slate-600">Reg ID:</span>
                <span className="rounded-[5px] border border-purple-300 bg-white px-2 py-0.5 font-mono text-[10.5px] font-extrabold tracking-wider text-purple-950">
                  {delId}
                </span>
              </div>
            </div>
          </div>
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`QR_${delId.replace(/[^\w-]+/g, "_")}.png`}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-[5px] bg-emerald-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs transition hover:bg-emerald-800 print:hidden"
            >
              <QrCode className="h-3.5 w-3.5" /> Download QR Code
            </a>
          )}
        </div>

        {/* DETAILS */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse border border-slate-200">
            <tbody>
              <tr>
                <Th>Full Name</Th>
                <Td className="text-[11px] font-semibold">{fullName(delegate)}</Td>
                <Th>Upload Document</Th>
                <Td>
                  {docUrl ? (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[5px] border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9.5px] font-semibold text-[#0D47A1] transition hover:bg-blue-100"
                    >
                      <FileText className="h-3 w-3" /> View Document <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[9.5px] font-medium italic text-slate-400">Not Uploaded</span>
                  )}
                </Td>
              </tr>
              <tr>
                <Th>Delegate ID</Th>
                <Td className="font-mono font-bold">{delId}</Td>
                <Th>Date of Registration</Th>
                <Td className="font-semibold">
                  {fmtDate(delegate.createdAt)}
                  <span className="ml-2 text-slate-500">{fmtTime(delegate.createdAt)}</span>
                </Td>
              </tr>
              <tr>
                <Th>Selected Pass</Th>
                <Td className="font-semibold">{cleanPassName(delegate.planName)}</Td>
                <Th>Conference Days</Th>
                <Td><DaysBadge days={delegate.days} /></Td>
              </tr>
              <tr>
                <Th>Amount Paid</Th>
                <Td>
                  {delegate.price ? (
                    <span className="inline-block rounded-[5px] border border-slate-200 bg-slate-50 text-slate-800 px-2 py-0.5 text-[10.5px] font-bold">{delegate.price}</span>
                  ) : null}
                </Td>
                <Th>Discount Applied</Th>
                <Td>
                  {delegate.couponCode ? (
                    <span className="inline-block rounded-[5px] border border-slate-200 bg-slate-50 text-slate-800 px-2 py-0.5 text-[10px] font-semibold">
                      {delegate.couponCode} Applied
                    </span>
                  ) : null}
                </Td>
              </tr>
              <tr>
                <Th>Transaction ID</Th>
                <Td colSpan={3} className="font-mono font-semibold">{delegate.transactionId || "N/A"}</Td>
              </tr>
              <tr>
                <Th>Designation</Th>
                <Td>{titleCase(delegate.designation)}</Td>
                <Th>Organization</Th>
                <Td>{titleCase(delegate.organization)}</Td>
              </tr>
              <tr>
                <Th>Category</Th>
                <Td>{titleCase(delegate.category || delegate.industryType)}</Td>
                <Th>Specialization</Th>
                <Td>{titleCase(delegate.specialization || delegate.areasOfInterest)}</Td>
              </tr>
              <tr>
                <Th>Are you a speaker?</Th>
                <Td>
                  <span
                    className="rounded-[4px] border border-slate-200 bg-slate-50 text-slate-800 px-2 py-0.5 text-[9.5px] font-semibold"
                  >
                    {delegate.isSpeaker || "No"}
                  </span>
                </Td>
                <Th>Dietary Preference</Th>
                <Td className="font-medium">{delegate.dietary ? titleCase(delegate.dietary) : null}</Td>
              </tr>
              <tr>
                <Th>Assistance Required</Th>
                <Td colSpan={3} className="font-medium">{delegate.assistance ? titleCase(delegate.assistance) : null}</Td>
              </tr>
              <tr>
                <Th>Mobile / WhatsApp</Th>
                <Td className="font-medium">
                  {delegate.mobile || delegate.whatsappNumber}
                  {delegate.whatsappNumber && delegate.mobile && delegate.whatsappNumber !== delegate.mobile && (
                    <span className="ml-1 text-[9px] font-medium text-slate-500">(WA: {delegate.whatsappNumber})</span>
                  )}
                </Td>
                <Th>Email Address</Th>
                <Td className="font-medium">{delegate.email}</Td>
              </tr>
              <tr>
                <Th>Verification Status</Th>
                <Td>
                  <span
                    className="rounded-[5px] border border-slate-200 bg-slate-50 text-slate-800 px-2 py-0.5 text-[10px] font-semibold"
                  >
                    {delegate.isVerified ? "Verified" : "Pending"}
                  </span>
                </Td>
                <Th>Source</Th>
                <Td className="font-semibold">{delegate.source}</Td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* LOCATION */}
        <div className="mt-6">
          <SectionHeading>Geographic Location</SectionHeading>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse border border-slate-200">
              <tbody>
                <tr>
                  <Th>Country</Th>
                  <Td>{titleCase(delegate.country)}</Td>
                  <Th>State / Province</Th>
                  <Td>{titleCase(delegate.state)}</Td>
                </tr>
                <tr>
                  <Th>City</Th>
                  <Td>{titleCase(delegate.city)}</Td>
                  <Th>Address Details</Th>
                  <Td>{delegate.address}</Td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* GROUP MEMBERS */}
        {delegate.registrationType === "group" && otherMembers.length > 0 && (
          <div className="mt-6">
            <SectionHeading>
              Group Members{" "}
              <span className="ml-1 rounded-[4px] bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">{otherMembers.length} more</span>
            </SectionHeading>
            <div className="w-full overflow-x-auto rounded-[6px] border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse bg-white text-left">
                <thead className="bg-[#e6ecf2]">
                  <tr>
                    {["Name", "Contact", "Designation", "Delegate ID", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-[8.5px] font-bold uppercase tracking-wider text-gray-900">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {otherMembers.map((m) => (
                    <tr key={m._id} className="transition hover:bg-slate-50">
                      <td className="px-3 py-2 text-[10.5px] font-semibold text-slate-800">{fullName(m)}</td>
                      <td className="px-3 py-2">
                        <div className="text-[9.5px] font-medium text-slate-700">{m.email}</div>
                        <div className="text-[9.5px] font-medium text-slate-700">{m.whatsappNumber || m.mobile}</div>
                      </td>
                      <td className="px-3 py-2 text-[10px] font-medium capitalize text-slate-700">{m.designation || "—"}</td>
                      <td className="px-3 py-2 font-mono text-[9.5px] font-semibold text-slate-500">{m.delegateId || m._id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-3 py-2 text-right print:hidden">
                        <button
                          type="button"
                          onClick={() => router.push(`/delegates/view/${m._id}`)}
                          className="text-[9px] font-bold text-[#166b40] hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
