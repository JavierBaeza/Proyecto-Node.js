import React, { useState } from "react";
import { Skin, Rarity, RC, RARITIES, ic } from "../../types";
import { Overlay, MHead, Fld, BtnRow } from "./ModalPrimitives";

interface SkinModalProps {
  mode: "create" | "edit";
  sk?: Skin;
  wid: string;
  onSave: (d: Omit<Skin, "id">, id?: string) => void;
  onClose: () => void;
}

export default function SkinModal({
  mode,
  sk,
  wid,
  onSave,
  onClose,
}: SkinModalProps) {
  const [name, setName] = useState(sk?.name || "");
  const [rarity, setRar] = useState<Rarity>(sk?.rarity || "Consumer");
  const c = RC[rarity];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name, rarity, weaponId: wid }, sk?.id);
  }

  return (
    <Overlay onClose={onClose}>
      <MHead title={mode === "create" ? "Añadir Skin" : "Editar Skin"} onClose={onClose} />
      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <Fld label="Nombre de la Skin">
          <input
            required
            className={ic}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dragon Lore, Asiimov..."
          />
        </Fld>
        <Fld label="Rareza">
          <select
            className={ic}
            value={rarity}
            onChange={(e) => setRar(e.target.value as Rarity)}
          >
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Fld>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all"
          style={{ borderColor: `${c}30`, background: `${c}0D` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
          <span className="text-[13px] font-semibold" style={{ color: c }}>
            {rarity}
          </span>
        </div>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Añadir Skin" : "Guardar Skin"} />
      </form>
    </Overlay>
  );
}
