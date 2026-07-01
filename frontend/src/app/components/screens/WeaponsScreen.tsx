import React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Weapon, Category, Subcategory, Skin, SC } from "../../types";

interface WeaponsScreenProps {
  wpns: Weapon[];
  cats: Category[];
  subs: Subcategory[];
  skns: Skin[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onEdit: (w: Weapon) => void;
  onDel: (w: Weapon) => void;
}

export default function WeaponsScreen({
  wpns,
  cats,
  subs,
  skns,
  onOpen,
  onCreate,
  onEdit,
  onDel,
}: WeaponsScreenProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Arsenal CS2</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{wpns.length} armas en la base de datos</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-[#DE6C2A] hover:bg-[#c85f25] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-[#DE6C2A]/25 active:scale-[0.97]"
        >
          <Plus size={14} />Nueva Arma
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {wpns.map((w) => (
          <WpnCard
            key={w.id}
            w={w}
            cat={cats.find((c) => c.id === w.categoryId)}
            sub={subs.find((s) => s.id === w.subcategoryId)}
            skinCount={skns.filter((s) => s.weaponId === w.id).length}
            onOpen={() => onOpen(w.id)}
            onEdit={() => onEdit(w)}
            onDel={() => onDel(w)}
          />
        ))}
      </div>
    </div>
  );
}

interface WpnCardProps {
  w: Weapon;
  cat?: Category;
  sub?: Subcategory;
  skinCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDel: () => void;
}

function WpnCard({ w, cat, sub, skinCount, onOpen, onEdit, onDel }: WpnCardProps) {
  const { color } = SC[w.side];
  return (
    <div
      onClick={onOpen}
      className="group relative bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-[#DE6C2A]/20 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded border"
          style={{ color, borderColor: `${color}35`, background: `${color}12` }}
        >
          {w.side}
        </span>
        <span className="text-[11px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
          {skinCount} skin{skinCount !== 1 ? "s" : ""}
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-white group-hover:text-[#DE6C2A] transition-colors mb-0.5">
        {w.name}
      </h3>
      <p className="text-[11px] text-white/30 mb-3">
        {cat?.name}
        {sub ? ` · ${sub.name}` : ""}
      </p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { l: "Precio", v: `$${w.price}` },
          { l: "Daño", v: w.damage },
          { l: "Balas", v: w.bullets },
        ].map((s) => (
          <div key={s.l} className="bg-white/[0.03] rounded-lg py-1.5 text-center border border-white/[0.04]">
            <div className="text-[12px] font-bold text-[#4A90D9]">{s.v}</div>
            <div className="text-[9px] text-white/25 mt-0.5 uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 pt-2 border-t border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-all border border-transparent hover:border-[#4A90D9]/15"
        >
          <Pencil size={10} />Editar
        </button>
        <button
          onClick={onDel}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/15"
        >
          <Trash2 size={10} />Eliminar
        </button>
      </div>
    </div>
  );
}
