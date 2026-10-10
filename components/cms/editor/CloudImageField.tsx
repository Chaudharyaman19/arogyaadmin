"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { FieldLabel, TextInput } from "./FormPrimitives";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   CLOUDINARY IMAGE FIELD — preview + "Upload to Cloudinary" + URL.
   `upload` is the section's backend upload call (it returns the
   Cloudinary URL), so every section keeps its own folder.
========================================================= */
export function CloudImageField({
  label,
  value,
  onChange,
  upload,
  required,
  hint,
  previewClass,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<{ url: string; fileSize: string }>;
  required?: boolean;
  hint: string;
  previewClass: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await upload(file);
      onChange(res.url);
      showSuccess(`Image uploaded to Cloudinary (${res.fileSize}).`);
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex gap-[10px]">
        <div
          className={`grid shrink-0 place-items-center overflow-hidden border border-dashed border-[#cbd5e1] bg-[#f8fafc] ${previewClass}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 text-[#94a3b8]" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <TextInput value={value} onChange={onChange} placeholder="https://res.cloudinary.com/..." maxLength={1000} hideLimit />
          <div className="flex items-center gap-[8px]">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
              {uploading ? "Uploading..." : "Upload to Cloudinary"}
            </button>
            <span className="truncate text-[10px] text-[#64748b]">{hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
