"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones } from "lucide-react";
import {
  NAV_SECTIONS,
  type NavItem,
} from "./navigation";

// Sparkles around the logo — same positions/timing as the website footer logo
const LOGO_SPARKLES: React.CSSProperties[] = [
  { top: "-10px", left: "10%", animationDelay: "0s" },
  { top: "20px", left: "-12px", animationDelay: "0.4s" },
  { top: "-12px", right: "15%", animationDelay: "0.8s" },
  { bottom: "8px", left: "5%", animationDelay: "0.2s" },
  { bottom: "-10px", right: "20%", animationDelay: "0.6s" },
  { top: "40%", right: "-14px", animationDelay: "0.3s" },
];

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  const [basePath] = href.split("?");
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(pathname, item.href);

    const content = (
      <>
        <span
          className="
            grid
            h-[21px]
            w-[21px]
            shrink-0
            place-items-center
          "
        >
          <Icon
            className="h-[15px] w-[15px]"
            strokeWidth={1.8}
          />
        </span>

        <span className="min-w-0 flex-1 truncate">
          {item.label}
        </span>

        {item.badge &&
          item.badge !== "NEW" && (
            <span
              className="
                flex
                h-[19px]
                min-w-[24px]
                shrink-0
                items-center
                justify-center
                rounded-[4px]
                bg-[#8B2626]
                px-[5px]
                text-[9px]
                font-bold
                leading-none
                text-white
                shadow-[0_2px_5px_rgba(0,0,0,0.25)]
              "
            >
              {item.badge}
            </span>
          )}

        {item.badge === "NEW" && (
          <span
            className="
              flex
              h-[19px]
              shrink-0
              items-center
              justify-center
              rounded-[6px]
              bg-[linear-gradient(180deg,#3AAA63_0%,#25844C_100%)]
              px-[7px]
              text-[8px]
              font-bold
              leading-none
              text-white
              shadow-[0_2px_5px_rgba(0,0,0,0.22)]
            "
          >
            NEW
          </span>
        )}
      </>
    );

    if (
      item.disabled ||
      !item.href
    ) {
      return (
        <div
          key={item.label}
          aria-disabled="true"
          title="This module is not available yet"
          className="
            flex
            h-[29px]
            cursor-not-allowed
            items-center
            gap-[6px]
            rounded-[6px]
            px-[9px]
            text-[12px]
            font-medium
            text-white/35
          "
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={onNavigate}
        className={`
          relative
          flex
          h-[31px]
          items-center
          gap-[6px]
          overflow-hidden
          rounded-[7px]
          px-[9px]
          text-[12px]
          font-medium
          transition-all
          duration-150

          ${active
            ? `
                bg-[linear-gradient(90deg,#8b5a2b_0%,#2e7d32_100%)]
                text-white
                shadow-[0_3px_10px_rgba(0,0,0,0.32)]
              `
            : `
                text-[#F2F5F7]
                hover:bg-white/[0.07]
                hover:text-white
              `
          }
        `}
      >
        {active && (
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent)]
            "
          />
        )}

        <span className="relative z-10 contents">
          {content}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className="
        relative
        flex
        h-full
        w-[240px]
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-[#0b4a30]
        bg-[#00291b]
        text-white
        shadow-[4px_0_18px_rgba(0,0,0,0.20)]
      "
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-cover
          bg-bottom
          bg-no-repeat
        "
        style={{
          backgroundImage:
            'url("/sidebar/sidebar-background.png")',
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          // The artwork is navy; shift it to the portal's dark green
          filter: "hue-rotate(-70deg) saturate(1.15)",
        }}
      />

      {/* LIGHT OVERLAY */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-[linear-gradient(
            180deg,
            rgba(0,41,27,0.06)_0%,
            rgba(0,41,27,0.04)_55%,
            rgba(0,41,27,0.02)_100%
          )]
        "
      />

      {/* LOGO AREA */}
      <div
        className="
          relative
          z-10
          shrink-0
          px-[14px]
          pt-[14px]
          pb-[12px]
          text-center
        "
      >
        <Link
          href="/"
          className="
            group
            relative
            flex
            h-[78px]
            items-center
            justify-center
            px-2
            py-1
          "
        >
          <span className="relative inline-flex h-full items-center">
            {LOGO_SPARKLES.map((style, i) => (
              <span key={i} aria-hidden="true" className="logo-sparkle" style={style}>
                ✦
              </span>
            ))}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1.webp"
              alt="Logo"
              className="
                h-full
                max-h-[70px]
                w-auto
                max-w-[196px]
                object-contain
                transition-transform
                duration-200
                group-hover:scale-[1.03]
              "
              style={{ filter: "drop-shadow(0 0 15px rgba(243,183,27,0.6))" }}
            />
          </span>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav
        className="
          relative
          z-10
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-[14px]
          pb-[6px]

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {NAV_SECTIONS.map(
          (
            section,
            index,
          ) => (
            <section
              key={section.title}
              className={`
                mb-[7px]
                ${index > 0
                  ? "border-t border-[#668196]/40 pt-[7px]"
                  : ""
                }
              `}
            >
              <div
                className="
                  mb-[4px]
                  flex
                  items-center
                  gap-[7px]
                  px-[5px]
                "
              >
                <h2
                  className="
                    shrink-0
                    text-[9.5px]
                    font-bold
                    uppercase
                    leading-[13px]
                    tracking-[0.035em]
                    text-[#d4a373]
                  "
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}
                >
                  {section.title}
                </h2>

                <span
                  className="
                    h-px
                    flex-1
                    bg-[#6b9a82]/25
                  "
                />
              </div>

              <div className="space-y-[1px]">
                {section.items.map(
                  renderItem,
                )}
              </div>
            </section>
          ),
        )}
      </nav>

      {/* HELP BOX */}
      <div
        className="
          relative
          z-10
          shrink-0
          px-[15px]
          pb-[13px]
          pt-[4px]
        "
      >
        <a
          href="mailto:info@arogyabharat.org"
          className="
            relative
            flex
            h-[46px]
            items-center
            gap-[9px]
            overflow-hidden
            rounded-[9px]
            border
            border-[#c4925a]/35
            bg-[linear-gradient(90deg,#5c3a1e_0%,#8b5a2b_55%,#6b4226_100%)]
            px-[13px]
            text-white
            shadow-[0_4px_14px_rgba(0,0,0,0.24)]
            transition
            hover:brightness-110
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]
            "
          />

          <Headphones
            className="
              relative
              z-10
              h-[22px]
              w-[22px]
              shrink-0
              text-white
            "
            strokeWidth={1.45}
          />

          <span className="relative z-10 min-w-0">
            <span
              className="
                block
                text-[11px]
                font-bold
                leading-[15px]
                text-white
              "
            >
              Need Help?
            </span>

            <span
              className="
                mt-[1px]
                block
                text-[9.5px]
                font-semibold
                leading-[13px]
                text-white
              "
            >
              Contact IT Support
            </span>
          </span>
        </a>
      </div>
    </aside>
  );
}