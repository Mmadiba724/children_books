import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudOff, SearchX, Users } from "lucide-react";
import toast from "react-hot-toast";
import userService, { type User } from "../services/userService";
import { formatLocalDate } from "../utils/dateUtils";
import AdminPageHeader from "./admin/AdminPageHeader";
import AdminToolbar from "./admin/AdminToolbar";
import { fetchAllPages } from "./admin/fetchAll";
import { adminBtn, adminInput } from "./admin/adminStyles";
import {
  AdminCard,
  InlineState,
  Pagination,
  StatusBadge,
  TableSkeleton,
} from "./admin/ui";

const PAGE_SIZE = 8;

function Avatar({ user }: { readonly user: User }) {
  const label = (user.name || user.email || "?").charAt(0).toUpperCase();
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-deep text-sm font-bold text-ink-soft"
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      // Load every page so search and filters cover all users, not just one page
      const all = await fetchAllPages<User>(async (p, size) => {
        const response = await userService.getAllUsers(p, size);
        if (!response.success || !response.data) {
          throw new Error("Failed to load users");
        }
        return {
          items: response.data.content || [],
          totalPages: response.data.totalPages ?? null,
        };
      });
      setUsers(all);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && (u.role || "USER") !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.name ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.id).toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const hasFilters = Boolean(search || roleFilter);
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setPage(0);
  };

  let body;
  if (isLoading) {
    body = <TableSkeleton rows={6} cols={3} />;
  } else if (loadFailed) {
    body = (
      <InlineState
        tone="error"
        icon={<CloudOff className="h-6 w-6" />}
        title="We couldn't load the users"
        message="Check your connection and try again."
        action={
          <button type="button" className={adminBtn.primary} onClick={fetchUsers}>
            Try again
          </button>
        }
      />
    );
  } else if (users.length === 0) {
    body = (
      <InlineState
        icon={<Users className="h-6 w-6" />}
        title="No users yet"
        message="Accounts will appear here once people register."
      />
    );
  } else if (visible.length === 0) {
    body = (
      <InlineState
        icon={<SearchX className="h-6 w-6" />}
        title="No users match"
        message="Try a different search or clear the filters."
        action={
          <button type="button" className={adminBtn.secondary} onClick={clearFilters}>
            Clear filters
          </button>
        }
      />
    );
  } else {
    body = (
      <>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs font-semibold tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-3">User</th>
                <th scope="col" className="px-3 py-3">Role</th>
                <th scope="col" className="px-5 py-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {pageItems.map((user) => (
                <tr key={user.id} className="hover:bg-cream/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {user.name || "No name"}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge tone={user.role === "ADMIN" ? "plum" : "neutral"}>
                      {user.role || "USER"}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted">
                    {formatLocalDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-line-soft md:hidden">
          {pageItems.map((user) => (
            <li key={user.id} className="flex items-center gap-3 p-4">
              <Avatar user={user} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {user.name || "No name"}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <p className="mt-0.5 text-xs text-muted">
                  Registered {formatLocalDate(user.createdAt)}
                </p>
              </div>
              <StatusBadge tone={user.role === "ADMIN" ? "plum" : "neutral"}>
                {user.role || "USER"}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const showTable = !isLoading && !loadFailed && users.length > 0;

  return (
    <>
      <AdminPageHeader
        title="Users"
        description={
          users.length > 0
            ? `${users.length} registered ${users.length === 1 ? "user" : "users"}`
            : "Everyone registered on the platform."
        }
      />
      <AdminCard>
        {showTable && (
          <AdminToolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(0);
            }}
            placeholder="Search name, email or ID"
            label="Search users"
            hasFilters={hasFilters}
            onClear={clearFilters}
          >
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by role"
              className={`${adminInput} lg:w-40`}
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </AdminToolbar>
        )}
        {body}
        {showTable && visible.length > 0 && (
          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={visible.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </AdminCard>
    </>
  );
}
