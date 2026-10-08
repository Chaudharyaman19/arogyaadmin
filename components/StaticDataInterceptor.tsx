"use client";
import { useEffect } from "react";

export function StaticDataInterceptor() {
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any)._fetchMockedForStatic) {
      (window as any)._fetchMockedForStatic = true;
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const urlStr = typeof input === "string" ? input : (input instanceof Request ? input.url : "");
        
        // Intercept backend API calls and return mock success response
        if (
          urlStr.includes("/api/website") || 
          urlStr.includes("/api/uploads") || 
          urlStr.includes("googleapis.com/pagespeedonline") ||
          urlStr.includes("/settings?website")
        ) {
          console.log("[Static Mode] Intercepted fetch to:", urlStr);
          return new Response(JSON.stringify({ data: [], url: "" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        return originalFetch(input, init);
      };
    }
  }, []);
  return null;
}
