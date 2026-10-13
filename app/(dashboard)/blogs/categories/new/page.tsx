import { redirect } from "next/navigation";

// Categories are added from the "Add New Category" button on the Manage Categories page.
export default function NewBlogCategoryPage() {
  redirect("/blogs/categories");
}
