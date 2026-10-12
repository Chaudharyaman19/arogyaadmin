"use client";

import PeopleSectionManager from "@/components/speakers/PeopleSectionManager";
import { previousSpeakersApi } from "@/lib/speakersApi";

// Speakers Section → Add Previous Speakers: "Previous Edition Speakers" on the website
export default function PreviousSpeakersPage() {
  return (
    <PeopleSectionManager
      config={{
        title: "Previous Speakers",
        description: "Manage the \"Previous Edition Speakers\" row on the website (Speakers page and home page).",
        websitePath: "/speakers",
        api: previousSpeakersApi,
        noun: "Speaker",
        withTitle: true,
        headingHint: "Shown above the previous speakers row",
        namePlaceholder: "e.g. Dr. R. K. Maikhuri",
        websiteNote: <>Previous speakers scroll in a row, sorted by <b>Order</b> (lowest first).</>,
      }}
    />
  );
}
