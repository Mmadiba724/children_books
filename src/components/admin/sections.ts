import {
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSection =
  | "overview"
  | "orders"
  | "books"
  | "categories"
  | "users";

export const ADMIN_SECTIONS: readonly {
  readonly id: AdminSection;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
}[] = [
  {
    id: "overview",
    label: "Overview",
    description: "The state of the store at a glance",
    icon: LayoutDashboard,
  },
  {
    id: "orders",
    label: "Orders",
    description: "Review orders and mobile-money transaction IDs",
    icon: ShoppingBag,
  },
  {
    id: "books",
    label: "Books",
    description: "Manage the catalogue, stock and cover art",
    icon: BookOpen,
  },
  {
    id: "categories",
    label: "Categories",
    description: "Organise books into shelves",
    icon: Tags,
  },
  {
    id: "users",
    label: "Users",
    description: "Everyone registered on the platform",
    icon: Users,
  },
];

export function isAdminSection(value: string | null): value is AdminSection {
  return ADMIN_SECTIONS.some((s) => s.id === value);
}
