"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useAdminAuth } from "../../lib/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = useAdminAuth((s) => s.token);
  const user = useAdminAuth((s) => s.user);
  const logout = useAdminAuth((s) => s.logout);
  const router = useRouter();

  if (!token || !user) {
    return <div className="container py-10 text-sm text-black/60">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="admin-shell flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-base text-sm font-semibold text-white shadow-sm">
              <img src="/logo.svg" alt="TruyenM" className="h-7 w-7" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">TruyenM Admin</div>
              <div className="text-xs text-black/50">Trung tâm quản trị</div>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-black/60">
              {user.role}
            </span>
            <span className="text-black/60">{user.username}</span>
            <button
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/60 hover:border-black/20"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="admin-shell grid gap-4 py-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <Sidebar />
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
