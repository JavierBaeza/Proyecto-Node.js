import React, { useState } from "react";
import { Category, ic } from "../../types";
import { Overlay, MHead, Fld, BtnRow } from "./ModalPrimitives";

interface CatModalProps {
  mode: "create" | "edit" | "desc";
  c?: Category;
  onSave: (d: Omit<Category, "id">, id?: string) => void;
  onClose: () => void;
}

export default function CatModal({ mode, c, onSave, onClose }: CatModalProps) {
  const [name, setName] = useState(c?.name || "");
  const [desc, setDesc] = useState(c?.description || "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name: mode === "desc" ? c?.name || "" : name, description: desc }, c?.id);
  }

  if (mode === "desc") {
    return (
      <Overlay onClose={onClose}>
        <MHead title="Editar Descripción" onClose={onClose} />
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <Fld label="Descripción">
            <textarea
              required
              rows={4}
              className={`${ic} resize-none`}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </Fld>
          <BtnRow onClose={onClose} submitLabel="Actualizar" submitColor="blue" />
        </form>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <MHead title={mode === "create" ? "Nueva Categoría" : "Editar Categoría"} onClose={onClose} />
      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <Fld label="Nombre">
          <input
            required
            className={ic}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rifles, Pistolas..."
          />
        </Fld>
        <Fld label="Descripción">
          <textarea
            rows={3}
            className={`${ic} resize-none`}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción de la categoría..."
          />
        </Fld>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Crear Categoría" : "Guardar Cambios"} />
      </form>
    </Overlay>
  );
}
