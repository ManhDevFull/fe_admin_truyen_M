"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api";
import { useAdminAuth } from "../../../lib/store";
import { toast } from "sonner";

export default function SettingsPage() {
  const user = useAdminAuth((s) => s.user);
  const [role, setRole] = useState("admin");
  const [newPerm, setNewPerm] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["permissions", role],
    queryFn: () => adminApi.permissions.list(role),
    enabled: !!role
  });

  useEffect(() => {
    if (user?.role === "owner") {
      setRole("admin");
    }
  }, [user?.role]);

  if (user?.role !== "owner") {
    return <div className="text-sm text-red-600">Owner only</div>;
  }

  const perms = (data as any)?.data || [];

  async function handleGrant() {
    if (!newPerm) return;
    await adminApi.permissions.update(role, newPerm, true);
    setNewPerm("");
    toast.success("Permission granted");
    refetch();
  }

  async function handleRevoke(permission: string) {
    await adminApi.permissions.update(role, permission, false);
    toast.success("Permission revoked");
    refetch();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="card space-y-3 p-4">
        <label className="text-sm">Role</label>
        <select className="rounded-lg border border-black/20 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
          {["owner", "admin", "staff", "moderator", "user"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input className="flex-1 rounded-lg border border-black/20 px-3 py-2 text-sm" placeholder="permission string" value={newPerm} onChange={(e) => setNewPerm(e.target.value)} />
          <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" onClick={handleGrant}>
            Grant
          </button>
        </div>

        <div className="space-y-2 text-sm">
          {perms.map((p: any) => (
            <div key={p.permission} className="flex items-center justify-between rounded-lg border border-black/5 px-3 py-2">
              <span>{p.permission}</span>
              {role !== "owner" && (
                <button className="text-xs text-red-600" onClick={() => handleRevoke(p.permission)}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
