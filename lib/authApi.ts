import { api } from "@/lib/api";
import type { AdminUser, AuthTokens } from "@/store/slices/authSlice";

export type LoginResult = {
  user: AdminUser;
  twoFactorSetupRequired: boolean;
  requiresTwoFactor?: boolean;
  tempToken?: string;
} & AuthTokens;

const defaultMockAdmin: AdminUser = {
  id: "admin_101",
  name: "Admin User",
  email: "admin@arogya.namogange.org",
  phone: "+91 9876543210",
  userType: "INTERNAL",
  roleSlug: "SUPER_ADMIN",
  permissions: ["*"],
};

export const authApi = {
  login: async (identifier: string, password: string, totpCode?: string): Promise<LoginResult> => {
    const res = await api.post<any>("/auth/login", { email: identifier, password, totpCode });

    if (res && res.requiresTwoFactor) {
      return {
        user: defaultMockAdmin,
        requiresTwoFactor: true,
        tempToken: res.tempToken,
        twoFactorSetupRequired: false,
        accessToken: "",
        refreshToken: "",
      };
    }

    if (res && res.accessToken && res.admin) {
      return {
        user: {
          id: res.admin.id || res.admin._id,
          name: res.admin.name,
          email: res.admin.email,
          phone: res.admin.phone || "",
          avatarUrl: res.admin.avatarUrl || undefined,
          userType: "INTERNAL",
          roleSlug: res.admin.role === "superadmin" ? "SUPER_ADMIN" : "EXPO_ADMIN",
          permissions: ["*"],
        },
        requiresTwoFactor: false,
        twoFactorSetupRequired: res.twoFactorSetupRequired || false,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken || "",
      };
    }

    throw new Error(res?.message || "Invalid email, staff ID, or password");
  },

  verifyTwoFactor: async (code: string, tempToken?: string) => {
    const res = await api.post<any>("/auth/verify-2fa", { token: code, tempToken });
    return res;
  },

  logout: async (refreshToken: string) => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {}
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post("/auth/change-password", { currentPassword, newPassword });
    return { success: true };
  },

  setupTwoFactor: async () => {
    const res = await api.get<any>("/auth/setup-2fa");
    if (res && (res.secret || res.manualKey)) {
      return {
        secret: res.secret || res.manualKey,
        provisioningUri: res.provisioningUri || res.otpauthUrl || `otpauth://totp/ArogyaSangoshthi:${res.secret}?secret=${res.secret}&issuer=ArogyaSangoshthi`,
        qrCodeUrl: res.qrCode,
      };
    }
    throw new Error("Failed to load 2FA setup details");
  },

  confirmTwoFactor: async (code: string) => {
    const res = await api.post<any>("/auth/confirm-2fa", { token: code });
    return { backupCodes: (res?.backupCodes ?? []) as string[] };
  },

  getMe: async () => {
    const res = await api.get<any>("/auth/me");
    if (!res?.user) throw new Error("Could not load your session.");
    return {
      userId: res.user.id || res.user._id,
      name: res.user.name,
      email: res.user.email,
      phone: res.user.phone,
      avatarUrl: res.user.avatarUrl || undefined,
      userType: "INTERNAL",
      roleSlug: res.user.role === "superadmin" ? "SUPER_ADMIN" : "EXPO_ADMIN",
      permissions: ["*"],
      // Staff who still have to link Microsoft Authenticator go back to the setup screen.
      // The seeded super admin has 2FA off, so this stays false for it.
      twoFactorPending: Boolean(res.user.twoFactorPending),
    };
  },

  forgotPassword: async (email: string) => {
    return await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await api.post("/auth/reset-password", { token, newPassword });
  },
};
