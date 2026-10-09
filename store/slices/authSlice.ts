import { authApi } from "@/lib/authApi";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  userType?: string;
  roleSlug?: string;
  permissions?: string[];
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
}

export const defaultAdminUser: AdminUser = {
  id: "admin_101",
  name: "Super Admin",
  email: "admin@bharatorganic.com",
  phone: "+91 9876543210",
  userType: "INTERNAL",
  roleSlug: "SUPER_ADMIN",
  permissions: ["*"],
  role: "superadmin"
};

export const setCredentials = (payload: { admin?: AdminUser; user?: AdminUser; accessToken?: string; refreshToken?: string; [key: string]: any }) => ({
  type: "auth/setCredentials",
  payload,
});

export const logout = () => ({
  type: "auth/logout",
});

// Thunks for StoreProvider's dispatch, which adds `.unwrap()` to the returned promise.

/** Step 1: password check against backend-arogya. Tokens are stored by the login page. */
export const loginAdmin = (payload: { email: string; password: string; totpCode?: string }) => async () =>
  authApi.login(payload.email, payload.password, payload.totpCode);

/** Step 2: Microsoft Authenticator code (or a backup code) for the pending sign-in. */
export const verifyTwoFactor = (payload: { totpCode: string; tempToken: string }) => async () =>
  authApi.verifyTwoFactor(payload.totpCode, payload.tempToken);

export const updateAdmin = (payload: Partial<AdminUser>) => ({
  type: "auth/updateAdmin",
  payload,
});
