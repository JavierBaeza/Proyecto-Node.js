import React, { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Weapon, Category, Subcategory, Skin, SC, RC, ic } from "../../types";

interface WeaponDetailProps {
  w: Weapon;
  cats: Category[];
  subs: Subcategory[];
  skns: Skin[];
  onBack: () => void;
  onEdit: () => void;
  onUpdPrice: (p: number) => void;
  onUpdBullets: (b: number) => void;
  onAddSkin: () => void;
  onEditSkin: (s: Skin) => void;
  onDelSkin: (s: Skin) => void;
}

export default function WeaponDetail({
  w,
  cats,
  subs,
  skns,
  onBack,
  onEdit,
  onUpdPrice,
  onUpdBullets,
  onAddSkin,
  onEditSkin,
  onDelSkin,
}: WeaponDetailProps) {
  const [price, setPrice] = useState(String(w.price));
  const [bullets, setBullets] = useState(String(w.bullets));

  useEffect(() => setPrice(String(w.price)), [w.price]);
  useEffect(() => setBullets(String(w.bullets)), [w.bullets]);

  const cat = cats.find((c) => c.id === w.categoryId);
  const sub = subs.find((s) => s.id === w.subcategoryId);
  const { color, long } = SC[w.side];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-white/35 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} />Arsenal
        </button>
        <span className="text-white/15">/</span>
        <span className="text-[13px] text-white/60 font-medium">{w.name}</span>
        <div className="flex-1" />
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-white/60 hover:text-white/85 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all"
        >
          <Pencil size={13} />Editar Arma
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/[0.025] border border-white/[0.08] rounded-xl p-5">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white">{w.name}</h1>
              <span
                className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-md border"
                style={{ color, borderColor: `${color}35`, background: `${color}12` }}
              >
                {w.side} — {long}
              </span>
            </div>
            <div className="space-y-0 mb-5">
              {[
                { l: "Categoría", v: cat?.name || "—" },
                { l: "Subcategoría", v: sub?.name || "—" },
                { l: "Daño base", v: w.damage },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0"
                >
                  <span className="text-[11px] text-white/35 uppercase tracking-wider">{s.l}</span>
                  <span className="text-[13px] font-semibold text-white">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/35 uppercase tracking-widest block mb-1.5">
                  Precio ($)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${ic} flex-1`}
                  />
                  <button
                    onClick={() => onUpdPrice(parseInt(price) || w.price)}
                    className="px-3 py-2 rounded-lg bg-[#DE6C2A]/15 hover:bg-[#DE6C2A]/25 border border-[#DE6C2A]/25 text-[#DE6C2A] text-[11px] font-semibold transition-all whitespace-nowrap"
                  >
                    Actualizar Precio
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/35 uppercase tracking-widest block mb-1.5">
                  Balas en cargador
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={bullets}
                    onChange={(e) => setBullets(e.target.value)}
                    className={`${ic} flex-1`}
                  />
                  <button
                    onClick={() => onUpdBullets(parseInt(bullets) || w.bullets)}
                    className="px-3 py-2 rounded-lg bg-[#4A90D9]/15 hover:bg-[#4A90D9]/25 border border-[#4A90D9]/25 text-[#4A90D9] text-[11px] font-semibold transition-all whitespace-nowrap"
                  >
                    Actualizar Cargador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skins */}
        <div className="lg:col-span-3">
          <div className="bg-white/[0.025] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-bold text-white">Skins</h2>
                <p className="text-[12px] text-white/30 mt-0.5">
                  {skns.length} skin{skns.length !== 1 ? "s" : ""} para {w.name}
                </p>
              </div>
              <button
                onClick={onAddSkin}
                className="flex items-center gap-1.5 bg-[#DE6C2A]/12 hover:bg-[#DE6C2A]/22 border border-[#DE6C2A]/22 text-[#DE6C2A] px-3 py-2 rounded-lg text-[12px] font-semibold transition-all"
              >
                <Plus size={12} />Añadir Skin
              </button>
            </div>
            {skns.length === 0 ? (
              <div className="py-10 text-center text-white/25 text-[13px]">
                No hay skins para esta arma aún
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skns.map((sk) => (
                  <SkinRow
                    key={sk.id}
                    sk={sk}
                    onEdit={() => onEditSkin(sk)}
                    onDel={() => onDelSkin(sk)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkinRowProps {
  sk: Skin;
  onEdit: () => void;
  onDel: () => void;
}

function SkinRow({ sk, onEdit, onDel }: SkinRowProps) {
  const c = RC[sk.rarity];
  return (
    <div className="group flex items-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.06] hover:border-white/[0.12] rounded-lg px-3 py-2.5 transition-all">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: c, boxShadow: `0 0 6px ${c}55` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate">{sk.name}</p>
        <p className="text-[10px] mt-0.5" style={{ color: c }}>
          {sk.rarity}
        </p>
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-[#4A90D9]/20 text-white/35 hover:text-[#4A90D9] transition-all"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={onDel}
          className="p-1.5 rounded hover:bg-red-500/20 text-white/35 hover:text-red-400 transition-all"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
