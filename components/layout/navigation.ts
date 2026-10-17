import {
  Activity,
  BarChart3,
  BellRing,
  BookOpenText,
  Bot,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Clapperboard,
  DatabaseBackup,
  FileCode,
  FileSearch,
  FileText,
  GalleryHorizontalEnd,
  Globe,
  Mic,
  ImageIcon,
  Award,
  UsersRound,
  Video,
  Gauge,
  Handshake,
  History,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  ListTree,
  LockKeyhole,
  Mail,
  MessageSquare,
  Route,
  SearchCheck,
  Settings,
  Settings2,
  ShieldCheck,
  Star,
  Tags,
  Ticket,
  TicketPercent,
  UserCog,
  Users,
  type LucideIcon,
  MessageSquareText,
  CalendarDays,
  PieChart,
  UserRound,
  Scale,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
  /** Turns the item into a dropdown of these pages */
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main Navigation",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "General Enquiries", href: "/general-enquiries", icon: Mail },
      { label: "Communication / Follow-ups", href: "/communication", icon: MessageSquare, badge: "NEW" },
    ],
  },
  {
    title: "Engagement & Leads",
    items: [
      { label: "Engagement & Leads", href: "/engagement-leads", icon: Users, badge: "48" },
      { label: "Contact Enquiry", href: "/contact-enquiry", icon: MessageSquareText },
      { label: "Delegates Overview", href: "/delegates-overview", icon: PieChart },
      {
        label: "Single Registration",
        icon: UserRound,
        children: [
          { label: "All Days", href: "/delegates/single/all", icon: CalendarDays },
          { label: "Day 1", href: "/delegates/single/day-1", icon: CalendarDays },
          { label: "Day 2", href: "/delegates/single/day-2", icon: CalendarDays },
          { label: "Day 3", href: "/delegates/single/day-3", icon: CalendarDays },
        ],
      },
      {
        label: "Group Registration",
        icon: UsersRound,
        children: [
          { label: "All Days", href: "/delegates/group/all", icon: CalendarDays },
          { label: "Day 1", href: "/delegates/group/day-1", icon: CalendarDays },
          { label: "Day 2", href: "/delegates/group/day-2", icon: CalendarDays },
          { label: "Day 3", href: "/delegates/group/day-3", icon: CalendarDays },
        ],
      },
      { label: "Forms & Submissions", href: "/forms-submissions", icon: Mail, badge: "125" },
      { label: "Help Requests", href: "/requests", icon: ClipboardList, badge: "210" },
      { label: "Partners & CSR Enquiries", href: "/enquiries?category=csr", icon: Handshake, badge: "36" },
      { label: "Newsletter Subscribers", href: "/newsletter", icon: Mail, badge: "342" },
    ],
  },
  {
    title: "Content Management",
    items: [
      { label: "Pages & CMS", href: "/pages", icon: FileText },
      { label: "Services Management", href: "/services", icon: BriefcaseBusiness },
      { label: "Blog & Insights", href: "/blogs", icon: BookOpenText },
      { label: "Media Library", href: "/gallery", icon: GalleryHorizontalEnd },
      { label: "Video Highlights", href: "/video-highlights", icon: Video },
      { label: "Exhibitor List", href: "/exhibitor-list", icon: Building2 },
      { label: "Testimonials", href: "/testimonials", icon: MessageSquare },
      { label: "Video Testimonials", href: "/video-testimonials", icon: Clapperboard },
      { label: "Global Voices", href: "/global-voices", icon: Globe },
      {
        label: "Speakers Section",
        icon: Mic,
        children: [
          { label: "Add Bg Image", href: "/speakers/bg-image", icon: ImageIcon },
          { label: "Add Speakers", href: "/speakers/esteemed", icon: Mic },
          { label: "More Speakers", href: "/speakers/more", icon: Users },
          { label: "Add Previous Speakers", href: "/speakers/previous", icon: History },
          { label: "Eminent Speakers", href: "/speakers/eminent", icon: Award },
          { label: "Organising Committee", href: "/speakers/organising", icon: UsersRound },
        ],
      },
      { label: "FAQs", href: "/faqs", icon: MessageSquare },
      { label: "Legal Pages", href: "/legal-pages", icon: Scale },
      { label: "Navigation Menus", href: "/navigation-menus", icon: ListTree },
    ],
  },
  {
    title: "Careers & Applications",
    items: [
      { label: "Career Dashboard", href: "/career-dashboard", icon: LayoutGrid },
      { label: "Job Postings", href: "/job-postings", icon: Briefcase },
      { label: "Applications & AI Response", href: "/applications-ai-response", icon: Bot },
      { label: "↳ Submit Form", href: "/applications-ai-response?modal=submitform", icon: FileText },
      { label: "↳ Candidate Details", href: "/applications-ai-response?modal=candidatedetails", icon: FileText },
      { label: "↳ Forward to HR", href: "/applications-ai-response?modal=forwardtohr", icon: FileText },
      { label: "Career Settings", href: "/career-settings", icon: Settings2 },
    ],
  },
  {
    title: "SEO & Performance",
    items: [
      { label: "SEO Audit", href: "/seo", icon: SearchCheck, badge: "NEW" },
      { label: "Advanced SEO", href: "/advanced-seo", icon: FileCode, badge: "NEW" },
      { label: "Audited Pages", href: "/auditpage", icon: FileSearch },
      { label: "SEO Center", href: "/seo-center", icon: SearchCheck },
      { label: "Google Search Console", icon: BarChart3, disabled: true },
      { label: "Analytics Dashboard", icon: Gauge, disabled: true },
      { label: "Performance Center", icon: Activity, disabled: true },
      { label: "Site Health Monitor", icon: ShieldCheck, disabled: true },
      { label: "Schema Manager", icon: FileSearch, disabled: true },
      { label: "Redirects Manager", href: "/redirects", icon: Route },
      { label: "Internal Linking", icon: Link2, disabled: true },
    ],
  },
  {
    title: "Reputation Management",
    items: [
      { label: "Google Reviews", href: "/google-reviews", icon: Star, badge: "NEW" },
      { label: "Review Analytics", icon: BarChart3, disabled: true },
      { label: "Response Templates", icon: MessageSquare, disabled: true },
      { label: "Review Alerts", icon: BellRing, disabled: true },
      { label: "Reputation Settings", icon: Settings, disabled: true },
    ],
  },
  {
    title: "System & Security",
    items: [
      { label: "Users & Roles", href: "/roles", icon: Users },
      { label: "Staff Management", href: "/staff", icon: UserCog },
      { label: "Delegate Categories", href: "/delegate-categories", icon: Tags },
      { label: "Add Registration", href: "/add-registration", icon: ClipboardList },
      { label: "Delegate Passes", href: "/delegate-passes", icon: Ticket },
      { label: "Add Coupons", href: "/coupons", icon: TicketPercent },
      { label: "Security Center", href: "/system-services", icon: LockKeyhole },
      { label: "Backups & Restore", icon: DatabaseBackup, disabled: true },
      { label: "Audit Logs", href: "/audit-log", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
