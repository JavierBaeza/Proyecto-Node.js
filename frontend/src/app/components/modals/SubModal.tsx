import React, { useState } from "react";
import { Subcategory, Category, ic } from "../../types";
import { Overlay, MHead, Fld, BtnRow } from "./ModalPrimitives";

interface SubModalProps {
  mode: "create" | "edit";
  s?: Subcategory;
  cats: Category[];
  onSave: (d: Omit<Subcategory, "id">, id?: string) => void;
  onClose: () => void;
}

export default function SubModal({ mode, s, cats, onSave, onClose }: SubModalProps) {
  const [f, setF] = useState({
    categoryId: s?.categoryId || cats[0]?.id || "",
    name: s?.name || "",
    description: s?.description || "",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(f, s?.id);
  }

  return (
    <Overlay onClose={onClose}>
      <MHead title={mode === "create" ? "Nueva Subcategoría" : "Editar Subcategoría"} onClose={onClose} />
      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <Fld label="Categoría padre">
          <select
            className={ic}
            value={f.categoryId}
            onChange={(e) => setF((p) => ({ ...p, categoryId: e.target.value }))}
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Fld>
        <Fld label="Nombre">
          <input
            required
            className={ic}
            value={f.name}
            onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
            placeholder="Asalto, Sniper..."
          />
        </Fld>
        <Fld label="Descripción (opcional)">
          <textarea
            rows={3}
            className={`${ic} resize-none`}
            value={f.description}
            onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descripción opcional..."
          />
        </Fld>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Crear Subcategoría" : "Guardar Cambios"} />
      </form>
    </Overlay>
  );
}
