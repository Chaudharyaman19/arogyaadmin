"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminUser, defaultAdminUser } from "./slices/authSlice";
import { HomeHero } from "./slices/home/homeHeroSlice";

export interface RootState {
  auth: {
    admin: AdminUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    hydrated: boolean;
  };
  homeHero: {
    data: HomeHero[];
    loading: boolean;
    error: string | null;
  };
}

const initialRootState: RootState = {
  auth: {
    admin: null,
    accessToken: null,
    refreshToken: null,
    hydrated: false,
  },
  homeHero: {
    data: [],
    loading: false,
    error: null,
  },
};

const StoreContext = createContext<{
  state: RootState;
  dispatch: (action: any) => any;
}>({
  state: initialRootState,
  dispatch: () => {},
});

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RootState>(initialRootState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ms_admin_auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.admin && parsed?.accessToken) {
            setState((prev) => ({
              ...prev,
              auth: {
                admin: parsed.admin,
                accessToken: parsed.accessToken,
                refreshToken: parsed.refreshToken || "mock-refresh-token",
                hydrated: true,
              },
            }));
            return;
          }
        }
      } catch {}
    }
    setState((prev) => ({
      ...prev,
      auth: { ...prev.auth, hydrated: true },
    }));
  }, []);

  const dispatch = (action: any) => {
    if (typeof action === "function") {
      const res = action(dispatch, () => state);
      if (res && typeof res.then === "function") {
        (res as any).unwrap = async () => {
          const val = await res;
          if (val && typeof val.unwrap === "function") {
            return val.unwrap();
          }
          return val;
        };
        return res;
      }
      return res;
    }
    if (action?.type === "auth/logout") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ms_admin_auth");
      }
      setState((prev) => ({
        ...prev,
        auth: { ...prev.auth, admin: null, accessToken: null, refreshToken: null },
      }));
    } else if (action?.type === "auth/setCredentials" || action?.type === "auth/updateAdmin") {
      if (action.payload) {
        const newAdmin = action.payload.admin || action.payload.user || state.auth.admin;
        const newAccessToken = action.payload.accessToken || state.auth.accessToken || "mock-access-token";
        const newRefreshToken = action.payload.refreshToken || state.auth.refreshToken || "mock-refresh-token";
        
        if (typeof window !== "undefined" && newAdmin && newAccessToken) {
          localStorage.setItem("ms_admin_auth", JSON.stringify({
            admin: newAdmin,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          }));
        }
        
        setState((prev) => ({
          ...prev,
          auth: {
            ...prev.auth,
            admin: newAdmin,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            hydrated: true,
          },
        }));
      }
    } else if (action?.type === "homeHero/setHomeHeros") {
      setState((prev) => ({
        ...prev,
        homeHero: { ...prev.homeHero, data: action.payload || [] },
      }));
    }
    return action;
  };

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  return useContext(StoreContext);
}
