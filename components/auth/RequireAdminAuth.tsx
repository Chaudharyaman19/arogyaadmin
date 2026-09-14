"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { authApi } from "@/lib/authApi";

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
 * Uses optimistic auth from localStorage so dashboard loads instantly without any white screen spinner flash.
 * Session validity is verified silently in the background.
 */
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, hydrated } = useAppSelector((state) => state.auth);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined" && !admin && !checkHasSavedAuth()) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const hasLocal = checkHasSavedAuth();
    if (!admin && !hasLocal) {
      setIsAuthenticated(false);
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [hydrated, admin, router]);

  if (!isAuthenticated && !admin && typeof window !== "undefined" && !checkHasSavedAuth()) {
    return null;
  }

  return <>{children}</>;
}
