"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, adminApi } from "../../../lib/api";
import { useAdminAuth } from "../../../lib/store";
import { toast } from "sonner";

type AuthResponse = {
  token: string;
  user: { id: number; username: string; email: string; role: string };
};

export default function LoginClient() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAdminAuth((s) => s.setAuth);
  const setPermissions = useAdminAuth((s) => s.setPermissions);
  const token = useAdminAuth((s) => s.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/dashboard";
  const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  useEffect(() => {
    if (token) {
      router.replace(safeRedirect);
    }
  }, [token, router, safeRedirect]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const identifierValue = (form.get("identifier") || identifier).toString().trim();
      const passwordValue = (form.get("password") || password).toString();
      const res = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: identifierValue, password: passwordValue })
      });
      setAuth(res.token, res.user);
      try {
        const perms = await adminApi.permissions.list(res.user.role);
        setPermissions((perms as any).data?.map((p: { permission: string }) => p.permission) || []);
      } catch {
        setPermissions([]);
      }
      toast.success("Login success");
      router.replace(safeRedirect);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <h1 className="text-xl font-semibold">Đăng nhập quản trị</h1>
        <input
          name="identifier"
          className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm"
          placeholder="Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          name="password"
          className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm text-white"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
