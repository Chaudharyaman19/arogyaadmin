import { redirect } from "next/navigation";

// The testimonials section headings, stats and bands are edited in Pages & CMS → Home → Testimonials
export default function TestimonialSettingsPage() {
  redirect("/pages/home/edit");
}
