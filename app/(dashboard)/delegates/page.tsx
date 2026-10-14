import { redirect } from "next/navigation";

// /delegates → Engagement & Leads → Delegates Overview
export default function DelegatesIndex() {
  redirect("/delegates-overview");
}
