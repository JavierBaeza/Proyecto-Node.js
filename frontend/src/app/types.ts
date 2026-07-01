export type Side = "CT" | "T" | "AM";
export type Rarity = "Consumer" | "Industrial" | "Mil-Spec" | "Restricted" | "Classified" | "Covert" | "Contraband";
export type View = "weapons" | "weapon-detail" | "categories" | "subcategories" | "skins";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

export interface Skin {
  id: string;
  weaponId: string;
  name: string;
  rarity: Rarity;
}

export interface Weapon {
  id: string;
  name: string;
  side: Side;
  price: number;
  damage: number;
  bullets: number;
  categoryId: string;
  subcategoryId: string;
  skins?: Skin[];
}

export interface ToastItem {
  id: string;
  type: "success" | "error";
  message: string;
}

export const RC: Record<Rarity, string> = {
  "Consumer":   "#B0C3D9",
  "Industrial": "#5E98D9",
  "Mil-Spec":   "#4B69FF",
  "Restricted": "#8847FF",
  "Classified": "#D32CE6",
  "Covert":     "#EB4B4B",
  "Contraband": "#E4AE39",
};

export const SC: Record<Side, { color: string; long: string }> = {
  CT: { color: "#4A90D9", long: "Counter-Terrorist" },
  T:  { color: "#E5B800", long: "Terrorist" },
  AM: { color: "#4CAF50", long: "Ambos bandos" },
};

export const RARITIES: Rarity[] = ["Consumer", "Industrial", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"];
export const SIDES: Side[] = ["CT", "T", "AM"];

let _n = 100;
export const uid = () => `u${_n++}`;

export const ic = "w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#4A90D9]/50 transition-colors";
