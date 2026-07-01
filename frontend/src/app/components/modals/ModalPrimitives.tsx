import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0F141A] border border-white/[0.1] rounded-2xl shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function MHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
      <h2 className="text-[14px] font-bold text-white">{title}</h2>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-all"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export function BtnRow({
  onClose,
  submitLabel,
  submitColor = "orange",
}: {
  onClose: () => void;
  submitLabel: string;
  submitColor?: "orange" | "blue";
}) {
  const cls =
    submitColor === "blue"
      ? "bg-[#4A90D9] hover:bg-[#3d7dc0]"
      : "bg-[#DE6C2A] hover:bg-[#c85f25] hover:shadow-[#DE6C2A]/20";

  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 rounded-lg border border-white/[0.09] text-white/50 hover:text-white/75 hover:bg-white/[0.04] text-[13px] font-medium transition-all"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className={`flex-1 py-2.5 rounded-lg ${cls} text-white text-[13px] font-semibold transition-all hover:shadow-lg`}
      >
        {submitLabel}
      </button>
    </div>
  );
}
