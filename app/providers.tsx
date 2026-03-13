"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { API_BASE, adminApi } from "../lib/api";
import { useAdminAuth } from "../lib/store";

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const setAuth = useAdminAuth((s) => s.setAuth);
  const setPermissions = useAdminAuth((s) => s.setPermissions);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include"
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.token && data?.user) {
          setAuth(data.token, data.user);
          try {
            const perms = await adminApi.permissions.list(data.user.role);
            setPermissions((perms as any).data?.map((p: { permission: string }) => p.permission) || []);
          } catch {
            setPermissions([]);
          }
        }
      } catch {
        // ignore
      }
    };
    run();
  }, [setAuth]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
