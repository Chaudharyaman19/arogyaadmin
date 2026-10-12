import { redirect } from "next/navigation";

// Speakers Section has no page of its own — open its first list
export default function SpeakersSectionPage() {
  redirect("/speakers/esteemed");
}
