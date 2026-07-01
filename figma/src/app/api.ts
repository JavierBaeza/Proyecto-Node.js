const BASE = '/api';

// --- Types ---
type Side = "CT" | "T" | "AM";
type Rarity = "Consumer" | "Industrial" | "Mil-Spec" | "Restricted" | "Classified" | "Covert" | "Contraband";

export interface Category { id: string; name: string; description: string; }
export interface Subcategory { id: string; categoryId: string; name: string; description: string; }
export interface Skin { id: string; weaponId: string; name: string; rarity: Rarity; }
export interface Weapon { id: string; name: string; side: Side; price: number; damage: number; bullets: number; categoryId: string; subcategoryId: string; skins?: Skin[] }

async function handleRes(res: Response) {
  if (!res.ok) {
    let msg = "Error en la petición";
    try {
      const err = await res.json();
      msg = err.error || err.errores?.join(', ') || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return res.json();
}

// --- ARMAS ---
export async function fetchArmas(): Promise<Weapon[]> {
  const data = await handleRes(await fetch(`${BASE}/armas`));
  return data.map((w: any) => ({
    id: String(w.id),
    name: w.nombre,
    side: w.bando,
    price: Number(w.precio),
    damage: w.dano_base,
    bullets: w.balas_cargador,
    categoryId: String(w.id_categoria),
    subcategoryId: w.id_subcategoria ? String(w.id_subcategoria) : "",
    skins: (w.skins || []).map((s: any) => ({
      id: String(s.id),
      weaponId: String(w.id),
      name: s.nombre_skin,
      rarity: s.rareza
    }))
  }));
}

export async function createArma(data: Partial<Weapon>): Promise<Weapon> {
  const payload = {
    id_categoria: Number(data.categoryId),
    id_subcategoria: data.subcategoryId ? Number(data.subcategoryId) : null,
    nombre: data.name,
    bando: data.side,
    precio: Number(data.price),
    dano_base: Number(data.damage),
    balas_cargador: Number(data.bullets)
  };
  const w = await handleRes(await fetch(`${BASE}/armas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return {
    id: String(w.id),
    name: w.nombre,
    side: w.bando,
    price: Number(w.precio),
    damage: w.dano_base,
    bullets: w.balas_cargador,
    categoryId: String(w.id_categoria),
    subcategoryId: w.id_subcategoria ? String(w.id_subcategoria) : ""
  };
}

export async function replaceArma(id: string, data: Partial<Weapon>): Promise<Weapon> {
  const payload = {
    id_categoria: Number(data.categoryId),
    id_subcategoria: data.subcategoryId ? Number(data.subcategoryId) : null,
    nombre: data.name,
    bando: data.side,
    precio: Number(data.price),
    dano_base: Number(data.damage),
    balas_cargador: Number(data.bullets)
  };
  const w = await handleRes(await fetch(`${BASE}/armas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return {
    id: String(w.id),
    name: w.nombre,
    side: w.bando,
    price: Number(w.precio),
    damage: w.dano_base,
    bullets: w.balas_cargador,
    categoryId: String(w.id_categoria),
    subcategoryId: w.id_subcategoria ? String(w.id_subcategoria) : ""
  };
}

export async function updatePrecio(id: string, price: number) {
  return handleRes(await fetch(`${BASE}/armas/${id}/precio`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ precio: Number(price) })
  }));
}

export async function updateCargador(id: string, bullets: number) {
  return handleRes(await fetch(`${BASE}/armas/${id}/cargador`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ balas_cargador: Number(bullets) })
  }));
}

export async function deleteArma(id: string) {
  return handleRes(await fetch(`${BASE}/armas/${id}`, { method: 'DELETE' }));
}

// --- CATEGORÍAS ---
export async function fetchCategorias(): Promise<Category[]> {
  const data = await handleRes(await fetch(`${BASE}/categorias`));
  return data.map((c: any) => ({
    id: String(c.id),
    name: c.nombre,
    description: c.descripcion || ""
  }));
}

export async function createCategoria(data: Partial<Category>): Promise<Category> {
  const payload = { nombre: data.name, descripcion: data.description };
  const c = await handleRes(await fetch(`${BASE}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return { id: String(c.id), name: c.nombre, description: c.descripcion || "" };
}

export async function replaceCategoria(id: string, data: Partial<Category>): Promise<Category> {
  const payload = { nombre: data.name, descripcion: data.description };
  const c = await handleRes(await fetch(`${BASE}/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return { id: String(c.id), name: c.nombre, description: c.descripcion || "" };
}

export async function updateDescripcion(id: string, description: string) {
  const c = await handleRes(await fetch(`${BASE}/categorias/${id}/descripcion`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion })
  }));
  return { id: String(c.id), name: c.nombre, description: c.descripcion || "" };
}

export async function deleteCategoria(id: string) {
  return handleRes(await fetch(`${BASE}/categorias/${id}`, { method: 'DELETE' }));
}

// --- SUBCATEGORÍAS ---
export async function fetchSubcategorias(): Promise<Subcategory[]> {
  const data = await handleRes(await fetch(`${BASE}/subcategorias/armas`));
  return data.map((s: any) => ({
    id: String(s.id),
    categoryId: String(s.id_categoria),
    name: s.nombre,
    description: s.descripcion || ""
  }));
}

export async function createSubcategoria(data: Partial<Subcategory>): Promise<Subcategory> {
  const payload = { id_categoria: Number(data.categoryId), nombre: data.name, descripcion: data.description || "" };
  const s = await handleRes(await fetch(`${BASE}/subcategorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return { id: String(s.id), categoryId: String(s.id_categoria), name: s.nombre, description: s.descripcion || "" };
}

export async function replaceSubcategoria(id: string, data: Partial<Subcategory>): Promise<Subcategory> {
  const payload = { id_categoria: Number(data.categoryId), nombre: data.name, descripcion: data.description || "" };
  const s = await handleRes(await fetch(`${BASE}/subcategorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return { id: String(s.id), categoryId: String(s.id_categoria), name: s.nombre, description: s.descripcion || "" };
}

export async function deleteSubcategoria(id: string) {
  return handleRes(await fetch(`${BASE}/subcategorias/${id}`, { method: 'DELETE' }));
}

// --- SKINS ---
export async function createSkin(weaponId: string, data: Partial<Skin>): Promise<Skin> {
  const payload = { nombre_skin: data.name, rareza: data.rarity };
  const sk = await handleRes(await fetch(`${BASE}/armas/${weaponId}/skins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return { id: String(sk.id), weaponId, name: sk.nombre_skin, rarity: sk.rareza };
}

export async function replaceSkin(id: string, data: Partial<Skin>): Promise<Skin> {
  const payload = { nombre_skin: data.name, rareza: data.rarity };
  const sk = await handleRes(await fetch(`${BASE}/skins/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
  return { id: String(sk.id), weaponId: String(sk.id_arma || data.weaponId), name: sk.nombre_skin, rarity: sk.rareza };
}

export async function updateRareza(id: string, rarity: string) {
  return handleRes(await fetch(`${BASE}/skins/${id}/rareza`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rareza: rarity })
  }));
}

export async function deleteSkin(id: string) {
  return handleRes(await fetch(`${BASE}/skins/${id}`, { method: 'DELETE' }));
}
