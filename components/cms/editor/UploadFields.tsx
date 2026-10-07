"use client";

import React, { useState } from "react";
import { ExternalLink, FileText, ImageIcon, RotateCcw, Trash2, Upload } from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { TextInput } from "./FormPrimitives";

/* =========================================================
   IMAGE UPLOADER HELPER (EDIT / UPLOAD / DELETE / PREVIEW)
========================================================= */

export function ImageUploadField({
  value,
  onChange,
  defaultValue,
}: {
  value: string;
  onChange: (url: string) => void;
  defaultValue?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/content");
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const handleReset = () => {
    if (defaultValue) {
      onChange(defaultValue);
    }
  };

  const isDifferentFromDefault = Boolean(defaultValue && value !== defaultValue);

  return (
    <div className="flex flex-col gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <TextInput
            value={value}
            onChange={onChange}
            placeholder="https://... image URL"
            hideLimit={true}
          />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#0f766e] bg-[#f0fdf4] px-2 py-1.5 text-[9px] font-bold text-[#0f766e] hover:bg-[#dcfce7] transition-colors shadow-2xs">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            title="Remove/Delete image"
            className="flex shrink-0 items-center gap-1 rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Delete Image
          </button>
        ) : null}
        {isDifferentFromDefault && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default original image"
            className="flex shrink-0 items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[9px] font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 text-amber-700" />
            Reset Image
          </button>
        )}
      </div>

      {value && typeof value === "string" ? (() => {
        const displayUrl = value.startsWith("http")
          ? value
          : value.startsWith("/")
            ? `http://localhost:4000${value}`
            : `http://localhost:4000/${value}`;

        return (
          <div className="flex items-center gap-3 bg-white p-1.5 rounded border border-[#e2e8f0]">
            <div className="relative h-[60px] w-[100px] shrink-0 overflow-hidden rounded border border-[#cbd5e1] bg-black/5 group">
              <img
                src={displayUrl}
                alt="Background Preview"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={handleRemove}
                title="Delete Image"
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-[#0f766e] bg-[#ccfbf1] px-1.5 py-0.5 rounded">
                  Active Image
                </span>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-0.5 text-[8.5px] font-medium text-[#2563eb] hover:underline"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  View Full
                </a>
                {isDifferentFromDefault && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[8.5px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer transition-colors ml-auto"
                    title="Reset to default image"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Reset to Default
                  </button>
                )}
              </div>
              <p className="text-[8.5px] text-[#64748b] truncate font-mono">
                {value}
              </p>
            </div>
          </div>
        );
      })() : (
        <div className="text-[9px] text-[#94a3b8] italic flex items-center justify-between gap-1 px-1">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-[#cbd5e1]" />
            No image set. Upload, paste a URL, or click Reset.
          </span>
          {isDifferentFromDefault && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[9px] font-bold text-amber-700 hover:underline cursor-pointer not-italic"
            >
              <RotateCcw className="h-3 w-3" />
              Restore Default Image
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PdfUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/brochures");
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload PDF", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const displayUrl = value
    ? value.startsWith("http")
      ? value
      : value.startsWith("/")
        ? `http://localhost:4000${value}`
        : `http://localhost:4000/${value}`
    : "";

  return (
    <div className="flex flex-col gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
      <div className="flex items-center gap-1.5">
        <TextInput
          value={value}
          onChange={onChange}
          placeholder="https://... or click Upload PDF"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#2563eb] bg-[#eff6ff] px-2.5 py-1.5 text-[9px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors shadow-2xs">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            title="Remove PDF"
            className="flex shrink-0 items-center gap-1 rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors shadow-2xs"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        ) : null}
      </div>

      {value && typeof value === "string" ? (
        <div className="flex items-center gap-3 bg-white p-2 rounded border border-[#e2e8f0]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-50 border border-red-200 text-red-600 font-bold text-[10px]">
            <FileText className="h-4 w-4 text-red-600" />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                Brochure PDF
              </span>
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 hover:underline"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                View / Test PDF
              </a>
            </div>
            <p className="text-[8.5px] text-[#64748b] truncate font-mono">
              {value}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-[9px] text-[#94a3b8] italic flex items-center gap-1 px-1">
          <FileText className="h-3 w-3 text-[#cbd5e1]" />
          No PDF file attached. Paste a file URL or click "Upload PDF".
        </div>
      )}
    </div>
  );
}

export function VideoUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/videos");
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload video", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const displayUrl = value
    ? value.startsWith("http")
      ? value
      : value.startsWith("/")
        ? `http://localhost:4000${value}`
        : `http://localhost:4000/${value}`
    : "";

  return (
    <div className="flex flex-col gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
      <div className="flex items-center gap-1.5">
        <TextInput
          value={value}
          onChange={onChange}
          placeholder="https://... video URL or upload"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#7c3aed] bg-[#f5f3ff] px-2.5 py-1.5 text-[9px] font-bold text-[#6d28d9] hover:bg-[#ede9fe] transition-colors shadow-2xs">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload Video"}
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            title="Remove Video"
            className="flex shrink-0 items-center gap-1 rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors shadow-2xs"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        ) : null}
      </div>
      {displayUrl && (
        <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-[#e2e8f0] text-[9.5px]">
          <span className="font-bold text-[#6d28d9] bg-[#ede9fe] px-1.5 py-0.5 rounded">Active Video</span>
          <a href={displayUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5 truncate font-mono">
            <ExternalLink className="h-3 w-3 inline" /> {value}
          </a>
        </div>
      )}
    </div>
  );
}
