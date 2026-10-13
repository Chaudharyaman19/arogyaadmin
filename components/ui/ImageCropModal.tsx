"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop as CropIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface ImageCropModalProps {
  /** Local (blob:) URL of the image to crop; the modal is open while this is set. */
  src: string | null;
  /** MIME type of the source image — JPEGs stay JPEG, everything else is saved as PNG. */
  mimeType?: string;
  busy?: boolean;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  /** When given, shows a button to keep the image as it is. */
  onUseOriginal?: () => void;
}

const FULL_CROP: Crop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
// Cropped logos are capped so they stay well under the 2 MB upload limit
const MAX_OUTPUT_SIDE = 1200;

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "Square", value: 1 },
  { label: "4 : 3", value: 4 / 3 },
  { label: "16 : 9", value: 16 / 9 },
];

export default function ImageCropModal({ src, mimeType, busy, onCancel, onCropped, onUseOriginal }: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>(FULL_CROP);
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  useEffect(() => {
    setCrop(FULL_CROP);
    setAspect(undefined);
  }, [src]);

  const handleAspect = (value: number | undefined) => {
    setAspect(value);
    const img = imgRef.current;
    if (!img) return;
    setCrop(
      value
        ? centerCrop(makeAspectCrop({ unit: "%", width: 90 }, value, img.width, img.height), img.width, img.height)
        : FULL_CROP
    );
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !crop.width || !crop.height) return;

    // crop is kept in % of the image, so it maps straight onto the full-resolution pixels
    const sx = (crop.x / 100) * img.naturalWidth;
    const sy = (crop.y / 100) * img.naturalHeight;
    const sw = (crop.width / 100) * img.naturalWidth;
    const sh = (crop.height / 100) * img.naturalHeight;
    const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(sw, sh));

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isJpeg = mimeType === "image/jpeg";
    if (isJpeg) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => blob && onCropped(blob), isJpeg ? "image/jpeg" : "image/png", 0.92);
  };

  return (
    <Modal
      isOpen={!!src}
      onClose={onCancel}
      title="Crop Logo"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
            style={{
              background: "#fff1f2",
              borderRadius: "4px",
              boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
            }}
          >
            Cancel
          </button>
          {onUseOriginal && (
            <button
              type="button"
              onClick={onUseOriginal}
              disabled={busy}
              className="inline-flex h-[32px] items-center gap-1.5 border border-[#cbd5e1] bg-[#f8fafc] px-[14px] text-[12px] font-semibold text-[#334155] transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50"
              style={{ borderRadius: "4px" }}
            >
              Use Original
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              background: "#16a34a",
              borderRadius: "4px",
              boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
            }}
          >
            <CropIcon className="h-3 w-3" />
            {busy ? "Uploading..." : "Crop & Upload"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#34425e]">Shape:</span>
          {ASPECTS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleAspect(option.value)}
              className={`h-[26px] rounded-[4px] border px-[10px] text-[11px] font-semibold transition ${
                aspect === option.value
                  ? "border-[#075b33] bg-[#075b33] text-white"
                  : "border-[#cbd5e1] bg-white text-[#334155] hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Checkerboard so transparent logos stay visible */}
        <div
          className="flex items-center justify-center border border-[#e2e6ea] p-2"
          style={{
            backgroundColor: "#ffffff",
            backgroundImage:
              "linear-gradient(45deg, #eef0f2 25%, transparent 25%), linear-gradient(-45deg, #eef0f2 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eef0f2 75%), linear-gradient(-45deg, transparent 75%, #eef0f2 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
          }}
        >
          {src && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={aspect}
              keepSelection
              ruleOfThirds
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={src} alt="Logo to crop" style={{ maxHeight: "52vh", maxWidth: "100%" }} />
            </ReactCrop>
          )}
        </div>

        <p className="text-[10.5px] font-medium text-[#64748b]">
          Drag the corners or edges to select the part of the logo to keep, then click Crop &amp; Upload.
        </p>
      </div>
    </Modal>
  );
}
