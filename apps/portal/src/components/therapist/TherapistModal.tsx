"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type TherapistModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

export function TherapistModal({ open, title, onClose, children, wide }: TherapistModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="th-modal-root" role="dialog" aria-modal="true" aria-labelledby="th-modal-title">
      <button type="button" className="th-modal-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className={`th-modal-panel ${wide ? "th-modal-panel--wide" : ""}`}>
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 id="th-modal-title" className="text-lg font-extrabold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
