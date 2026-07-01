import React, { useState, useEffect, useCallback } from "react";
import * as api from "./api";
import {
  Layers, Tag, Palette, Plus, Pencil, Trash2, X,
  ChevronRight, ChevronDown, ChevronUp, ArrowLeft,
  Crosshair, CheckCircle, XCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Side = "CT" | "T" | "AM";
type Rarity = "Consumer" | "Industrial" | "Mil-Spec" | "Restricted" | "Classified" | "Covert" | "Contraband";
type View = "weapons" | "weapon-detail" | "categories" | "subcategories" | "skins";
interface Category    { id: string; name: string; description: string; }
interface Subcategory { id: string; categoryId: string; name: string; description: string; }
interface Skin        { id: string; weaponId: string; name: string; rarity: Rarity; }
interface Weapon      { id: string; name: string; side: Side; price: number; damage: number; bullets: number; categoryId: string; subcategoryId: string; }
interface ToastItem   { id: string; type: "success" | "error"; message: string; }

// ─── Config ──────────────────────────────────────────────────────────────────
const RC: Record<Rarity, string> = {
  "Consumer":   "#B0C3D9",
  "Industrial": "#5E98D9",
  "Mil-Spec":   "#4B69FF",
  "Restricted": "#8847FF",
  "Classified": "#D32CE6",
  "Covert":     "#EB4B4B",
  "Contraband": "#E4AE39",
};
const SC: Record<Side, { color: string; long: string }> = {
  CT: { color: "#4A90D9", long: "Counter-Terrorist" },
  T:  { color: "#E5B800", long: "Terrorist" },
  AM: { color: "#4CAF50", long: "Ambos bandos" },
};
const RARITIES: Rarity[] = ["Consumer", "Industrial", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"];
const SIDES: Side[] = ["CT", "T", "AM"];

let _n = 100;
const uid = () => `u${_n++}`;

const ic = "w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#4A90D9]/50 transition-colors";

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cats,   setCats]   = useState<Category[]>([]);
  const [subs,   setSubs]   = useState<Subcategory[]>([]);
  const [wpns,   setWpns]   = useState<Weapon[]>([]);
  const [skns,   setSkns]   = useState<Skin[]>([]);
  const [view,   setView]   = useState<View>("weapons");
  const [wid,    setWid]    = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [wModal,  setWModal]  = useState<{ mode: "create" | "edit"; w?: Weapon } | null>(null);
  const [skModal, setSkModal] = useState<{ mode: "create" | "edit"; sk?: Skin; wid: string } | null>(null);
  const [cModal,  setCModal]  = useState<{ mode: "create" | "edit" | "desc"; c?: Category } | null>(null);
  const [sModal,  setSModal]  = useState<{ mode: "create" | "edit"; s?: Subcategory } | null>(null);
  const [delDlg,  setDelDlg]  = useState<{ type: string; id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [armas, categorias, subcategorias] = await Promise.all([
          api.fetchArmas(),
          api.fetchCategorias(),
          api.fetchSubcategorias(),
        ]);
        setCats(categorias);
        setSubs(subcategorias);
        setWpns(armas);
        const allSkins = armas.flatMap(a => a.skins || []);
        setSkns(allSkins);
      } catch (err: any) {
        addToast("error", err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addToast = useCallback((type: "success" | "error", msg: string) => {
    const id = uid();
    setToasts(p => [...p, { id, type, message: msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const dismissToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  async function saveWeapon(data: Omit<Weapon, "id">, id?: string) {
    try {
      if (id) {
        const updated = await api.replaceArma(id, data);
        setWpns(p => p.map(w => w.id === id ? updated : w));
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createArma(data);
        setWpns(p => [...p, created]);
        addToast("success", `"${data.name}" creada`);
      }
      setWModal(null);
    } catch (err: any) { addToast("error", err.message); }
  }
  async function delWeapon(id: string) {
    try {
      await api.deleteArma(id);
      setSkns(p => p.filter(s => s.weaponId !== id));
      setWpns(p => p.filter(w => w.id !== id));
      if (wid === id) { setWid(null); setView("weapons"); }
      addToast("success", "Arma eliminada"); setDelDlg(null);
    } catch (err: any) { addToast("error", err.message); }
  }
  async function saveSkin(data: Omit<Skin, "id">, id?: string) {
    try {
      if (id) {
        const updated = await api.replaceSkin(id, data);
        setSkns(p => p.map(s => s.id === id ? updated : s));
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createSkin(data.weaponId, data);
        setSkns(p => [...p, created]);
        addToast("success", `"${data.name}" añadida`);
      }
      setSkModal(null);
    } catch (err: any) { addToast("error", err.message); }
  }
  async function delSkin(id: string, name: string) {
    try {
      await api.deleteSkin(id);
      setSkns(p => p.filter(s => s.id !== id));
      addToast("success", `"${name}" eliminada`); setDelDlg(null);
    } catch (err: any) { addToast("error", err.message); }
  }
  async function saveCat(data: Omit<Category, "id">, id?: string) {
    try {
      if (id) {
        if (cModal?.mode === "desc") {
          const updated = await api.updateDescripcion(id, data.description);
          setCats(p => p.map(c => c.id === id ? updated : c));
        } else {
          const updated = await api.replaceCategoria(id, data);
          setCats(p => p.map(c => c.id === id ? updated : c));
        }
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createCategoria(data);
        setCats(p => [...p, created]);
        addToast("success", `"${data.name}" creada`);
      }
      setCModal(null);
    } catch (err: any) { addToast("error", err.message); }
  }
  async function delCat(id: string) {
    try {
      await api.deleteCategoria(id);
      setSubs(p => p.filter(s => s.categoryId !== id));
      setWpns(p => p.filter(w => w.categoryId !== id));
      setCats(p => p.filter(c => c.id !== id));
      addToast("success", "Categoría eliminada"); setDelDlg(null);
    } catch (err: any) { addToast("error", err.message); setDelDlg(null); }
  }
  async function saveSub(data: Omit<Subcategory, "id">, id?: string) {
    try {
      if (id) {
        const updated = await api.replaceSubcategoria(id, data);
        setSubs(p => p.map(s => s.id === id ? updated : s));
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createSubcategoria(data);
        setSubs(p => [...p, created]);
        addToast("success", `"${data.name}" creada`);
      }
      setSModal(null);
    } catch (err: any) { addToast("error", err.message); }
  }
  async function delSub(id: string) {
    try {
      await api.deleteSubcategoria(id);
      setSubs(p => p.filter(s => s.id !== id));
      addToast("success", "Subcategoría eliminada"); setDelDlg(null);
    } catch (err: any) { addToast("error", err.message); setDelDlg(null); }
  }
  function confirmDel() {
    if (!delDlg) return;
    const { type, id, name } = delDlg;
    if      (type === "weapon") delWeapon(id);
    else if (type === "skin")   delSkin(id, name);
    else if (type === "cat")    delCat(id);
    else if (type === "sub")    delSub(id);
  }

  const selWeapon = wpns.find(w => w.id === wid) || null;
  const activeNav = view === "weapon-detail" ? "weapons" : view;

  const NAV = [
    { id: "weapons"       as View, label: "Armas",         Icon: Crosshair },
    { id: "categories"    as View, label: "Categorías",    Icon: Layers },
    { id: "subcategories" as View, label: "Subcategorías", Icon: Tag },
    { id: "skins"         as View, label: "Skins",         Icon: Palette },
  ];

  function breadcrumbs() {
    if (view === "weapons")        return ["Arsenal CS2"];
    if (view === "weapon-detail")  return ["Arsenal CS2", selWeapon?.name || ""];
    if (view === "categories")     return ["Categorías"];
    if (view === "subcategories")  return ["Subcategorías"];
    return ["Skins"];
  }

  return (
    <>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
        .toast-anim { animation: toastIn 0.22s ease-out; }
        select option { background: #131920; color: #e6edf3; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      <div className="flex h-screen bg-[#0D1117] text-white overflow-hidden">

        {/* ══ Sidebar ══ */}
        <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0A0E14]">
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-[#DE6C2A]/15 border border-[#DE6C2A]/25 flex items-center justify-center flex-shrink-0">
              <Crosshair size={15} className="text-[#DE6C2A]" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-white tracking-wide leading-none">CS2 Wiki</div>
              <div className="text-[9px] text-white/35 uppercase tracking-[0.15em] mt-0.5">Dashboard</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV.map(({ id, label, Icon }) => {
              const active = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => { setView(id); setWid(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative ${
                    active
                      ? "bg-[#DE6C2A]/12 text-[#DE6C2A] border border-[#DE6C2A]/18"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#DE6C2A] rounded-r-full" />
                  )}
                  <Icon size={15} className={active ? "text-[#DE6C2A]" : "text-white/35"} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-4 pt-3 border-t border-white/[0.06]">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Armas",    val: wpns.length },
                { label: "Skins",    val: skns.length },
                { label: "Cats.",    val: cats.length },
                { label: "Subcats.", val: subs.length },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] rounded-lg py-2 text-center border border-white/[0.04]">
                  <div className="text-[15px] font-bold text-[#4A90D9] leading-none">{s.val}</div>
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ══ Main ══ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-12 flex items-center px-6 border-b border-white/[0.06] bg-[#0D1117]/90 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[13px]">
              {breadcrumbs().map((crumb, i, arr) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-white/20" />}
                  <span
                    className={i === arr.length - 1
                      ? "text-white/70 font-medium"
                      : "text-white/30 hover:text-white/55 cursor-pointer transition-colors"}
                    onClick={i === 0 && arr.length > 1 ? () => setView("weapons") : undefined}
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-[1400px]">
              {loading ? (
                <div className="flex h-64 items-center justify-center text-white/50 text-sm">Cargando datos...</div>
              ) : (
                <>
                  {view === "weapons" && (
                <WeaponsScreen
                  wpns={wpns} cats={cats} subs={subs} skns={skns}
                  onOpen={(id) => { setWid(id); setView("weapon-detail"); }}
                  onCreate={() => setWModal({ mode: "create" })}
                  onEdit={(w) => setWModal({ mode: "edit", w })}
                  onDel={(w) => setDelDlg({ type: "weapon", id: w.id, name: w.name })}
                />
              )}
              {view === "weapon-detail" && selWeapon && (
                <WeaponDetail
                  w={selWeapon} cats={cats} subs={subs}
                  skns={skns.filter(s => s.weaponId === selWeapon.id)}
                  onBack={() => setView("weapons")}
                  onEdit={() => setWModal({ mode: "edit", w: selWeapon })}
                  onUpdPrice={async (p) => { try { await api.updatePrecio(selWeapon.id, p); setWpns(prev => prev.map(w => w.id === selWeapon.id ? { ...w, price: p } : w)); addToast("success", "Precio actualizado"); } catch(err:any) { addToast("error", err.message); } }}
                  onUpdBullets={async (b) => { try { await api.updateCargador(selWeapon.id, b); setWpns(prev => prev.map(w => w.id === selWeapon.id ? { ...w, bullets: b } : w)); addToast("success", "Cargador actualizado"); } catch(err:any) { addToast("error", err.message); } }}
                  onAddSkin={() => setSkModal({ mode: "create", wid: selWeapon.id })}
                  onEditSkin={(sk) => setSkModal({ mode: "edit", sk, wid: selWeapon.id })}
                  onDelSkin={(sk) => setDelDlg({ type: "skin", id: sk.id, name: sk.name })}
                />
              )}
              {view === "categories" && (
                <CategoriesScreen
                  cats={cats} wpns={wpns}
                  onCreate={() => setCModal({ mode: "create" })}
                  onEdit={(c) => setCModal({ mode: "edit", c })}
                  onDesc={(c) => setCModal({ mode: "desc", c })}
                  onDel={(c) => setDelDlg({ type: "cat", id: c.id, name: c.name })}
                />
              )}
              {view === "subcategories" && (
                <SubcatsScreen
                  cats={cats} subs={subs} wpns={wpns}
                  onCreate={() => setSModal({ mode: "create" })}
                  onEdit={(s) => setSModal({ mode: "edit", s })}
                  onDel={(s) => setDelDlg({ type: "sub", id: s.id, name: s.name })}
                />
              )}
              {view === "skins" && (
                <SkinsScreen
                  skns={skns} wpns={wpns}
                  onEdit={(sk) => setSkModal({ mode: "edit", sk, wid: sk.weaponId })}
                  onRarity={async (sk, r) => { try { await api.updateRareza(sk.id, r); setSkns(p => p.map(s => s.id === sk.id ? { ...s, rarity: r } : s)); addToast("success", "Rareza actualizada"); } catch(err:any) { addToast("error", err.message); } }}
                  onDel={(sk) => setDelDlg({ type: "skin", id: sk.id, name: sk.name })}
                />
              )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ══ Modals ══ */}
      {wModal && (
        <WeaponModal
          mode={wModal.mode} w={wModal.w} cats={cats} subs={subs}
          onSave={saveWeapon} onClose={() => setWModal(null)}
        />
      )}
      {skModal && (
        <SkinModal
          mode={skModal.mode} sk={skModal.sk} wid={skModal.wid}
          onSave={saveSkin} onClose={() => setSkModal(null)}
        />
      )}
      {cModal && (
        <CatModal
          mode={cModal.mode} c={cModal.c}
          onSave={saveCat} onClose={() => setCModal(null)}
        />
      )}
      {sModal && (
        <SubModal
          mode={sModal.mode} s={sModal.s} cats={cats}
          onSave={saveSub} onClose={() => setSModal(null)}
        />
      )}
      {delDlg && (
        <DeleteModal name={delDlg.name} onConfirm={confirmDel} onClose={() => setDelDlg(null)} />
      )}

      {/* ══ Toasts ══ */}
      <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-anim flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl shadow-black/60 pointer-events-auto max-w-sm backdrop-blur-md ${
              t.type === "success"
                ? "bg-[#0A1A10] border-green-500/25 text-green-300"
                : "bg-[#1A0A0A] border-red-500/25 text-red-300"
            }`}
          >
            {t.type === "success"
              ? <CheckCircle size={14} className="flex-shrink-0" />
              : <XCircle size={14} className="flex-shrink-0" />}
            <span className="text-[13px] font-medium flex-1">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-white/30 hover:text-white/60 transition-colors ml-1">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Weapons Screen ───────────────────────────────────────────────────────────
function WeaponsScreen({ wpns, cats, subs, skns, onOpen, onCreate, onEdit, onDel }: {
  wpns: Weapon[]; cats: Category[]; subs: Subcategory[]; skns: Skin[];
  onOpen: (id: string) => void; onCreate: () => void; onEdit: (w: Weapon) => void; onDel: (w: Weapon) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Arsenal CS2</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{wpns.length} armas en la base de datos</p>
        </div>
        <button onClick={onCreate} className="flex items-center gap-2 bg-[#DE6C2A] hover:bg-[#c85f25] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-[#DE6C2A]/25 active:scale-[0.97]">
          <Plus size={14} />Nueva Arma
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {wpns.map(w => (
          <WpnCard
            key={w.id} w={w}
            cat={cats.find(c => c.id === w.categoryId)}
            sub={subs.find(s => s.id === w.subcategoryId)}
            skinCount={skns.filter(s => s.weaponId === w.id).length}
            onOpen={() => onOpen(w.id)}
            onEdit={() => onEdit(w)}
            onDel={() => onDel(w)}
          />
        ))}
      </div>
    </div>
  );
}

function WpnCard({ w, cat, sub, skinCount, onOpen, onEdit, onDel }: {
  w: Weapon; cat?: Category; sub?: Subcategory; skinCount: number;
  onOpen: () => void; onEdit: () => void; onDel: () => void;
}) {
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
      <h3 className="text-[15px] font-bold text-white group-hover:text-[#DE6C2A] transition-colors mb-0.5">{w.name}</h3>
      <p className="text-[11px] text-white/30 mb-3">{cat?.name}{sub ? ` · ${sub.name}` : ""}</p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[{ l: "Precio", v: `$${w.price}` }, { l: "Daño", v: w.damage }, { l: "Balas", v: w.bullets }].map(s => (
          <div key={s.l} className="bg-white/[0.03] rounded-lg py-1.5 text-center border border-white/[0.04]">
            <div className="text-[12px] font-bold text-[#4A90D9]">{s.v}</div>
            <div className="text-[9px] text-white/25 mt-0.5 uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 pt-2 border-t border-white/[0.05]" onClick={e => e.stopPropagation()}>
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

// ─── Weapon Detail ────────────────────────────────────────────────────────────
function WeaponDetail({ w, cats, subs, skns, onBack, onEdit, onUpdPrice, onUpdBullets, onAddSkin, onEditSkin, onDelSkin }: {
  w: Weapon; cats: Category[]; subs: Subcategory[]; skns: Skin[];
  onBack: () => void; onEdit: () => void;
  onUpdPrice: (p: number) => void; onUpdBullets: (b: number) => void;
  onAddSkin: () => void; onEditSkin: (s: Skin) => void; onDelSkin: (s: Skin) => void;
}) {
  const [price,   setPrice]   = useState(String(w.price));
  const [bullets, setBullets] = useState(String(w.bullets));
  useEffect(() => setPrice(String(w.price)),   [w.price]);
  useEffect(() => setBullets(String(w.bullets)), [w.bullets]);

  const cat = cats.find(c => c.id === w.categoryId);
  const sub = subs.find(s => s.id === w.subcategoryId);
  const { color, long } = SC[w.side];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-white/35 hover:text-white/65 transition-colors">
          <ArrowLeft size={14} />Arsenal
        </button>
        <span className="text-white/15">/</span>
        <span className="text-[13px] text-white/60 font-medium">{w.name}</span>
        <div className="flex-1" />
        <button onClick={onEdit} className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-white/60 hover:text-white/85 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all">
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
                { l: "Categoría",    v: cat?.name || "—" },
                { l: "Subcategoría", v: sub?.name || "—" },
                { l: "Daño base",    v: w.damage },
              ].map(s => (
                <div key={s.l} className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-[11px] text-white/35 uppercase tracking-wider">{s.l}</span>
                  <span className="text-[13px] font-semibold text-white">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/35 uppercase tracking-widest block mb-1.5">Precio ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number" value={price} onChange={e => setPrice(e.target.value)}
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
                <label className="text-[10px] text-white/35 uppercase tracking-widest block mb-1.5">Balas en cargador</label>
                <div className="flex gap-2">
                  <input
                    type="number" value={bullets} onChange={e => setBullets(e.target.value)}
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
                <p className="text-[12px] text-white/30 mt-0.5">{skns.length} skin{skns.length !== 1 ? "s" : ""} para {w.name}</p>
              </div>
              <button onClick={onAddSkin} className="flex items-center gap-1.5 bg-[#DE6C2A]/12 hover:bg-[#DE6C2A]/22 border border-[#DE6C2A]/22 text-[#DE6C2A] px-3 py-2 rounded-lg text-[12px] font-semibold transition-all">
                <Plus size={12} />Añadir Skin
              </button>
            </div>
            {skns.length === 0 ? (
              <div className="py-10 text-center text-white/25 text-[13px]">No hay skins para esta arma aún</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skns.map(sk => (
                  <SkinRow key={sk.id} sk={sk} onEdit={() => onEditSkin(sk)} onDel={() => onDelSkin(sk)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkinRow({ sk, onEdit, onDel }: { sk: Skin; onEdit: () => void; onDel: () => void }) {
  const c = RC[sk.rarity];
  return (
    <div className="group flex items-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.06] hover:border-white/[0.12] rounded-lg px-3 py-2.5 transition-all">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}55` }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate">{sk.name}</p>
        <p className="text-[10px] mt-0.5" style={{ color: c }}>{sk.rarity}</p>
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 rounded hover:bg-[#4A90D9]/20 text-white/35 hover:text-[#4A90D9] transition-all">
          <Pencil size={11} />
        </button>
        <button onClick={onDel} className="p-1.5 rounded hover:bg-red-500/20 text-white/35 hover:text-red-400 transition-all">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Categories Screen ────────────────────────────────────────────────────────
function CategoriesScreen({ cats, wpns, onCreate, onEdit, onDesc, onDel }: {
  cats: Category[]; wpns: Weapon[];
  onCreate: () => void; onEdit: (c: Category) => void; onDesc: (c: Category) => void; onDel: (c: Category) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Categorías</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{cats.length} categorías registradas</p>
        </div>
        <button onClick={onCreate} className="flex items-center gap-2 bg-[#DE6C2A] hover:bg-[#c85f25] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-[#DE6C2A]/25 active:scale-[0.97]">
          <Plus size={14} />Nueva Categoría
        </button>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] grid grid-cols-12 gap-4 text-[10px] uppercase tracking-widest text-white/25 font-semibold">
          <span className="col-span-3">Nombre</span>
          <span className="col-span-5">Descripción</span>
          <span className="col-span-2 text-center">Armas</span>
          <span className="col-span-2 text-right">Acciones</span>
        </div>
        {cats.map((c, i) => {
          const count = wpns.filter(w => w.categoryId === c.id).length;
          return (
            <div
              key={c.id}
              className={`px-5 py-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.015] transition-colors ${i < cats.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <div className="col-span-3 text-[13px] font-semibold text-white">{c.name}</div>
              <div className="col-span-5 text-[12px] text-white/40 truncate">{c.description}</div>
              <div className="col-span-2 flex justify-center">
                <span className="text-[11px] font-bold text-[#4A90D9] bg-[#4A90D9]/10 px-2.5 py-0.5 rounded-full border border-[#4A90D9]/15">
                  {count}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-0.5">
                <button onClick={() => onEdit(c)} title="Editar" className="p-1.5 rounded-lg text-white/35 hover:text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-all">
                  <Pencil size={13} />
                </button>
                <button onClick={() => onDesc(c)} title="Editar descripción" className="p-1.5 rounded-lg text-[9px] font-bold text-white/35 hover:text-[#DE6C2A] hover:bg-[#DE6C2A]/10 transition-all">
                  TXT
                </button>
                <button onClick={() => onDel(c)} title="Eliminar" className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subcategories Screen ─────────────────────────────────────────────────────
function SubcatsScreen({ cats, subs, wpns, onCreate, onEdit, onDel }: {
  cats: Category[]; subs: Subcategory[]; wpns: Weapon[];
  onCreate: () => void; onEdit: (s: Subcategory) => void; onDel: (s: Subcategory) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setExpanded(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Subcategorías</h1>
          <p className="text-[13px] text-white/35 mt-0.5">{subs.length} subcategorías registradas</p>
        </div>
        <button onClick={onCreate} className="flex items-center gap-2 bg-[#DE6C2A] hover:bg-[#c85f25] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-[#DE6C2A]/25 active:scale-[0.97]">
          <Plus size={14} />Nueva Subcategoría
        </button>
      </div>
      <div className="space-y-4">
        {cats.map(cat => {
          const catSubs = subs.filter(s => s.categoryId === cat.id);
          if (!catSubs.length) return null;
          return (
            <div key={cat.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.01]">
                <Layers size={13} className="text-[#DE6C2A]" />
                <span className="text-[13px] font-bold text-white">{cat.name}</span>
                <span className="text-[11px] text-white/25 ml-0.5">({catSubs.length})</span>
              </div>
              {catSubs.map((sub, i) => {
                const subWpns = wpns.filter(w => w.subcategoryId === sub.id);
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
                        <button onClick={() => onEdit(sub)} className="p-1.5 rounded-lg text-white/35 hover:text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDel(sub)} className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {isExp && subWpns.length > 0 && (
                      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                        {subWpns.map(w => (
                          <span key={w.id} className="text-[11px] bg-white/[0.04] border border-white/[0.07] text-white/45 px-2.5 py-1 rounded-full">
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

// ─── Skins Screen ─────────────────────────────────────────────────────────────
function SkinsScreen({ skns, wpns, onEdit, onRarity, onDel }: {
  skns: Skin[]; wpns: Weapon[];
  onEdit: (s: Skin) => void; onRarity: (s: Skin, r: Rarity) => void; onDel: (s: Skin) => void;
}) {
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
        {wpns.map(wpn => {
          const ws = skns.filter(s => s.weaponId === wpn.id);
          if (!ws.length) return null;
          return (
            <div key={wpn.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.01]">
                <Crosshair size={13} className="text-[#DE6C2A]" />
                <span className="text-[13px] font-bold text-white">{wpn.name}</span>
                <span className="text-[11px] text-white/25">({ws.length} skin{ws.length !== 1 ? "s" : ""})</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {ws.map(sk => {
                  const c = RC[sk.rarity];
                  const isInline = inlineEdit === sk.id;
                  return (
                    <div key={sk.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.015] transition-colors group">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 7px ${c}50` }} />
                      <span className="text-[13px] font-medium text-white flex-1">{sk.name}</span>
                      <div className="flex items-center gap-2">
                        {isInline ? (
                          <select
                            autoFocus
                            defaultValue={sk.rarity}
                            onChange={e => { onRarity(sk, e.target.value as Rarity); setInline(null); }}
                            onBlur={() => setInline(null)}
                            className="bg-[#131920] border border-white/[0.15] text-white text-[12px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#4A90D9]/50"
                          >
                            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
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
                          <button onClick={() => onEdit(sk)} title="Editar skin" className="p-1.5 rounded hover:bg-[#4A90D9]/20 text-white/35 hover:text-[#4A90D9] transition-all">
                            <Pencil size={11} />
                          </button>
                          <button onClick={() => setInline(isInline ? null : sk.id)} title="Editar rareza" className="p-1.5 rounded hover:bg-[#DE6C2A]/20 text-white/35 hover:text-[#DE6C2A] transition-all">
                            <Tag size={11} />
                          </button>
                          <button onClick={() => onDel(sk)} title="Eliminar" className="p-1.5 rounded hover:bg-red-500/20 text-white/35 hover:text-red-400 transition-all">
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

// ─── Modal primitives ─────────────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0F141A] border border-white/[0.1] rounded-2xl shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function MHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
      <h2 className="text-[14px] font-bold text-white">{title}</h2>
      <button onClick={onClose} className="p-1.5 rounded-lg text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-all">
        <X size={14} />
      </button>
    </div>
  );
}

function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function BtnRow({ onClose, submitLabel, submitColor = "orange" }: { onClose: () => void; submitLabel: string; submitColor?: "orange" | "blue" }) {
  const cls = submitColor === "blue"
    ? "bg-[#4A90D9] hover:bg-[#3d7dc0]"
    : "bg-[#DE6C2A] hover:bg-[#c85f25] hover:shadow-[#DE6C2A]/20";
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/[0.09] text-white/50 hover:text-white/75 hover:bg-white/[0.04] text-[13px] font-medium transition-all">
        Cancelar
      </button>
      <button type="submit" className={`flex-1 py-2.5 rounded-lg ${cls} text-white text-[13px] font-semibold transition-all hover:shadow-lg`}>
        {submitLabel}
      </button>
    </div>
  );
}

// ─── Weapon Modal ─────────────────────────────────────────────────────────────
function WeaponModal({ mode, w, cats, subs, onSave, onClose }: {
  mode: "create" | "edit"; w?: Weapon; cats: Category[]; subs: Subcategory[];
  onSave: (d: Omit<Weapon, "id">, id?: string) => void; onClose: () => void;
}) {
  const initCat = w?.categoryId || cats[0]?.id || "";
  const [f, setF] = useState({
    name: w?.name || "",
    side: (w?.side || "T") as Side,
    price: String(w?.price || ""),
    damage: String(w?.damage || ""),
    bullets: String(w?.bullets || ""),
    categoryId: initCat,
    subcategoryId: w?.subcategoryId || subs.find(s => s.categoryId === initCat)?.id || "",
  });
  const filtSubs = subs.filter(s => s.categoryId === f.categoryId);

  function onCatChange(cid: string) {
    const ns = subs.filter(s => s.categoryId === cid);
    setF(p => ({ ...p, categoryId: cid, subcategoryId: ns[0]?.id || "" }));
  }
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name: f.name, side: f.side,
      price: parseInt(f.price) || 0, damage: parseInt(f.damage) || 0, bullets: parseInt(f.bullets) || 0,
      categoryId: f.categoryId, subcategoryId: f.subcategoryId,
    }, w?.id);
  }

  return (
    <Overlay onClose={onClose}>
      <MHead title={mode === "create" ? "Nueva Arma" : "Editar Arma"} onClose={onClose} />
      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <Fld label="Nombre">
          <input required className={ic} value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="AK-47, M4A4..." />
        </Fld>
        <Fld label="Bando">
          <select className={ic} value={f.side} onChange={e => setF(p => ({ ...p, side: e.target.value as Side }))}>
            {SIDES.map(s => <option key={s} value={s}>{s} — {SC[s].long}</option>)}
          </select>
        </Fld>
        <div className="grid grid-cols-3 gap-3">
          <Fld label="Precio ($)">
            <input type="number" required className={ic} value={f.price} onChange={e => setF(p => ({ ...p, price: e.target.value }))} placeholder="2700" />
          </Fld>
          <Fld label="Daño">
            <input type="number" required className={ic} value={f.damage} onChange={e => setF(p => ({ ...p, damage: e.target.value }))} placeholder="36" />
          </Fld>
          <Fld label="Balas">
            <input type="number" required className={ic} value={f.bullets} onChange={e => setF(p => ({ ...p, bullets: e.target.value }))} placeholder="30" />
          </Fld>
        </div>
        <Fld label="Categoría">
          <select className={ic} value={f.categoryId} onChange={e => onCatChange(e.target.value)}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Fld>
        <Fld label="Subcategoría">
          <select className={ic} value={f.subcategoryId} onChange={e => setF(p => ({ ...p, subcategoryId: e.target.value }))}>
            {filtSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Fld>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Crear Arma" : "Guardar Cambios"} />
      </form>
    </Overlay>
  );
}

// ─── Skin Modal ───────────────────────────────────────────────────────────────
function SkinModal({ mode, sk, wid, onSave, onClose }: {
  mode: "create" | "edit"; sk?: Skin; wid: string;
  onSave: (d: Omit<Skin, "id">, id?: string) => void; onClose: () => void;
}) {
  const [name,   setName]  = useState(sk?.name || "");
  const [rarity, setRar]   = useState<Rarity>(sk?.rarity || "Consumer");
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
          <input required className={ic} value={name} onChange={e => setName(e.target.value)} placeholder="Dragon Lore, Asiimov..." />
        </Fld>
        <Fld label="Rareza">
          <select className={ic} value={rarity} onChange={e => setRar(e.target.value as Rarity)}>
            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Fld>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all"
          style={{ borderColor: `${c}30`, background: `${c}0D` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
          <span className="text-[13px] font-semibold" style={{ color: c }}>{rarity}</span>
        </div>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Añadir Skin" : "Guardar Skin"} />
      </form>
    </Overlay>
  );
}

// ─── Category Modal ───────────────────────────────────────────────────────────
function CatModal({ mode, c, onSave, onClose }: {
  mode: "create" | "edit" | "desc"; c?: Category;
  onSave: (d: Omit<Category, "id">, id?: string) => void; onClose: () => void;
}) {
  const [name, setName] = useState(c?.name || "");
  const [desc, setDesc] = useState(c?.description || "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name: mode === "desc" ? (c?.name || "") : name, description: desc }, c?.id);
  }

  if (mode === "desc") {
    return (
      <Overlay onClose={onClose}>
        <MHead title="Editar Descripción" onClose={onClose} />
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <Fld label="Descripción">
            <textarea required rows={4} className={`${ic} resize-none`} value={desc} onChange={e => setDesc(e.target.value)} />
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
          <input required className={ic} value={name} onChange={e => setName(e.target.value)} placeholder="Rifles, Pistolas..." />
        </Fld>
        <Fld label="Descripción">
          <textarea rows={3} className={`${ic} resize-none`} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción de la categoría..." />
        </Fld>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Crear Categoría" : "Guardar Cambios"} />
      </form>
    </Overlay>
  );
}

// ─── Subcategory Modal ────────────────────────────────────────────────────────
function SubModal({ mode, s, cats, onSave, onClose }: {
  mode: "create" | "edit"; s?: Subcategory; cats: Category[];
  onSave: (d: Omit<Subcategory, "id">, id?: string) => void; onClose: () => void;
}) {
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
          <select className={ic} value={f.categoryId} onChange={e => setF(p => ({ ...p, categoryId: e.target.value }))}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Fld>
        <Fld label="Nombre">
          <input required className={ic} value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="Asalto, Sniper..." />
        </Fld>
        <Fld label="Descripción (opcional)">
          <textarea rows={3} className={`${ic} resize-none`} value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="Descripción opcional..." />
        </Fld>
        <BtnRow onClose={onClose} submitLabel={mode === "create" ? "Crear Subcategoría" : "Guardar Cambios"} />
      </form>
    </Overlay>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#0F141A] border border-white/[0.1] rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/12 border border-red-500/22 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h2 className="text-[15px] font-bold text-white mb-2">Confirmar eliminación</h2>
        <p className="text-[13px] text-white/45 mb-6 leading-relaxed">
          ¿Eliminar <strong className="text-white/80">"{name}"</strong>?<br />Esta acción no puede deshacerse.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/[0.09] text-white/50 hover:text-white/75 hover:bg-white/[0.04] text-[13px] font-medium transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500/85 hover:bg-red-500 text-white text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-red-500/20">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
