import React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Category, Weapon } from "../../types";

interface CategoriesScreenProps {
  cats: Category[];
  wpns: Weapon[];
  onCreate: () => void;
  onEdit: (c: Category) => void;
  onDesc: (c: Category) => void;
  onDel: (c: Category) => void;
}

export default function CategoriesScreen({
  cats,
  wpns,
  onCreate,
  onEdit,
  onDesc,
  onDel,
}: CategoriesScreenProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Categorías</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{cats.length} categorías registradas</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-[#DE6C2A] hover:bg-[#c85f25] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-[#DE6C2A]/25 active:scale-[0.97]"
        >
          <Plus size={14} />Nueva Categoría
        </button>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] grid grid-cols-12 gap-4 text-[10px] uppercase tracking-widest text-white/25 font-semibold">
          <span className="col-span-3">Nombre</span>
          <span className="col-span-5">Descripción</span>
          <span className="col-span-2 text-center">Armas</span>
          <span className="col-span-2 text-right">Acciones</span>
        </div>
        {cats.map((c, i) => {
          const count = wpns.filter((w) => w.categoryId === c.id).length;
          return (
            <div
              key={c.id}
              className={`px-5 py-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.015] transition-colors ${
                i < cats.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="col-span-3 text-[13px] font-semibold text-white">{c.name}</div>
              <div className="col-span-5 text-[12px] text-white/40 truncate">{c.description}</div>
              <div className="col-span-2 flex justify-center">
                <span className="text-[11px] font-bold text-[#4A90D9] bg-[#4A90D9]/10 px-2.5 py-0.5 rounded-full border border-[#4A90D9]/15">
                  {count}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-0.5">
                <button
                  onClick={() => onEdit(c)}
                  title="Editar"
                  className="p-1.5 rounded-lg text-white/35 hover:text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDesc(c)}
                  title="Editar descripción"
                  className="p-1.5 rounded-lg text-[9px] font-bold text-white/35 hover:text-[#DE6C2A] hover:bg-[#DE6C2A]/10 transition-all"
                >
                  TXT
                </button>
                <button
                  onClick={() => onDel(c)}
                  title="Eliminar"
                  className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
