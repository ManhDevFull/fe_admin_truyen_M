"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import DataTable from "../../../components/DataTable";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { adminApi } from "../../../lib/api";
import RoleGate from "../../../components/RoleGate";
import { useAdminAuth } from "../../../lib/store";

type User = {
  id: number;
  username: string;
  email: string;
  points: number;
  role: string;
  is_banned: boolean;
  ban_reason?: string;
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const currentRole = useAdminAuth((s) => s.user?.role);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", page, query],
    queryFn: () => adminApi.users.list({ page, q: query, limit: 20 })
  });

  const users = (data as any)?.data || [];
  const total = (data as any)?.total || 0;

  const roleOptions = useMemo(() => {
    if (currentRole === "owner") return ["admin", "staff", "moderator", "user"];
    return ["staff", "moderator", "user"];
  }, [currentRole]);

  const columns = useMemo(
    () => [
      {
        header: "Người dùng",
        key: "user",
        render: (u: User) => (
          <div>
            <Link href={`/users/${u.id}`} className="font-medium hover:underline">
              {u.username}
            </Link>
            <div className="text-xs text-black/50">{u.email}</div>
          </div>
        )
      },
      { header: "Vai trò", key: "role", render: (u: User) => u.role },
      { header: "Điểm", key: "points", render: (u: User) => u.points },
      {
        header: "Trạng thái",
        key: "status",
        render: (u: User) => (
          <span className={`rounded-full px-2 py-1 text-xs ${u.is_banned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {u.is_banned ? "Bị khóa" : "Hoạt động"}
          </span>
        )
      },
      {
        header: "Thao tác",
        key: "actions",
        render: (u: User) => (
          <div className="flex gap-2 text-xs">
            <RoleGate permission="admin.users.ban">
              <button
                className="rounded-md border border-black/10 px-2 py-1"
                onClick={() => setBanTarget(u)}
              >
                {u.is_banned ? "Mở khóa" : "Khóa"}
              </button>
            </RoleGate>
            <RoleGate permission="admin.users.role">
              <select
                className="rounded-md border border-black/10 px-2 py-1"
                value={u.role}
                onChange={async (e) => {
                  await adminApi.users.changeRole(u.id, e.target.value);
                  refetch();
                }}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </RoleGate>
          </div>
        )
      }
    ],
    [refetch, roleOptions]
  );

  async function handleBanConfirm() {
    if (!banTarget) return;
    if (banTarget.is_banned) {
      await adminApi.users.unban(banTarget.id);
    } else {
      await adminApi.users.ban(banTarget.id, "admin action");
    }
    setBanTarget(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
        <div className="text-sm text-black/60">
          Cấp bậc: Chủ web (owner) &gt; Quản trị (admin) &gt; Nhân viên (staff) &gt; Kiểm duyệt (moderator) &gt; Người dùng (user)
        </div>
      </div>

      <DataTable<User>
        columns={columns}
        data={users}
        page={page}
        total={total}
        limit={20}
        loading={isLoading}
        onPageChange={setPage}
        onSearch={(value) => {
          setQuery(value);
          setPage(1);
        }}
        searchPlaceholder="Tìm theo tên hoặc email..."
      />

      <ConfirmDialog
        open={!!banTarget}
        title={banTarget?.is_banned ? "Mở khóa người dùng?" : "Khóa người dùng?"}
        description={banTarget?.username || ""}
        onCancel={() => setBanTarget(null)}
        onConfirm={handleBanConfirm}
      />
    </div>
  );
}
