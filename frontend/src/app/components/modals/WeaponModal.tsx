import React, { useState } from "react";
import { Weapon, Category, Subcategory, Side, SIDES, SC, ic } from "../../types";
import { Overlay, MHead, Fld, BtnRow } from "./ModalPrimitives";

interface WeaponModalProps {
  mode: "create" | "edit";
  w?: Weapon;
  cats: Category[];
  subs: Subcategory[];
  onSave: (d: Omit<Weapon, "id">, id?: string) => void;
  onClose: () => void;
}

export default function WeaponModal({
  mode,
  w,
  cats,
  subs,
  onSave,
  onClose,
}: WeaponModalProps) {
  const initCat = w?.categoryId || cats[0]?.id || "";
  const [f, setF] = useState({
    name: w?.name || "",
    side: (w?.side || "T") as Side,
    price: String(w?.price || ""),
    damage: String(w?.damage || ""),
    bullets: String(w?.bullets || ""),
    categoryId: initCat,
    subcategoryId: w?.subcategoryId || subs.find((s) => s.categoryId === initCat)?.id || "",
  });

  const filtSubs = subs.filter((s) => s.categoryId === f.categoryId);

  function onCatChange(cid: string) {
    const ns = subs.filter((s) => s.categoryId === cid);
    setF((p) => ({ ...p, categoryId: cid, subcategoryId: ns[0]?.id || "" }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        name: f.name,
        side: f.side,
        price: parseInt(f.price) || 0,
        damage: parseInt(f.damage) || 0,
        bullets: parseInt(f.bullets) || 0,
        categoryId: f.categoryId,
        subcategoryId: f.subcategoryId,
      },
      w?.id
    );
  }

  return (
    <Overlay onClose={onClose}>
      <MHead title={mode === "create" ? "Nueva Arma" : "Editar Arma"} onClose={onClose} />
      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <Fld label="Nombre">
          <input
            required
            className={ic}
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
            placeholder="AK-47, M4A4..."
          />
        </Fld>
        <Fld label="Bando">
          <select
            className={ic}
            value={f.side}
            onChange={(e) => setF((p) => ({ ...p, side: e.target.value as Side }))}
          >
            {SIDES.map((s) => (
              <option key={s} value={s}>
                {s} — {SC[s].long}
              </option>
            ))}
          </select>
        </Fld>
        <div className="grid grid-cols-3 gap-3">
          <Fld label="Precio ($)">
            <input
              type="number"
              required
              className={ic}
              value={f.price}
              onChange={(e) => setF((p) => ({ ...p, price: e.target.value }))}
              placeholder="2700"
            />
          </Fld>
          <Fld label="Daño">
            <input
              type="number"
              required
              className={ic}
              value={f.damage}
              onChange={(e) => setF((p) => ({ ...p, damage: e.target.value }))}
              placeholder="36"
            />
          </Fld>
          <Fld label="Balas">
            <input
              type="number"
              required
              className={ic}
              value={f.bullets}
              onChange={(e) => setF((p) => ({ ...p, bullets: e.target.value }))}
              placeholder="30"
            />
          </Fld>
        </div>
        <Fld label="Categoría">
          <select className={ic} value={f.categoryId} onChange={(e) => onCatChange(e.target.value)}>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Fld>
        <Fld label="Subcategoría">
          <select
            className={ic}
            value={f.subcategoryId}
            onChange={(e) => setF((p) => ({ ...p, subcategoryId: e.target.value }))}
          >
            <option value="">— Ninguna —</option>
            {filtSubs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Fld>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Crear Arma" : "Guardar Cambios"} />
      </form>
    </Overlay>
  );
}
