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

export const loginAdmin = (payload: any) => async (dispatch: any) => {
  let result: any;
  if (payload?.totpCode) {
    result = {
      user: defaultAdminUser,
      admin: defaultAdminUser,
      requiresTwoFactor: false,
      twoFactorSetupRequired: false,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };
    dispatch(setCredentials({
      admin: defaultAdminUser,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    }));
  } else {
    result = {
      user: defaultAdminUser,
      admin: defaultAdminUser,
      requiresTwoFactor: true,
      tempToken: "mock-2fa-temp-token",
      twoFactorSetupRequired: false,
      accessToken: "",
      refreshToken: "",
    };
  }

  const promise: any = Promise.resolve(result);
  promise.unwrap = async () => result;
  return promise;
};

export const verifyTwoFactor = (payload: any) => async (dispatch: any) => {
  const result = {
    user: defaultAdminUser,
    admin: defaultAdminUser,
    requiresTwoFactor: false,
    twoFactorSetupRequired: false,
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };
  dispatch(setCredentials({
    admin: defaultAdminUser,
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  }));

  const promise: any = Promise.resolve(result);
  promise.unwrap = async () => result;
  return promise;
};

export const updateAdmin = (payload: Partial<AdminUser>) => ({
  type: "auth/updateAdmin",
  payload,
});
