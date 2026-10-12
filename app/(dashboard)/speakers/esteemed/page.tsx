"use client";

import PeopleSectionManager from "@/components/speakers/PeopleSectionManager";
import { esteemedSpeakersApi } from "@/lib/speakersApi";

// Speakers Section → Add Speakers: "Our Esteemed Speakers" on the website Speakers page
export default function EsteemedSpeakersPage() {
  return (
    <PeopleSectionManager
      config={{
        title: "Esteemed Speakers",
        description: "Manage the \"Our Esteemed Speakers\" section of the website Speakers page.",
        websitePath: "/speakers",
        api: esteemedSpeakersApi,
        noun: "Speaker",
        withTitle: true,
        headingHint: "Shown above the speaker cards",
        namePlaceholder: "e.g. Dr. Vandana Shiva",
        websiteNote: (
          <>Speakers show in two scrolling rows, sorted by <b>Order</b> (lowest first). The first half goes in the top row, the rest in the bottom row. The Title / Topic shows in the tag at the bottom of each card.</>
        ),
      }}
    />
  );
}
