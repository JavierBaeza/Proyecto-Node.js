import React, { useState } from "react";
import { Crosshair, Pencil, Tag, Trash2 } from "lucide-react";
import { Skin, Weapon, Rarity, RC, RARITIES } from "../../types";

interface SkinsScreenProps {
  skns: Skin[];
  wpns: Weapon[];
  onEdit: (s: Skin) => void;
  onRarity: (s: Skin, r: Rarity) => void;
  onDel: (s: Skin) => void;
}

export default function SkinsScreen({
  skns,
  wpns,
  onEdit,
  onRarity,
  onDel,
}: SkinsScreenProps) {
  const [inlineEdit, setInline] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Skins</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{skns.length} skins en total</p>
        </div>
      </div>
      <div className="space-y-4">
        {wpns.map((wpn) => {
          const ws = skns.filter((s) => s.weaponId === wpn.id);
          if (!ws.length) return null;
          return (
            <div key={wpn.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.01]">
                <Crosshair size={13} className="text-[#DE6C2A]" />
                <span className="text-[13px] font-bold text-white">{wpn.name}</span>
                <span className="text-[11px] text-white/25">({ws.length} skin{ws.length !== 1 ? "s" : ""})</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {ws.map((sk) => {
                  const c = RC[sk.rarity];
                  const isInline = inlineEdit === sk.id;
                  return (
                    <div
                      key={sk.id}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.015] transition-colors group"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: c, boxShadow: `0 0 7px ${c}50` }}
                      />
                      <span className="text-[13px] font-medium text-white flex-1">{sk.name}</span>
                      <div className="flex items-center gap-2">
                        {isInline ? (
                          <select
                            autoFocus
                            defaultValue={sk.rarity}
                            onChange={(e) => {
                              onRarity(sk, e.target.value as Rarity);
                              setInline(null);
                            }}
                            onBlur={() => setInline(null)}
                            className="bg-[#131920] border border-white/[0.15] text-white text-[12px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#4A90D9]/50"
                          >
                            {RARITIES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                            style={{ color: c, borderColor: `${c}30`, background: `${c}10` }}
                          >
                            {sk.rarity}
                          </span>
                        )}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(sk)}
                            title="Editar skin"
                            className="p-1.5 rounded hover:bg-[#4A90D9]/20 text-white/35 hover:text-[#4A90D9] transition-all"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={() => setInline(isInline ? null : sk.id)}
                            title="Editar rareza"
                            className="p-1.5 rounded hover:bg-[#DE6C2A]/20 text-white/35 hover:text-[#DE6C2A] transition-all"
                          >
                            <Tag size={11} />
                          </button>
                          <button
                            onClick={() => onDel(sk)}
                            title="Eliminar"
                            className="p-1.5 rounded hover:bg-red-500/20 text-white/35 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
