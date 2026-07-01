import React, { useState, useEffect, useCallback } from "react";
import * as api from "./api";
import {
  Layers,
  Tag,
  Palette,
  X,
  ChevronRight,
  Crosshair,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Category, Subcategory, Skin, Weapon, ToastItem, View, uid } from "./types";

// Importar Screens
import WeaponsScreen from "./components/screens/WeaponsScreen";
import WeaponDetail from "./components/screens/WeaponDetail";
import CategoriesScreen from "./components/screens/CategoriesScreen";
import SubcatsScreen from "./components/screens/SubcatsScreen";
import SkinsScreen from "./components/screens/SkinsScreen";

// Importar Modales
import WeaponModal from "./components/modals/WeaponModal";
import SkinModal from "./components/modals/SkinModal";
import CatModal from "./components/modals/CatModal";
import SubModal from "./components/modals/SubModal";
import DeleteModal from "./components/modals/DeleteModal";

export default function App() {
  const [cats, setCats] = useState<Category[]>([]);
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [wpns, setWpns] = useState<Weapon[]>([]);
  const [skns, setSkns] = useState<Skin[]>([]);
  const [view, setView] = useState<View>("weapons");
  const [wid, setWid] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [wModal, setWModal] = useState<{ mode: "create" | "edit"; w?: Weapon } | null>(null);
  const [skModal, setSkModal] = useState<{ mode: "create" | "edit"; sk?: Skin; wid: string } | null>(null);
  const [cModal, setCModal] = useState<{ mode: "create" | "edit" | "desc"; c?: Category } | null>(null);
  const [sModal, setSModal] = useState<{ mode: "create" | "edit"; s?: Subcategory } | null>(null);
  const [delDlg, setDelDlg] = useState<{ type: string; id: string; name: string } | null>(null);
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
        const allSkins = armas.flatMap((a) => a.skins || []);
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
    setToasts((p) => [...p, { id, type, message: msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  async function saveWeapon(data: Omit<Weapon, "id">, id?: string) {
    try {
      if (id) {
        const updated = await api.replaceArma(id, data);
        setWpns((p) => p.map((w) => (w.id === id ? updated : w)));
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createArma(data);
        setWpns((p) => [...p, created]);
        addToast("success", `"${data.name}" creada`);
      }
      setWModal(null);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function delWeapon(id: string) {
    try {
      await api.deleteArma(id);
      setSkns((p) => p.filter((s) => s.weaponId !== id));
      setWpns((p) => p.filter((w) => w.id !== id));
      if (wid === id) {
        setWid(null);
        setView("weapons");
      }
      addToast("success", "Arma eliminada");
      setDelDlg(null);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function saveSkin(data: Omit<Skin, "id">, id?: string) {
    try {
      if (id) {
        const updated = await api.replaceSkin(id, data);
        setSkns((p) => p.map((s) => (s.id === id ? updated : s)));
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createSkin(data.weaponId, data);
        setSkns((p) => [...p, created]);
        addToast("success", `"${data.name}" añadida`);
      }
      setSkModal(null);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function delSkin(id: string, name: string) {
    try {
      await api.deleteSkin(id);
      setSkns((p) => p.filter((s) => s.id !== id));
      addToast("success", `"${name}" eliminada`);
      setDelDlg(null);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function saveCat(data: Omit<Category, "id">, id?: string) {
    try {
      if (id) {
        if (cModal?.mode === "desc") {
          const updated = await api.updateDescripcion(id, data.description);
          setCats((p) => p.map((c) => (c.id === id ? updated : c)));
        } else {
          const updated = await api.replaceCategoria(id, data);
          setCats((p) => p.map((c) => (c.id === id ? updated : c)));
        }
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createCategoria(data);
        setCats((p) => [...p, created]);
        addToast("success", `"${data.name}" creada`);
      }
      setCModal(null);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function delCat(id: string) {
    try {
      await api.deleteCategoria(id);
      setSubs((p) => p.filter((s) => s.categoryId !== id));
      setWpns((p) => p.filter((w) => w.categoryId !== id));
      setCats((p) => p.filter((c) => c.id !== id));
      addToast("success", "Categoría eliminada");
      setDelDlg(null);
    } catch (err: any) {
      addToast("error", err.message);
      setDelDlg(null);
    }
  }

  async function saveSub(data: Omit<Subcategory, "id">, id?: string) {
    try {
      if (id) {
        const updated = await api.replaceSubcategoria(id, data);
        setSubs((p) => p.map((s) => (s.id === id ? updated : s)));
        addToast("success", `"${data.name}" actualizada`);
      } else {
        const created = await api.createSubcategoria(data);
        setSubs((p) => [...p, created]);
        addToast("success", `"${data.name}" creada`);
      }
      setSModal(null);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function delSub(id: string) {
    try {
      await api.deleteSubcategoria(id);
      setSubs((p) => p.filter((s) => s.id !== id));
      addToast("success", "Subcategoría eliminada");
      setDelDlg(null);
    } catch (err: any) {
      addToast("error", err.message);
      setDelDlg(null);
    }
  }

  function confirmDel() {
    if (!delDlg) return;
    const { type, id, name } = delDlg;
    if (type === "weapon") delWeapon(id);
    else if (type === "skin") delSkin(id, name);
    else if (type === "cat") delCat(id);
    else if (type === "sub") delSub(id);
  }

  const selWeapon = wpns.find((w) => w.id === wid) || null;
  const activeNav = view === "weapon-detail" ? "weapons" : view;

  const NAV = [
    { id: "weapons" as View, label: "Armas", Icon: Crosshair },
    { id: "categories" as View, label: "Categorías", Icon: Layers },
    { id: "subcategories" as View, label: "Subcategorías", Icon: Tag },
    { id: "skins" as View, label: "Skins", Icon: Palette },
  ];

  function breadcrumbs() {
    if (view === "weapons") return ["Arsenal CS2"];
    if (view === "weapon-detail") return ["Arsenal CS2", selWeapon?.name || ""];
    if (view === "categories") return ["Categorías"];
    if (view === "subcategories") return ["Subcategorías"];
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
                  onClick={() => {
                    setView(id);
                    setWid(null);
                  }}
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
                { label: "Armas", val: wpns.length },
                { label: "Skins", val: skns.length },
                { label: "Cats.", val: cats.length },
                { label: "Subcats.", val: subs.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.03] rounded-lg py-2 text-center border border-white/[0.04]"
                >
                  <div className="text-[15px] font-bold text-[#4A90D9] leading-none">{s.val}</div>
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mt-1">
                    {s.label}
                  </div>
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
                    className={
                      i === arr.length - 1
                        ? "text-white/70 font-medium"
                        : "text-white/30 hover:text-white/55 cursor-pointer transition-colors"
                    }
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
                <div className="flex h-64 items-center justify-center text-white/50 text-sm">
                  Cargando datos...
                </div>
              ) : (
                <>
                  {view === "weapons" && (
                    <WeaponsScreen
                      wpns={wpns}
                      cats={cats}
                      subs={subs}
                      skns={skns}
                      onOpen={(id) => {
                        setWid(id);
                        setView("weapon-detail");
                      }}
                      onCreate={() => setWModal({ mode: "create" })}
                      onEdit={(w) => setWModal({ mode: "edit", w })}
                      onDel={(w) => setDelDlg({ type: "weapon", id: w.id, name: w.name })}
                    />
                  )}
                  {view === "weapon-detail" && selWeapon && (
                    <WeaponDetail
                      w={selWeapon}
                      cats={cats}
                      subs={subs}
                      skns={skns.filter((s) => s.weaponId === selWeapon.id)}
                      onBack={() => setView("weapons")}
                      onEdit={() => setWModal({ mode: "edit", w: selWeapon })}
                      onUpdPrice={async (p) => {
                        try {
                          await api.updatePrecio(selWeapon.id, p);
                          setWpns((prev) =>
                            prev.map((w) => (w.id === selWeapon.id ? { ...w, price: p } : w))
                          );
                          addToast("success", "Precio actualizado");
                        } catch (err: any) {
                          addToast("error", err.message);
                        }
                      }}
                      onUpdBullets={async (b) => {
                        try {
                          await api.updateCargador(selWeapon.id, b);
                          setWpns((prev) =>
                            prev.map((w) => (w.id === selWeapon.id ? { ...w, bullets: b } : w))
                          );
                          addToast("success", "Cargador actualizado");
                        } catch (err: any) {
                          addToast("error", err.message);
                        }
                      }}
                      onAddSkin={() => setSkModal({ mode: "create", wid: selWeapon.id })}
                      onEditSkin={(sk) => setSkModal({ mode: "edit", sk, wid: selWeapon.id })}
                      onDelSkin={(sk) => setDelDlg({ type: "skin", id: sk.id, name: sk.name })}
                    />
                  )}
                  {view === "categories" && (
                    <CategoriesScreen
                      cats={cats}
                      wpns={wpns}
                      onCreate={() => setCModal({ mode: "create" })}
                      onEdit={(c) => setCModal({ mode: "edit", c })}
                      onDesc={(c) => setCModal({ mode: "desc", c })}
                      onDel={(c) => setDelDlg({ type: "cat", id: c.id, name: c.name })}
                    />
                  )}
                  {view === "subcategories" && (
                    <SubcatsScreen
                      cats={cats}
                      subs={subs}
                      wpns={wpns}
                      onCreate={() => setSModal({ mode: "create" })}
                      onEdit={(s) => setSModal({ mode: "edit", s })}
                      onDel={(s) => setDelDlg({ type: "sub", id: s.id, name: s.name })}
                    />
                  )}
                  {view === "skins" && (
                    <SkinsScreen
                      skns={skns}
                      wpns={wpns}
                      onEdit={(sk) => setSkModal({ mode: "edit", sk, wid: sk.weaponId })}
                      onRarity={async (sk, r) => {
                        try {
                          await api.updateRareza(sk.id, r);
                          setSkns((p) =>
                            p.map((s) => (s.id === sk.id ? { ...s, rarity: r } : s))
                          );
                          addToast("success", "Rareza actualizada");
                        } catch (err: any) {
                          addToast("error", err.message);
                        }
                      }}
                      onDel={(sk) => setDelDlg({ type: "skin", id: sk.id, name: sk.name })}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ══ Modales ══ */}
      {wModal && (
        <WeaponModal
          mode={wModal.mode}
          w={wModal.w}
          cats={cats}
          subs={subs}
          onSave={saveWeapon}
          onClose={() => setWModal(null)}
        />
      )}
      {skModal && (
        <SkinModal
          mode={skModal.mode}
          sk={skModal.sk}
          wid={skModal.wid}
          onSave={saveSkin}
          onClose={() => setSkModal(null)}
        />
      )}
      {cModal && (
        <CatModal mode={cModal.mode} c={cModal.c} onSave={saveCat} onClose={() => setCModal(null)} />
      )}
      {sModal && (
        <SubModal
          mode={sModal.mode}
          s={sModal.s}
          cats={cats}
          onSave={saveSub}
          onClose={() => setSModal(null)}
        />
      )}
      {delDlg && (
        <DeleteModal name={delDlg.name} onConfirm={confirmDel} onClose={() => setDelDlg(null)} />
      )}

      {/* ══ Toasts ══ */}
      <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-anim flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl shadow-black/60 pointer-events-auto max-w-sm backdrop-blur-md ${
              t.type === "success"
                ? "bg-[#0A1A10] border-green-500/25 text-green-300"
                : "bg-[#1A0A0A] border-red-500/25 text-red-300"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle size={14} className="flex-shrink-0" />
            ) : (
              <XCircle size={14} className="flex-shrink-0" />
            )}
            <span className="text-[13px] font-medium flex-1">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-white/30 hover:text-white/60 transition-colors ml-1"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
