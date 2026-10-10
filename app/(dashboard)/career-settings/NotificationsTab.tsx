"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Lightbulb, Mail, Edit,
  Send, ChevronDown, Clock, User, Users,
  CheckCircle, XCircle, AlertCircle, Calendar,
  Pause, Briefcase, Settings
} from "lucide-react";
import Swal from "sweetalert2";
import {
  DEFAULT_NOTIFICATIONS, DEFAULT_TEMPLATES, NOTIFY_RECIPIENT_OPTIONS,
  loadSection, saveSection, sendTestNotification,
  type EmailTemplate, type NotificationTrigger, type NotificationsSettingsData,
} from "@/lib/careersSettings";
import type { RegisterTabActions } from "./page";

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange?: (next: boolean) => void; label?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={!onChange}
    onClick={() => onChange?.(!checked)}
    className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${onChange ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}
  >
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </button>
);

const inputCls = "w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none focus:border-[#148943]";

export default function NotificationsTab({ registerActions, onOpenTemplates }: {
  registerActions?: RegisterTabActions;
  onOpenTemplates?: () => void;
}) {
  const [data, setData] = useState<NotificationsSettingsData | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [previewTab, setPreviewTab] = useState("Email Preview");
  const [previewTriggerId, setPreviewTriggerId] = useState("aiPass");
  const [testTemplateId, setTestTemplateId] = useState("eligible");
  const [testTo, setTestTo] = useState("vijay@namogange.org");
  const [testChannel, setTestChannel] = useState("Email");
  const dataRef = useRef<NotificationsSettingsData | null>(null);
  dataRef.current = data;

  const load = useCallback(() => {
    setLoadError("");
    setData(null);
    Promise.all([
      loadSection<NotificationsSettingsData>("notifications"),
      loadSection<{ templates: EmailTemplate[] }>("emailTemplates"),
    ])
      .then(([notif, mail]) => {
        setData(notif);
        setTemplates(mail.templates?.length ? mail.templates : DEFAULT_TEMPLATES);
      })
      .catch((err) => setLoadError((err as Error)?.message || "Could not load notification settings"));
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const patchTrigger = (id: string, p: Partial<NotificationTrigger>) =>
    setData((prev) => (prev ? { ...prev, triggers: prev.triggers.map((t) => (t.id === id ? { ...t, ...p } : t)) } : prev));

  const save = async () => {
    const current = dataRef.current;
    if (!current || saving) return;
    setSaving(true);
    try {
      const saved = await saveSection<NotificationsSettingsData>("notifications", current);
      setData(saved);
      Swal.fire({ icon: "success", title: "Notification settings saved", text: "Triggers, recipients and schedule are updated.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not save", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setData(JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS)));
    Swal.fire({ icon: "info", title: "Reset to defaults", text: "Defaults loaded. Click Save Settings to apply them.", confirmButtonColor: "#148943" });
  };

  useEffect(() => {
    if (!registerActions) return;
    return registerActions(() => ({ save, reset, saving }));
  });

  const previewTemplate = useMemo(
    () => templates.find((t) => t.name === data?.triggers.find((tr) => tr.id === previewTriggerId)?.template) || templates.find((t) => t.id === "eligible"),
    [templates, data, previewTriggerId]
  );

  const runTest = async () => {
    if (sendingTest) return;
    const template = templates.find((t) => t.id === testTemplateId);
    if (!template) {
      Swal.fire({ icon: "warning", title: "Pick a template", text: "Select the template you want to test.", confirmButtonColor: "#dc2626" });
      return;
    }
    setSendingTest(true);
    try {
      const res = await sendTestNotification({
        to: testTo,
        subject: template.subject,
        body: template.body,
        channel: testChannel,
        templateName: template.name,
      });
      Swal.fire({ icon: "success", title: "Test sent", text: res?.message || "Test notification sent.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not send test", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSendingTest(false);
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[14px] text-[10px] font-semibold text-[#506083]">
        {loadError ? <span className="text-[#DC2626]">{loadError} </span> : "Loading notification settings..."}
        <button onClick={() => setReloadKey((k) => k + 1)} className="ml-[8px] text-[#2563EB] font-bold hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <>
      {/* Top Section: Banner & Quick Tips */}
      <div className="flex items-stretch gap-[8px] mb-[6px]" style={{ height: '132.1px' }}>
        <div
          className="flex-1 bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden relative bg-no-repeat"
          style={{ backgroundImage: "url('/notification.png')", backgroundPosition: "right center", backgroundSize: "contain" }}
        >
          <div className="flex items-center gap-[10px] relative z-10 w-full h-full py-[4px] px-[10px] bg-gradient-to-r from-white via-white/90 to-transparent">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="w-[42px] h-[42px] rounded-[8px] bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                <Bell size={20} fill="currentColor" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Notification Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure automatic notifications for candidates, HR team and admin.</p>
            </div>
          </div>
        </div>

        <div className="w-[320px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] py-[6px] px-[8px] flex-shrink-0">
          <div className="flex items-center gap-[4px] mb-[4px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <Lightbulb size={8} />
            </div>
            <h3 className="text-[9px] font-bold text-[#2563EB]">Quick Tips</h3>
          </div>
          <ul className="text-[7.5px] font-semibold text-[#506083] space-y-[1px] list-disc list-inside">
            <li>Keep messages clear and concise</li>
            <li>Use candidate name and job title</li>
            <li>Enable only relevant notifications</li>
            <li>Test messages before going live</li>
          </ul>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-[6px] mb-[6px]">
        {/* Left Column: Notification Triggers */}
        <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col">
          <div className="flex items-center gap-[6px] mb-[6px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Triggers</h3>
              <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Select events and channels for automatic notifications.</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto_90px_130px_30px] gap-[8px] items-end mb-[4px] px-[4px] pb-[4px] border-b border-[#E1E6EC]">
            <div className="text-[9px] font-bold text-[#172762] pb-[2px]">Event / Trigger</div>
            <div className="text-[9px] font-bold text-[#172762] text-center w-[30px] pb-[2px]">Email</div>
            <div className="text-[9px] font-bold text-[#172762] text-center w-[30px] pb-[2px]">SMS</div>
            <div className="text-[9px] font-bold text-[#172762] text-center w-[60px] pb-[2px]">WhatsApp</div>
            <div className="text-[9px] font-bold text-[#172762] text-center pb-[2px]">Notify</div>
            <div className="text-[9px] font-bold text-[#172762] pb-[2px]">Template</div>
            <div></div>
          </div>

          <div className="space-y-[1px] flex-1 overflow-y-auto max-h-[340px]">
            {data.triggers.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_auto_auto_auto_90px_130px_30px] gap-[8px] items-center py-[2px] px-[4px] hover:bg-[#F8FAFC] rounded-[4px] transition-colors border-b border-[#F1F5F9] last:border-0">
                <div className="flex items-center gap-[6px] overflow-hidden">
                  <RowIcon type={row.icon} />
                  <span className="text-[9px] font-semibold text-[#172762] whitespace-pre-wrap leading-tight">{row.name}</span>
                </div>
                <div className="w-[30px] flex justify-center"><Toggle checked={row.email} label={`${row.name} email`} onChange={(v) => patchTrigger(row.id, { email: v })} /></div>
                <div className="w-[30px] flex justify-center"><Toggle checked={row.sms} label={`${row.name} sms`} onChange={(v) => patchTrigger(row.id, { sms: v })} /></div>
                <div className="w-[60px] flex justify-center"><Toggle checked={row.whatsapp} label={`${row.name} whatsapp`} onChange={(v) => patchTrigger(row.id, { whatsapp: v })} /></div>

                <div className="relative">
                  <select value={row.notify} onChange={(e) => patchTrigger(row.id, { notify: e.target.value })} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white cursor-pointer">
                    {NOTIFY_RECIPIENT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                </div>

                <div className="relative">
                  <select value={row.template} onChange={(e) => patchTrigger(row.id, { template: e.target.value })} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white truncate pr-[16px] cursor-pointer">
                    {templates.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    title="Edit this template"
                    onClick={() => { setPreviewTriggerId(row.id); onOpenTemplates?.(); }}
                    className="text-[#2563EB] border border-[#D5E6FA] rounded-[4px] p-[3px] bg-white hover:bg-[#EEF4FF] transition-colors"
                  >
                    <Edit size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Message Preview */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col">
          <div className="flex items-center justify-between mb-[6px]">
            <div className="flex items-center gap-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <EyeIcon />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Message Preview</h3>
              </div>
            </div>
            <div className="relative">
              <select value={previewTriggerId} onChange={(e) => setPreviewTriggerId(e.target.value)} className="border border-[#E1E6EC] rounded-[4px] px-[4px] py-[2px] text-[8px] font-semibold text-[#172762] appearance-none outline-none bg-white cursor-pointer pr-[14px]">
                {data.triggers.map((t) => <option key={t.id} value={t.id}>{t.name.replace(/\n/g, " ")}</option>)}
              </select>
              <ChevronDown size={8} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
            </div>
          </div>

          <div className="flex mb-[8px] border-b border-[#E1E6EC]">
            {["Email Preview", "SMS Preview", "WhatsApp Preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className={`flex-1 text-center pb-[4px] text-[9px] font-bold transition-colors relative ${
                  previewTab === tab ? 'text-[#172762]' : 'text-[#506083] hover:text-[#172762]'
                }`}
              >
                {tab}
                {previewTab === tab && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2563EB]" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-[8px] shadow-sm flex-1 overflow-y-auto">
            <div className="text-[8.5px] font-bold text-[#172762] mb-[6px] pb-[6px] border-b border-[#E1E6EC]">
              Subject: {previewTemplate?.subject || "—"}
            </div>

            <div className="mb-[8px] rounded-[4px] overflow-hidden h-[45px]">
              <img src="/notific2.png" alt="Banner" className="w-full h-full object-cover object-center" />
            </div>

            <div className="text-[8.5px] font-medium text-[#172762] leading-[1.6] space-y-[6px] whitespace-pre-wrap">
              {previewTab === "Email Preview" && (previewTemplate?.body || "")}
              {previewTab === "SMS Preview" && `Hi {{candidate_name}}, ${(previewTemplate?.body || "").split("\n").slice(1, 3).join(" ").slice(0, 120)}… (SMS preview)`}
              {previewTab === "WhatsApp Preview" && `👋 Hi {{candidate_name}}!\n\n${(previewTemplate?.body || "").split("\n").slice(1, 3).join(" ").slice(0, 140)}…`}
            </div>
            {previewTab === "Email Preview" && (
              <button className="bg-[#148943] text-white px-[12px] py-[6px] rounded-[4px] text-[9px] font-bold mt-[8px]">
                Continue Application →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Columns */}
      <div className="grid grid-cols-3 gap-[6px]">
        {/* Notification Recipients */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
          <div className="flex items-center gap-[6px] mb-[8px]">
            <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Users size={12} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Recipients (Internal)</h3>
              <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Configure who will receive notifications.</p>
            </div>
          </div>

          <div className="space-y-[6px]">
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">HR Notification Email</label>
              <div className="flex flex-col gap-[2px]">
                <input type="text" value={data.hrEmail} onChange={(e) => setData((p) => (p ? { ...p, hrEmail: e.target.value } : p))} className={inputCls} />
                <span className="text-[7px] text-[#94A3B8]">Multiple emails can be added (comma separated)</span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">CC to Admin (Optional)</label>
              <input type="text" value={data.ccAdmin} onChange={(e) => setData((p) => (p ? { ...p, ccAdmin: e.target.value } : p))} className={inputCls} />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px] pt-[2px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">Notify on New Application</label>
              <div className="flex items-center gap-[6px]">
                <Toggle checked={data.notifyNewApplication} label="Notify on new application" onChange={(v) => setData((p) => (p ? { ...p, notifyNewApplication: v } : p))} />
                <span className="text-[7.5px] text-[#506083]">Send email to HR when a new application is submitted.</span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">Daily Summary Report</label>
              <div className="flex items-center gap-[6px]">
                <Toggle checked={data.dailySummary} label="Daily summary" onChange={(v) => setData((p) => (p ? { ...p, dailySummary: v } : p))} />
                <span className="text-[7.5px] text-[#506083]">Send daily summary of applications to HR/admin.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Schedule */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
          <div className="flex items-center gap-[6px] mb-[8px]">
            <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Clock size={12} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Schedule</h3>
              <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Control timing and frequency of notifications.</p>
            </div>
          </div>

          <div className="space-y-[6px]">
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-semibold text-[#172762]">Follow-up after no response</label>
              <div className="flex items-center gap-[4px]">
                <input type="number" min={1} value={data.followUpDays} onChange={(e) => setData((p) => (p ? { ...p, followUpDays: Math.max(1, Number(e.target.value) || 1) } : p))} className="w-[40px] text-center border border-[#E1E6EC] rounded-[4px] px-[4px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none focus:border-[#148943]" />
                <span className="text-[8.5px] text-[#506083]">days</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-semibold text-[#172762]">Daily summary time</label>
              <div className="relative w-[120px]">
                <input type="text" value={data.summaryTime} onChange={(e) => setData((p) => (p ? { ...p, summaryTime: e.target.value } : p))} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none focus:border-[#148943]" />
                <Clock size={10} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-semibold text-[#172762]">Time Zone</label>
              <div className="relative w-[140px]">
                <select value={data.timezone} onChange={(e) => setData((p) => (p ? { ...p, timezone: e.target.value } : p))} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8px] font-semibold text-[#172762] appearance-none outline-none bg-white cursor-pointer">
                  <option>(GMT+05:30) India Standard Time</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
                <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-[2px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">Send only on working days</label>
              <Toggle checked={data.workingDaysOnly} label="Working days only" onChange={(v) => setData((p) => (p ? { ...p, workingDaysOnly: v } : p))} />
            </div>
          </div>
        </div>

        {/* Test Notification */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Send size={12} className="ml-[-2px] mt-[1px] -rotate-45" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Test Notification</h3>
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Send a test message to verify the settings.</p>
              </div>
            </div>

            <div className="space-y-[6px]">
              <div className="grid grid-cols-[60px_1fr] items-center gap-[6px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Select Template</label>
                <div className="relative">
                  <select value={testTemplateId} onChange={(e) => setTestTemplateId(e.target.value)} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white cursor-pointer">
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-[60px_1fr] items-center gap-[6px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Send Test To</label>
                <input type="text" value={testTo} onChange={(e) => setTestTo(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-[60px_1fr] items-center gap-[6px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Channel</label>
                <div className="flex items-center justify-between pr-[10px]">
                  {["Email", "SMS", "WhatsApp"].map((ch) => (
                    <label key={ch} className="flex items-center gap-[4px] text-[8.5px] font-semibold text-[#172762] cursor-pointer">
                      <input type="radio" name="channel" checked={testChannel === ch} onChange={() => setTestChannel(ch)} className="w-[10px] h-[10px] accent-[#2563EB]" />
                      {ch}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[6px] flex justify-end">
            <button
              onClick={runTest}
              disabled={sendingTest}
              className="flex items-center gap-[4px] bg-white border border-[#D5E6FA] text-[#2563EB] px-[12px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#EEF4FF] transition-colors shadow-sm w-[130px] justify-center disabled:opacity-50"
            >
              <Send size={10} className="-mt-[1px] -rotate-45" /> {sendingTest ? "Sending..." : "Send Test Message"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RowIcon = ({ type }: { type: string }) => {
  const getIcon = () => {
    switch (type) {
      case "green-send": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <Send size={12} className="-rotate-45 ml-[-2px] mt-[2px]" /> };
      case "purple-check": return { bg: "bg-[#F3E8FF]", color: "text-[#9333EA]", icon: <CheckCircle size={12} /> };
      case "red-alert": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <AlertCircle size={12} /> };
      case "blue-user": return { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", icon: <User size={12} /> };
      case "green-user": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <Users size={12} /> };
      case "purple-calendar": return { bg: "bg-[#F3E8FF]", color: "text-[#9333EA]", icon: <Calendar size={12} /> };
      case "green-check": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <CheckCircle size={12} /> };
      case "red-cross": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <XCircle size={12} /> };
      case "orange-pause": return { bg: "bg-[#FFEDD5]", color: "text-[#EA580C]", icon: <Pause size={12} /> };
      case "blue-check": return { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", icon: <Briefcase size={12} /> };
      case "gray-clock": return { bg: "bg-[#F1F5F9]", color: "text-[#64748B]", icon: <Clock size={12} /> };
      default: return { bg: "bg-[#F1F5F9]", color: "text-[#64748B]", icon: <Mail size={12} /> };
    }
  };
  const config = getIcon();
  return (
    <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
      {config.icon}
    </div>
  );
};
