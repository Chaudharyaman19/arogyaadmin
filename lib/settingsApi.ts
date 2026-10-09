import { Settings } from "./types";
import { api } from "./api";

const SETTINGS_KEY = "arogya_admin_settings_v1";

const defaultMockSettings: Settings = {
  websiteName: "Arogya Expo Portal 2027",
  fullPaymentDiscount: 5,
  currency: "INR",
  contactEmail: "info@namogangewellness.com",
  contactPhone: "+91 9654900525"
} as any;

function readStored(): Record<string, any> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function writeStored(value: Record<string, any>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}

/* =========================================================
   SETTINGS API
   localStorage is the source of truth for admin edits (page
   sections, SEO, config). The backend is synced best-effort —
   its mock/restricted responses must never overwrite saved
   page content.
========================================================= */
export const settingsApi = {
  get: async (): Promise<Settings> => {
    let backendData: Record<string, any> | null = null;
    try {
      const res: any = await api.get("/settings?website=Arogya");
      backendData = res?.data || res || null;
      if (backendData && Object.keys(backendData).length === 0) backendData = null;
    } catch (e) {
      console.warn("Failed to fetch settings from backend API, using local storage:", e);
    }

    const stored = readStored();
    const merged = { ...defaultMockSettings, ...(backendData ?? {}), ...(stored ?? {}) };
    if (JSON.stringify(stored ?? null) !== JSON.stringify(merged)) {
      writeStored(merged);
    }
    return merged;
  },
  getSystemAlerts: async (): Promise<any> => ({ alerts: [] }),
  update: async (payload: Partial<Settings>): Promise<Settings> => {
    const current = { ...defaultMockSettings, ...(readStored() ?? {}) };
    const updated = { ...current, ...payload };

    /* Persist locally first so page sections survive reloads even
       when the backend endpoint is mocked or schema-incompatible. */
    writeStored(updated);

    try {
      await api.put("/settings?website=Arogya", updated);
    } catch (e) {
      console.warn("Failed to sync settings to backend API, local storage kept the changes:", e);
    }
    return updated;
  },
};
