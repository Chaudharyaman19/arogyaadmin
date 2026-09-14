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
    admin: defaultAdminUser,
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    hydrated: true,
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
      setState((prev) => ({
        ...prev,
        auth: { ...prev.auth, admin: null, accessToken: null, refreshToken: null },
      }));
    } else if (action?.type === "auth/setCredentials" || action?.type === "auth/updateAdmin") {
      if (action.payload) {
        setState((prev) => ({
          ...prev,
          auth: {
            ...prev.auth,
            ...(action.payload.admin || action.payload.user ? { admin: action.payload.admin || action.payload.user } : {}),
            ...(action.payload.accessToken ? { accessToken: action.payload.accessToken } : {}),
            ...(action.payload.refreshToken ? { refreshToken: action.payload.refreshToken } : {}),
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
