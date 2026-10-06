import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_SECTIONS, type AdminSection } from "./sections";

type AdminSidebarProps = {
  readonly active: AdminSection;
  readonly onNavigate: (section: AdminSection) => void;
};

export default function AdminSidebar({
  active,
  onNavigate,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Administrator";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-ink">Admin</p>
          <p className="text-xs text-muted">Bookstore console</p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {ADMIN_SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive
                      ? "bg-brand-light text-brand-dark"
                      : "text-ink-soft hover:bg-cream hover:text-ink"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-brand" : "text-muted group-hover:text-ink-soft"}`}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 space-y-3 border-t border-line p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-line-strong hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Website
        </Link>
        <div className="flex items-center gap-3 px-1">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white"
            aria-hidden="true"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
