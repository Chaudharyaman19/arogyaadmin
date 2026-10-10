import { redirect } from "next/navigation";

// Testimonials are added from the Testimonials page form (saved to backend-arogya)
export default function NewTestimonialPage() {
  redirect("/testimonials?add=1");
}
