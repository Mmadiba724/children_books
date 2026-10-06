import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { ADMIN_SECTIONS, type AdminSection } from "./sections";

type AdminLayoutProps = {
  readonly active: AdminSection;
  readonly onNavigate: (section: AdminSection) => void;
  readonly children: ReactNode;
};

/** Dedicated admin shell: persistent sidebar on desktop, drawer below lg. */
export default function AdminLayout({
  active,
  onNavigate,
  children,
}: AdminLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const current = ADMIN_SECTIONS.find((s) => s.id === active);

  useEffect(() => {
    if (!drawerOpen) return;
    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const navigate = (section: AdminSection) => {
    onNavigate(section);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-[#f6f5f8] text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line lg:block">
        <AdminSidebar active={active} onNavigate={navigate} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/50"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-cream focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <AdminSidebar active={active} onNavigate={navigate} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Compact top bar, mobile only (desktop uses the page header) */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="font-display text-base font-bold">{current?.label}</p>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
