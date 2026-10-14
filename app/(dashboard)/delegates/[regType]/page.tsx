import { redirect } from "next/navigation";

// /delegates/single → /delegates/single/all
export default async function DelegatesTypeIndex({ params }: { params: Promise<{ regType: string }> }) {
  const { regType } = await params;
  redirect(`/delegates/${regType === "group" ? "group" : "single"}/all`);
}
