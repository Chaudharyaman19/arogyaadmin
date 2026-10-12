import { redirect } from "next/navigation";

// "Speakers List" moved into the Speakers Section dropdown → Add Speakers
export default function SpeakersListPage() {
  redirect("/speakers/esteemed");
}
