"use client";

import PeopleSectionManager from "@/components/speakers/PeopleSectionManager";
import { organisingCommitteeApi } from "@/lib/speakersApi";

// Speakers Section → Organising Committee: "Organising Committee" on the website
export default function OrganisingCommitteePage() {
  return (
    <PeopleSectionManager
      config={{
        title: "Organising Committee",
        description: "Manage the \"Organising Committee\" section on the website Delegate Registration page.",
        websitePath: "/delegate-registration",
        api: organisingCommitteeApi,
        noun: "Member",
        headingHint: "Shown above the committee members",
        namePlaceholder: "e.g. Dr. B. R. Sharma",
        websiteNote: <>Shown on the <b>Delegate Registration</b> page, sorted by <b>Order</b> (lowest first).</>,
      }}
    />
  );
}
