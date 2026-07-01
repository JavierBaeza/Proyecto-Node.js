import React, { useState } from "react";
import { Plus, Pencil, Trash2, Layers, ChevronUp, ChevronDown } from "lucide-react";
import { Category, Subcategory, Weapon } from "../../types";

interface SubcatsScreenProps {
  cats: Category[];
  subs: Subcategory[];
  wpns: Weapon[];
  onCreate: () => void;
  onEdit: (s: Subcategory) => void;
  onDel: (s: Subcategory) => void;
}

export default function SubcatsScreen({
  cats,
  subs,
  wpns,
  onCreate,
  onEdit,
  onDel,
}: SubcatsScreenProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Subcategorías</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{subs.length} subcategorías registradas</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-[#DE6C2A] hover:bg-[#c85f25] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-[#DE6C2A]/25 active:scale-[0.97]"
        >
          <Plus size={14} />Nueva Subcategoría
        </button>
      </div>
      <div className="space-y-4">
        {cats.map((cat) => {
          const catSubs = subs.filter((s) => s.categoryId === cat.id);
          if (!catSubs.length) return null;
          return (
            <div key={cat.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.01]">
                <Layers size={13} className="text-[#DE6C2A]" />
                <span className="text-[13px] font-bold text-white">{cat.name}</span>
                <span className="text-[11px] text-white/25 ml-0.5">({catSubs.length})</span>
              </div>
              {catSubs.map((sub, i) => {
                const subWpns = wpns.filter((w) => w.subcategoryId === sub.id);
                const isExp = expanded.has(sub.id);
                return (
                  <div key={sub.id} className={i < catSubs.length - 1 ? "border-b border-white/[0.04]" : ""}>
                    <div className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.015] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-white">{sub.name}</span>
                          {subWpns.length > 0 && (
                            <button
                              onClick={() => toggle(sub.id)}
                              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/55 transition-colors"
                            >
                              <span className="text-[#4A90D9] font-bold">{subWpns.length}</span>
                              <span>arma{subWpns.length !== 1 ? "s" : ""}</span>
                              {isExp ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          )}
                        </div>
                        {sub.description && (
                          <p className="text-[11px] text-white/30 mt-0.5 truncate">{sub.description}</p>
                        )}
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => onEdit(sub)}
                          className="p-1.5 rounded-lg text-white/35 hover:text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => onDel(sub)}
                          className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {isExp && subWpns.length > 0 && (
                      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                        {subWpns.map((w) => (
                          <span
                            key={w.id}
                            className="text-[11px] bg-white/[0.04] border border-white/[0.07] text-white/45 px-2.5 py-1 rounded-full"
                          >
                            {w.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
