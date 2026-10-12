import { LandingSectionContent } from "../landingContent";

export const blogSidebarSection: LandingSectionContent = {
  key: "blog-sidebar",
  name: "Blog Sidebar",
  enabled: true,
  newsletterTitle: "Stay in the loop!",
  newsletterDescription:
    "Subscribe to our newsletter and get the latest updates, stories and announcements.",
  newsletterPlaceholder: "Enter your email address",
  newsletterButton: "SUBSCRIBE",
  categoriesTitle: "Categories",
  categoriesViewAll: "VIEW ALL",
  popularTitle: "Popular Posts",
  eventsTitle: "Upcoming Events",
  eventsViewAll: "VIEW ALL EVENTS",
  items: [
    { name: "All Updates", countText: "24" },
    { name: "News & Announcements", countText: "12" },
    { name: "Conference Highlights", countText: "09" },
    { name: "Research & Innovations", countText: "15" },
    { name: "Health & Wellness", countText: "11" },
    { name: "Events & Highlights", countText: "10" },
    { name: "Sustainability", countText: "09" },
    { name: "Partner Corner", countText: "05" },
  ],
  popularPosts: [
    {
      title: "Arogya Sanghosthi 2025: Key Takeaways",
      date: "28 Apr 2026",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&q=80",
    },
    {
      title: "Sustainable Health for Future Generations",
      date: "20 Apr 2026",
      image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=150&q=80",
    },
    {
      title: "Integrating Tradition, Advancing Tomorrow",
      date: "18 Apr 2026",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=150&q=80",
    },
    {
      title: "Nutrition & Lifestyle: Small Changes, Big Impact",
      date: "15 Apr 2026",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&q=80",
    },
    {
      title: "The Role of Ayurveda in Modern Healthcare",
      date: "10 Apr 2026",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&q=80",
    },
  ],
  events: [
    {
      date: "21",
      month: "AUG",
      title: "Pre-Conference Workshop",
      location: "Pragati Maidan, New Delhi",
      time: "09:00 AM - 05:00 PM",
    },
    {
      date: "22",
      month: "AUG",
      title: "Arogya Sanghosthi Day 1",
      location: "Pragati Maidan, New Delhi",
      time: "09:00 AM - 06:00 PM",
    },
    {
      date: "23",
      month: "AUG",
      title: "Arogya Sanghosthi Day 2",
      location: "Pragati Maidan, New Delhi",
      time: "09:00 AM - 06:00 PM",
    },
  ],
};
