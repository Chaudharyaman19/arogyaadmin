"use client";

/* =========================================================
   Shared editing state for the CMS page editor.
   Every editor panel reads from this context instead of
   receiving a 30-item prop list.
========================================================= */

import { createContext, useContext, type ReactNode } from "react";

export type CmsEditContextValue = {
  router: any;
  page: any;
  pages: any[];
  form: any;
  sectionsDraft: Array<Record<string, any>>;
  openSectionIndices: Set<number>;
  saving: boolean;
  ogUploading: boolean;
  ogPreview: string;
  canonicalEditorRef: React.RefObject<HTMLDivElement | null>;
  execCommand: (command: string, value?: string) => void;
  handleCanonicalInput: () => void;
  handleCanonicalPaste: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  handleOgImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeOgImage: () => void;
  autoGenerateSeo: (envType: "local" | "live") => Promise<void>;
  toggleSectionAccordion: (index: number) => void;
  updateSectionField: (...args: any[]) => void;
  updateSectionItem: (...args: any[]) => void;
  addSectionItem: (...args: any[]) => void;
  removeSectionItem: (...args: any[]) => void;
  updateField: (field: string, value: any) => void;
  resetToWebsiteDefaults: () => void;
  savePage: () => Promise<void>;
  setSectionsDraft: React.Dispatch<React.SetStateAction<Array<Record<string, any>>>>;
  setOpenSectionIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
};

const CmsEditContext = createContext<CmsEditContextValue | null>(null);

export function useCmsEdit(): CmsEditContextValue {
  const ctx = useContext(CmsEditContext);
  if (!ctx) throw new Error("useCmsEdit must be used inside <CmsEditProvider>");
  return ctx;
}

export function CmsEditProvider({
  value,
  children,
}: {
  value: CmsEditContextValue;
  children: ReactNode;
}) {
  return <CmsEditContext.Provider value={value}>{children}</CmsEditContext.Provider>;
}
