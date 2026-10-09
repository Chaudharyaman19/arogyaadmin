"use client";

import React, { type ReactNode } from "react";
import { ChevronDown, FileText } from "lucide-react";

/* =========================================================
   FIELD LABEL
========================================================= */

export function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="
        mb-[5px]
        block
        cursor-default
        text-[11px]
        font-semibold
        leading-[14px]
        text-black
      "
    >
      {children}

      {required && (
        <span className="ml-[3px] text-red-500">
          *
        </span>
      )}
    </label>
  );
}

/* =========================================================
   TEXT INPUT
========================================================= */

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength = 120,
  hideLimit = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hideLimit?: boolean;
}) {
  const currentLength = (value || "").length;
  const maxAllowed = hideLimit ? 5000 : Math.max(currentLength, maxLength);
  const isAtLimit = !hideLimit && currentLength >= maxAllowed;

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        maxLength={maxAllowed}
        placeholder={placeholder}
        onChange={(event) => {
          if (event.target.value.length <= maxAllowed) {
            onChange(event.target.value);
          }
        }}
        className={`
          h-[35px]
          w-full
          cursor-default
          bg-white
          rounded-none
          shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
          pl-[10px]
          ${hideLimit ? "pr-[10px]" : "pr-[62px]"}
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          placeholder:text-[10.5px]
          placeholder:text-[#9aa0aa]
          focus:border-[#8fa98e]
        `}
      />
      {!hideLimit && (
        <span
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded ${isAtLimit
              ? "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
              : "bg-[#f1f5f9] text-[#64748b]"
            }`}
        >
          {currentLength}/{maxAllowed}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

export function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string, value: string }[] | string[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="
          h-[35px]
          w-full
          cursor-pointer
          appearance-none
          bg-white
          rounded-none
          shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
          pl-[10px]
          pr-[28px]
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          focus:border-[#8fa98e]
        "
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#64748b]" />
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

export function SectionTitle({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-[8px]">
      <div
        className="
          grid
          h-[24px]
          w-[24px]
          shrink-0
          place-items-center
          rounded-[5px]
          bg-[#ecf5eb]
          text-[#2f7950]
        "
      >
        <FileText
          className="h-[13px] w-[13px]"
          strokeWidth={1.8}
        />
      </div>

      <h2
        className="
          text-[13px]
          font-bold
          text-[#293681]
        "
      >
        {number}. {title}
      </h2>
    </div>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

export function ToolbarButton({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        grid
        h-[30px]
        min-w-[30px]
        place-items-center
        rounded-[4px]
        px-[5px]
        transition

        ${active
          ? "bg-[#edf5ec] text-[#166b40]"
          : "text-[#435065] hover:bg-[#f5f6f3]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (
    value: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`
        relative
        h-[20px]
        w-[38px]
        shrink-0
        rounded-full
        transition-colors
        duration-200
        cursor-pointer
        ${checked
          ? "bg-[#16a34a]"
          : "bg-[#dc2626]"
        }
      `}
    >
      <span
        className={`
          absolute
          top-[3px]
          h-[14px]
          w-[14px]
          rounded-full
          bg-white
          shadow-sm
          transition-all
          duration-200
          ${checked
            ? "left-[21px]"
            : "left-[3px]"
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   EDITOR TOOLBAR (MATCHING AddSeo)
========================================================= */

export function EditorToolbar({
  targetRef,
  onCommand,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  onCommand: (command: string, value?: string | null) => void;
}) {
  return (
    <div className="border-b-2 border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      <button
        type="button"
        onClick={() => onCommand("bold")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => onCommand("italic")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 italic shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => onCommand("underline")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 underline shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Underline"
      >
        U
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => onCommand("justifyLeft")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Left"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => onCommand("justifyCenter")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Center"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => onCommand("justifyRight")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Right"
      >
        ≡
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => onCommand("insertUnorderedList")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => onCommand("insertOrderedList")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Numbered List"
      >
        1. List
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <select
        onChange={(e) => onCommand("formatBlock", e.target.value)}
        className="px-2 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 focus:outline-none"
        defaultValue=""
      >
        <option value="">Normal</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
      </select>
      <button
        type="button"
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) onCommand("createLink", url);
        }}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Insert Link"
      >
        🔗
      </button>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
  maxLength = 450,
  noLimit = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  maxLength?: number;
  noLimit?: boolean;
}) {
  const currentLength = (value || "").length;
  const maxAllowed = noLimit ? 10000 : Math.max(currentLength, maxLength);
  const isAtLimit = !noLimit && currentLength >= maxAllowed;

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        maxLength={noLimit ? undefined : maxAllowed}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => {
          if (noLimit || event.target.value.length <= maxAllowed) {
            onChange(event.target.value);
          }
        }}
        className={`w-full cursor-text resize-y bg-white rounded-none shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)] px-[10px] py-[8px] text-[11px] font-medium text-[#414b5e] outline-none placeholder:text-[10.5px] placeholder:text-[#9aa0aa] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(143,169,142,1)] ${mono ? "font-mono text-[10px]" : ""}`}
      />
      {!noLimit && (
        <span
          className={`absolute right-2 bottom-2.5 pointer-events-none px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded ${isAtLimit
              ? "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
              : "bg-[#f1f5f9] text-[#64748b]"
            }`}
        >
          {currentLength}/{maxAllowed}
        </span>
      )}
    </div>
  );
}
