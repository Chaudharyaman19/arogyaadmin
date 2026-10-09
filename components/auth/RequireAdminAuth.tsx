"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";

const AUTH_STORAGE_KEY = "ms_admin_auth";

// Check synchronously if localStorage already has a saved admin session
const checkHasSavedAuth = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken && parsed?.admin) {
        return true;
      }
    }
  } catch {}
  return false;
};

/**
 * Gate for the dashboard shell.
 *
 * The server can't see localStorage, so the server render and the first client
 * render must both output the same placeholder. Deciding auth during render
 * (server: "show dashboard", client: "show nothing") caused a hydration
 * mismatch: React 19 then left the server-rendered dashboard HTML orphaned in
 * <body>, and the login page rendered underneath it on the same scrollable page.
 */
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, hydrated } = useAppSelector((state) => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!admin && !checkHasSavedAuth()) {
      setIsAuthenticated(false);
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [hydrated, admin, router]);

  // Verify the saved session with the backend once it is shown. A revoked/expired
  // session signs out; an account without Microsoft Authenticator goes back to setup.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    authApi
      .getMe()
      .then((me) => {
        if (!cancelled && me.twoFactorPending) router.replace("/login");
      })
      .catch((err) => {
        if (cancelled || !(err instanceof ApiRequestError) || err.status !== 401) return;
        dispatch(logout());
        router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="h-screen bg-slate-50" />;
  }

  return <>{children}</>;
}
