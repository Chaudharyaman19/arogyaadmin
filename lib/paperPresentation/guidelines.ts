import { LandingSectionContent } from "../landingContent";

export const guidelinesSection: LandingSectionContent = {
  key: "paper-guidelines",
  name: "Guidelines & Submission",
  enabled: true,
  guidelinesHeading: "GUIDELINES FOR AUTHORS",
  submissionHeading: "SUBMISSION PROCESS",
  downloadLabel: "DOWNLOAD GUIDELINES",
  downloadHref: "",
  submitLabel: "SUBMIT ABSTRACT NOW",
  submitHref: "",
  items: [
    { text: "Original, unpublished work is invited." },
    { text: "Abstract length: Up to 300 words." },
    { text: "Full paper (if selected): 2500 - 4000 words." },
    { text: "Format: MS Word, A4 size, 1.5 line spacing." },
    { text: "Referencing: Vancouver Style." },
    { text: "Presentations: Oral / Poster." },
    { text: "Best Paper Awards for outstanding presentations." },
  ],
  steps: [
    { num: "1", title: "STEP 1", desc: "Submit your abstract through the online portal." },
    { num: "2", title: "STEP 2", desc: "Receive acceptance notification via email." },
    { num: "3", title: "STEP 3", desc: "Submit your full paper (if selected)." },
    { num: "4", title: "STEP 4", desc: "Present your paper at Arogya Sanghosthi 2026." },
  ],
};
