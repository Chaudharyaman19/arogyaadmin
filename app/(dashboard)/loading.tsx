import React from "react";
import Spinner from "@/components/ui/Spinner";

export default function DashboardLoading() {
  return (
    <div className="flex h-full min-h-[calc(100vh-100px)] w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading module...</p>
      </div>
    </div>
  );
}
