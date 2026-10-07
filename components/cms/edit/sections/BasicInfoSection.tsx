"use client";

/* =========================================================
   BASIC INFORMATION
   Extracted from pages/[id]/edit/page.tsx
========================================================= */

import {
  Check,
} from "lucide-react";
import {
  FieldLabel,
  SectionTitle,
  SelectField,
  TextInput,
} from "@/components/cms/editor/FormPrimitives";
import { defaultLandingSections } from "@/lib/landingContent";
import { defaultAboutSections } from "@/lib/aboutContent";
import { defaultAdvisorySections, defaultNominateAdvisorySections } from "@/lib/advisoryContent";
import { defaultBlogSections } from "@/lib/blogContent";
import { defaultParticipateAsExhibitorSections } from "@/lib/participateAsExhibitorContent";
import { defaultExhibitionCategoriesSections } from "@/lib/exhibitionCategoriesContent";
import {
  defaultBookAStandSections,
  defaultVisitorRegistrationSections,
  defaultDelegateRegistrationSections,
  defaultBuyerRegistrationSections,
  defaultTermsAndConditionsSections,
  defaultPrivacyPolicySections,
  defaultRefundPolicySections,
} from "@/lib/registrationPagesContent";
import { defaultWhyVisitSections } from "@/lib/whyVisitContent";
import { defaultWhyExhibitSections } from "@/lib/whyExhibitContent";
import {
  defaultMsmeSections,
  defaultMsmeEligibilityCheckSections,
  defaultMsmeApplySections,
  defaultMsmeParticipationDetailsSections,
  defaultMsmeApplyPaymentSections,
  defaultExhibitorLoginSections,
  defaultBuyerLoginSections,
  defaultDelegatesLoginSections,
  defaultUserLoginSections,
} from "@/lib/msmeContent";
import { defaultExhibitorsSections } from "@/lib/exhibitorsContent";
import { defaultBuyerSellerMeetSections } from "@/lib/buyerSellerMeetContent";
import { defaultGallerySections } from "@/lib/galleryContent";
import { defaultAwardsSections, defaultAwardsNominationSections } from "@/lib/awardsContent";
import { defaultContactSections } from "@/lib/contactContent";
import { defaultSponsorshipSections, defaultEPromotionSections, defaultPartnershipPageSections, defaultSubPartnershipSections } from "@/lib/opportunityContent";
import { defaultSupportServicesSections } from "@/lib/extraPagesContent";
import { PUBLIC_SITE_URL } from "@/lib/cmsPages";
import type { Status, Visibility } from "../types";
import { useCmsEdit } from "../CmsEditContext";

export function BasicInfoSection() {
  const { form, page, pages, setSectionsDraft, updateField } = useCmsEdit();

  return (
    <>
    {/* =================================================
        BASIC INFORMATION
    ================================================= */}

    <section
      className="
        shrink-0
        border
        border-[#dedfdb]
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
        bg-white
        px-[16px]
        py-[11px]
      "
    >
      <SectionTitle
        number={1}
        title="Basic Information"
      />

      <div
        className="
          mt-[9px]
          grid
          grid-cols-[1.12fr_1fr_.63fr]
          gap-x-[20px]
          gap-y-[7px]
        "
      >
        <div>
          <FieldLabel required>
            Page Title
          </FieldLabel>

          <TextInput
            value={
              form.pageTitle
            }
            onChange={(
              value,
            ) =>
              updateField(
                "pageTitle",
                value,
              )
            }
          />

          <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
            {
              form
                .pageTitle
                .length
            }{" "}
            / 100
          </p>
        </div>

        <div>
          <FieldLabel required>
            URL Slug
          </FieldLabel>

          <div
            className="
              flex
              h-[35px]
              overflow-hidden
              rounded-none
              shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
              bg-white
            "
          >
            <div
              className="
                flex
                shrink-0
                items-center
                border-r
                border-[#e5e6e2]
                bg-[#fafaf8]
                px-[9px]
                text-[9.5px]
                font-medium
                text-[#5f6a7c]
              "
            >
              {PUBLIC_SITE_URL}/
            </div>

            <input
              value={
                form.slug
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "slug",
                  event
                    .target
                    .value,
                )
              }
              placeholder="enter-page-slug"
              className="
                min-w-0
                flex-1
                cursor-default
                px-[9px]
                text-[10.5px]
                font-medium
                text-[#414b5e]
                outline-none
                placeholder:text-[#9aa0aa]
              "
            />
          </div>

          <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
            {
              form.slug
                .length
            }{" "}
            / 80
          </p>
        </div>

        <div>
          <FieldLabel>
            Select Template
          </FieldLabel>

          <SelectField
            value={
              form.template
            }
            onChange={(value) => {
              updateField("template", value);
              if (value === "Nominate Advisory Board Member" || value === "Nominate Advisory Board") {
                setSectionsDraft(defaultNominateAdvisorySections.map((s) => ({ ...s })));
              } else if (value === "Support Services Helpdesk") {
                setSectionsDraft(defaultSupportServicesSections.map((s) => ({ ...s })));
              } else if (value === "PMS Eligibility Check Calculator") {
                setSectionsDraft(defaultMsmeEligibilityCheckSections.map((s) => ({ ...s })));
              } else if (value === "Apply for PMS Support Stepper" || value === "Apply for PMS Support") {
                setSectionsDraft(defaultMsmeApplySections.map((s) => ({ ...s })));
              } else if (value === "PMS Participation Details") {
                setSectionsDraft(defaultMsmeParticipationDetailsSections.map((s) => ({ ...s })));
              } else if (value === "PMS Payment Details") {
                setSectionsDraft(defaultMsmeApplyPaymentSections.map((s) => ({ ...s })));
              } else if (value === "Exhibitor Login Portal" || value === "Exhibitor Login") {
                setSectionsDraft(defaultExhibitorLoginSections.map((s) => ({ ...s })));
              } else if (value === "Buyer Login Portal" || value === "Buyer Login") {
                setSectionsDraft(defaultBuyerLoginSections.map((s) => ({ ...s })));
              } else if (value === "Delegates Login Portal" || value === "Delegates Login") {
                setSectionsDraft(defaultDelegatesLoginSections.map((s) => ({ ...s })));
              } else if (value === "User Login Portal" || value === "User Login") {
                setSectionsDraft(defaultUserLoginSections.map((s) => ({ ...s })));
              } else if (value.includes("Partner") && value !== "Partnership / Collaboration") {
                setSectionsDraft(defaultSubPartnershipSections.map((s) => ({ ...s })));
              } else if (value === "Awards Nomination Form") {
                setSectionsDraft(defaultAwardsNominationSections.map((s) => ({ ...s })));
              } else if (value === "About Expo" || value === "About Page" || value === "About Us") {
                setSectionsDraft(defaultAboutSections.map((s) => ({ ...s })));
              } else if (value === "Advisory Board Members" || value === "Advisory Board") {
                setSectionsDraft(defaultAdvisorySections.map((s) => ({ ...s })));
              } else if (value === "Blogs & News") {
                setSectionsDraft(defaultBlogSections.map((s) => ({ ...s })));
              } else if (value === "Participate as Exhibitor") {
                setSectionsDraft(defaultParticipateAsExhibitorSections.map((s) => ({ ...s })));
              } else if (value === "Exhibition Categories") {
                setSectionsDraft(defaultExhibitionCategoriesSections.map((s) => ({ ...s })));
              } else if (value === "BOOK A STALL" || value === "Book a Stall" || value === "Book a Stand") {
                setSectionsDraft(defaultBookAStandSections.map((s) => ({ ...s })));
              } else if (value === "REGISTER AS VISITOR" || value === "Register as Visitor" || value === "Visitor Registration") {
                setSectionsDraft(defaultVisitorRegistrationSections.map((s) => ({ ...s })));
              } else if (value === "DELEGATE REGISTRATION" || value === "Delegate Registration") {
                setSectionsDraft(defaultDelegateRegistrationSections.map((s) => ({ ...s })));
              } else if (value === "REGISTER AS BUYER" || value === "Register as Buyer" || value === "Buyer Registration") {
                setSectionsDraft(defaultBuyerRegistrationSections.map((s) => ({ ...s })));
              } else if (value === "Terms & Conditions") {
                setSectionsDraft(defaultTermsAndConditionsSections.map((s) => ({ ...s })));
              } else if (value === "Privacy Policy") {
                setSectionsDraft(defaultPrivacyPolicySections.map((s) => ({ ...s })));
              } else if (value === "Refund Policy") {
                setSectionsDraft(defaultRefundPolicySections.map((s) => ({ ...s })));
              } else if (value.includes("Why Visit")) {
                setSectionsDraft(defaultWhyVisitSections.map((s) => ({ ...s })));
              } else if (value.includes("Why Exhibit")) {
                setSectionsDraft(defaultWhyExhibitSections.map((s) => ({ ...s })));
              } else if (value === "MSME PMS Scheme") {
                setSectionsDraft(defaultMsmeSections.map((s) => ({ ...s })));
              } else if (value.includes("Exhibitor")) {
                setSectionsDraft(defaultExhibitorsSections.map((s) => ({ ...s })));
              } else if (value === "Buyer-Seller Meet") {
                setSectionsDraft(defaultBuyerSellerMeetSections.map((s) => ({ ...s })));
              } else if (value === "Glimpses & Gallery" || value === "Gallery") {
                setSectionsDraft(defaultGallerySections.map((s) => ({ ...s })));
              } else if (value.includes("Awards")) {
                setSectionsDraft(defaultAwardsSections.map((s) => ({ ...s })));
              } else if (value.includes("SPONSORSHIP") || value.includes("Sponsorship")) {
                setSectionsDraft(defaultSponsorshipSections.map((s) => ({ ...s })));
              } else if (value.includes("E-Promotion")) {
                setSectionsDraft(defaultEPromotionSections.map((s) => ({ ...s })));
              } else if (value === "Partnership / Collaboration" || value === "Partnership") {
                setSectionsDraft(defaultPartnershipPageSections.map((s) => ({ ...s })));
              } else if (value.includes("Contact") || value.includes("EXPO ADVISOR")) {
                setSectionsDraft(defaultContactSections.map((s) => ({ ...s })));
              } else if (value === "Homepage" || value === "Landing Page" || value === "Home") {
                setSectionsDraft(defaultLandingSections.map((s) => ({ ...s })));
              }
            }}
            options={[
              "Blank Template",
            ]}
          />
        </div>

        <div>
          <FieldLabel>
            Page Parent
          </FieldLabel>

          <SelectField
            value={
              form.parent
            }
            onChange={(
              value,
            ) => {
              updateField("parent", value);
              if (value && value !== "— No Parent (Top Level) —") {
                const targetName = value.trim();
                if (targetName.includes("Nominate Advisory")) {
                  setSectionsDraft(defaultNominateAdvisorySections.map((s) => ({ ...s })));
                } else if (targetName.includes("Support Services")) {
                  setSectionsDraft(defaultSupportServicesSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Eligibility Check")) {
                  setSectionsDraft(defaultMsmeEligibilityCheckSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Apply for PMS Support") || targetName.includes("Apply for PMS")) {
                  setSectionsDraft(defaultMsmeApplySections.map((s) => ({ ...s })));
                } else if (targetName.includes("Participation Details")) {
                  setSectionsDraft(defaultMsmeParticipationDetailsSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Payment Details")) {
                  setSectionsDraft(defaultMsmeApplyPaymentSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Exhibitor Login")) {
                  setSectionsDraft(defaultExhibitorLoginSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Buyer Login")) {
                  setSectionsDraft(defaultBuyerLoginSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Delegates Login")) {
                  setSectionsDraft(defaultDelegatesLoginSections.map((s) => ({ ...s })));
                } else if (targetName.includes("User Login")) {
                  setSectionsDraft(defaultUserLoginSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Partner") && !targetName.includes("Collaboration")) {
                  setSectionsDraft(defaultSubPartnershipSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Awards Nomination")) {
                  setSectionsDraft(defaultAwardsNominationSections.map((s) => ({ ...s })));
                } else if (targetName.includes("About")) {
                  setSectionsDraft(defaultAboutSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Advisory")) {
                  setSectionsDraft(defaultAdvisorySections.map((s) => ({ ...s })));
                } else if (targetName.includes("Blog")) {
                  setSectionsDraft(defaultBlogSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Participate as Exhibitor")) {
                  setSectionsDraft(defaultParticipateAsExhibitorSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Exhibition Categories")) {
                  setSectionsDraft(defaultExhibitionCategoriesSections.map((s) => ({ ...s })));
                } else if (targetName.includes("BOOK A STALL") || targetName.includes("Book a Stand") || targetName.includes("Book a Stall")) {
                  setSectionsDraft(defaultBookAStandSections.map((s) => ({ ...s })));
                } else if (targetName.includes("VISITOR")) {
                  setSectionsDraft(defaultVisitorRegistrationSections.map((s) => ({ ...s })));
                } else if (targetName.includes("DELEGATE")) {
                  setSectionsDraft(defaultDelegateRegistrationSections.map((s) => ({ ...s })));
                } else if (targetName.includes("BUYER") && !targetName.includes("Buyer-Seller")) {
                  setSectionsDraft(defaultBuyerRegistrationSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Terms")) {
                  setSectionsDraft(defaultTermsAndConditionsSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Privacy")) {
                  setSectionsDraft(defaultPrivacyPolicySections.map((s) => ({ ...s })));
                } else if (targetName.includes("Refund")) {
                  setSectionsDraft(defaultRefundPolicySections.map((s) => ({ ...s })));
                } else if (targetName.includes("Why Visit")) {
                  setSectionsDraft(defaultWhyVisitSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Why Exhibit")) {
                  setSectionsDraft(defaultWhyExhibitSections.map((s) => ({ ...s })));
                } else if (targetName.includes("MSME")) {
                  setSectionsDraft(defaultMsmeSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Exhibitor")) {
                  setSectionsDraft(defaultExhibitorsSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Buyer-Seller")) {
                  setSectionsDraft(defaultBuyerSellerMeetSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Gallery")) {
                  setSectionsDraft(defaultGallerySections.map((s) => ({ ...s })));
                } else if (targetName.includes("Awards")) {
                  setSectionsDraft(defaultAwardsSections.map((s) => ({ ...s })));
                } else if (targetName.includes("SPONSORSHIP") || targetName.includes("Sponsorship")) {
                  setSectionsDraft(defaultSponsorshipSections.map((s) => ({ ...s })));
                } else if (targetName.includes("E-Promotion")) {
                  setSectionsDraft(defaultEPromotionSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Partnership")) {
                  setSectionsDraft(defaultPartnershipPageSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Contact") || targetName.includes("ADVISOR")) {
                  setSectionsDraft(defaultContactSections.map((s) => ({ ...s })));
                } else if (targetName.includes("Home")) {
                  setSectionsDraft(defaultLandingSections.map((s) => ({ ...s })));
                }
              }
            }}
            options={[
              "— No Parent (Top Level) —",
              ...pages.map((p) => p.title),
            ]}
          />

          <p className="mt-[2px] text-[9px] font-medium leading-[11px] text-red-500">
            Choose parent page
            (if any)
          </p>
        </div>

      </div>
    </section>
    </>
  );
}
