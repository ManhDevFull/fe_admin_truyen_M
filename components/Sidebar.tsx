"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdminAuth } from "../lib/store";
import { can } from "../lib/permissions";

type MenuItem = {
  label: string;
  href: string;
  permission?: string;
  ownerOnly?: boolean;
  children?: MenuItem[];
};

const menu: MenuItem[] = [
  { label: "Tổng quan", href: "/dashboard", permission: "admin.stats.read" },
  {
    label: "Nội dung",
    href: "/content",
    children: [
      { label: "Danh sách truyện", href: "/comics", permission: "admin.comics.write" },
      { label: "Thêm truyện mới", href: "/comics/new", permission: "admin.comics.write" },
      { label: "Thể loại", href: "/genres", permission: "admin.genres.read" },
      { label: "Thống kê", href: "/analytics", permission: "admin.analytics.read" },
      { label: "Lưu lượng", href: "/traffic", permission: "admin.traffic.read" }
    ]
  },
  {
    label: "Tương tác",
    href: "/engagement",
    children: [
      { label: "Người dùng", href: "/users", permission: "admin.users.read" },
      { label: "Hỗ trợ", href: "/support", permission: "admin.support.read" },
      { label: "Phân phối điểm", href: "/rewards", permission: "admin.rewards.distribute" },
      { label: "Quảng cáo", href: "/ads", permission: "admin.ads.read" }
    ]
  },
  { label: "Nhật ký hệ thống", href: "/logs", permission: "admin.stats.read" },
  { label: "Cấu hình", href: "/settings", ownerOnly: true }
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAdminAuth((s) => s.user);
  const permissions = useAdminAuth((s) => s.permissions);

  const role = user?.role;

  const isAllowed = (item: MenuItem) => {
    if (item.ownerOnly) return role === "owner";
    if (!item.permission) return true;
    return can(role, permissions, item.permission);
  };

  const items = useMemo(() => {
    return menu
      .map((item) => {
        if (item.children) {
          const children = item.children.filter(isAllowed);
          if (children.length === 0) return null;
          return { ...item, children };
        }
        return isAllowed(item) ? item : null;
      })
      .filter(Boolean) as MenuItem[];
  }, [permissions, role]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Content: true,
    Engagement: true
  });

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <aside className="sticky top-20 h-fit rounded-3xl border border-black/10 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-black/40">Danh mục</div>
      <nav className="flex flex-col gap-2 text-sm">
        {items.map((item) => {
          if (item.children) {
            const isOpen = openSections[item.label] ?? false;
            const activeChild = item.children.some((child) => isActive(child.href));
            return (
              <div key={item.label} className="rounded-2xl border border-black/5 bg-white/70">
                <button
                  type="button"
                  onClick={() => setOpenSections((prev) => ({ ...prev, [item.label]: !isOpen }))}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition ${
                    activeChild ? "bg-black text-white" : "hover:bg-black/5"
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span
                    className={`text-xs transition ${
                      isOpen ? "rotate-90" : "rotate-0"
                    }`}
                  >
                    &gt;
                  </span>
                </button>
                <div
                  className={`grid gap-1 overflow-hidden px-2 transition-all duration-300 ${
                    isOpen ? "max-h-40 py-2 opacity-100" : "max-h-0 py-0 opacity-0"
                  }`}
                >
                  {item.children.map((child) => {
                    const active = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                          active
                            ? "bg-black text-white"
                            : "bg-white text-black/70 hover:bg-black/5 hover:text-black"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2 transition ${
                active
                  ? "bg-black text-white"
                  : "bg-white text-black/70 hover:bg-black/5 hover:text-black"
              }`}
            >
              <span className={active ? "font-semibold" : "font-medium"}>{item.label}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  active ? "bg-white" : "bg-black/10 group-hover:bg-black/30"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
