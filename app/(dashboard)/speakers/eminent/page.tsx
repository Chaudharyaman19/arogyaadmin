"use client";

import PeopleSectionManager from "@/components/speakers/PeopleSectionManager";
import { eminentSpeakersApi } from "@/lib/speakersApi";

// Speakers Section → Eminent Speakers: "Meet Our Eminent Speakers & Leaders" on the website
export default function EminentSpeakersPage() {
  return (
    <PeopleSectionManager
      config={{
        title: "Eminent Speakers",
        description: "Manage the \"Meet Our Eminent Speakers & Leaders\" section on the website Delegate Registration page.",
        websitePath: "/delegate-registration",
        api: eminentSpeakersApi,
        noun: "Speaker",
        headingHint: "Shown above the eminent speakers",
        namePlaceholder: "e.g. Dr. V. K. Paul",
        websiteNote: <>Shown on the <b>Delegate Registration</b> page, sorted by <b>Order</b> (lowest first).</>,
      }}
    />
  );
}
