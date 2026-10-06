import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { adminBtn, adminInput } from "./adminStyles";

type AdminToolbarProps = {
  readonly search: string;
  readonly onSearch: (value: string) => void;
  readonly placeholder: string;
  readonly label: string;
  /** Filter controls (selects, segmented buttons) rendered beside the search. */
  readonly children?: ReactNode;
  readonly hasFilters: boolean;
  readonly onClear: () => void;
};

/** Search box + filter slot shared by every admin table. */
export default function AdminToolbar({
  search,
  onSearch,
  placeholder,
  label,
  children,
  hasFilters,
  onClear,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`${adminInput} pl-9`}
        />
      </div>
      {children}
      {hasFilters && (
        <button type="button" className={adminBtn.ghost} onClick={onClear}>
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
}
