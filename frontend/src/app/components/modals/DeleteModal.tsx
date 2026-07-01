import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({ name, onConfirm, onClose }: DeleteModalProps) {
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
      <div className="relative z-10 w-full max-w-sm bg-[#0F141A] border border-white/[0.1] rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/12 border border-red-500/22 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h2 className="text-[15px] font-bold text-white mb-2">Confirmar eliminación</h2>
        <p className="text-[13px] text-white/45 mb-6 leading-relaxed">
          ¿Eliminar <strong className="text-white/80">"{name}"</strong>?
          <br />
          Esta acción no puede deshacerse.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/[0.09] text-white/50 hover:text-white/75 hover:bg-white/[0.04] text-[13px] font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red-500/85 hover:bg-red-500 text-white text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-red-500/20"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
