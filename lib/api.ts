import { API_BASE } from "./constants";
import { useAdminAuth } from "./store";

export { API_BASE };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAdminAuth.getState().token;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (res.status === 401 && path !== "/api/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryToken = useAdminAuth.getState().token;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(retryToken ? { Authorization: `Bearer ${retryToken}` } : {}),
          ...(init?.headers || {})
        },
        cache: "no-store"
      });
      if (retry.ok) {
        return (await retry.json()) as T;
      }
    }
  }

  if (!res.ok) {
    const message = await safeText(res);
    throw new Error(message || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.token && data?.user) {
      useAdminAuth.getState().setAuth(data.token, data.user);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const adminApi = {
  stats: () => apiFetch<{ users: number; daily_users: number; chapters_read: number; ads_impressions: number; points_distributed: number; total_comics?: number; open_tickets?: number }>("/api/admin/stats"),
  analytics: (range?: string, start?: string, end?: string) =>
    apiFetch(`/api/admin/analytics${buildQuery({ range, start, end })}`),
  traffic: (range?: string) => apiFetch(`/api/admin/traffic${buildQuery({ range })}`),
  users: {
    list: (params: { q?: string; role?: string; page?: number; limit?: number; banned?: string } = {}) =>
      apiFetch(`/api/admin/users${buildQuery(params)}`),
    get: (id: number) => apiFetch(`/api/admin/users/${id}`),
    ban: (user_id: number, reason?: string, expires_at?: string) =>
      apiFetch("/api/admin/user/ban", { method: "POST", body: JSON.stringify({ user_id, reason, expires_at }) }),
    unban: (user_id: number) =>
      apiFetch("/api/admin/user/unban", { method: "POST", body: JSON.stringify({ user_id }) }),
    resetPoints: (user_id: number) =>
      apiFetch("/api/admin/user/reset-points", { method: "POST", body: JSON.stringify({ user_id }) }),
    changeRole: (user_id: number, role: string) =>
      apiFetch("/api/admin/user/role", { method: "POST", body: JSON.stringify({ user_id, role }) }),
    manualPoints: (user_id: number, points: number, note?: string) =>
      apiFetch("/api/admin/user/points", { method: "POST", body: JSON.stringify({ user_id, points, note }) })
  },
  comics: {
    list: (params: { q?: string; status?: string; page?: number; limit?: number } = {}) =>
      apiFetch(`/api/admin/comics${buildQuery(params)}`),
    create: (payload: Record<string, unknown>) =>
      apiFetch("/api/admin/comic", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: Record<string, unknown>) =>
      apiFetch(`/api/admin/comic/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id: number) =>
      apiFetch(`/api/admin/comic/${id}`, { method: "DELETE" })
  },
  chapters: {
    create: (comicId: number, payload: Record<string, unknown>) =>
      apiFetch<{ id: number }>(`/api/admin/comic/${comicId}/chapter`, {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    update: (id: number, payload: Record<string, unknown>) =>
      apiFetch(`/api/admin/chapter/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id: number) =>
      apiFetch(`/api/admin/chapter/${id}`, { method: "DELETE" }),
    upload: (id: number, formData: FormData) =>
      fetch(`${API_BASE}/api/admin/chapter/${id}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          ...(useAdminAuth.getState().token ? { Authorization: `Bearer ${useAdminAuth.getState().token}` } : {})
        }
      }).then(async (res) => {
        if (!res.ok) throw new Error(await safeText(res));
        return res.json();
      })
  },
  crawler: {
    runNow: (comicId: number) => apiFetch(`/api/admin/comic/${comicId}/crawler/run`, { method: "POST" }),
    logs: (comicId: number, params: { page?: number; limit?: number } = {}) =>
      apiFetch(`/api/admin/comic/${comicId}/crawler/logs${buildQuery(params)}`)
  },
  ads: {
    stats: (range?: string, start?: string, end?: string) =>
      apiFetch(`/api/admin/ads/stats${buildQuery({ range, start, end })}`),
    update: (date: string, payload: { impressions: number; revenue: number }) =>
      apiFetch(`/api/admin/ads/stat/${date}`, { method: "PUT", body: JSON.stringify(payload) }),
    settings: () => apiFetch("/api/admin/ads/settings"),
    updateSettings: (payload: { adsense_enabled: boolean }) =>
      apiFetch("/api/admin/ads/settings", { method: "PUT", body: JSON.stringify(payload) }),
    direct: {
      list: (params: { page?: number; limit?: number } = {}) =>
        apiFetch(`/api/admin/ads/direct${buildQuery(params)}`),
      create: (payload: Record<string, unknown>) =>
        apiFetch("/api/admin/ads/direct", { method: "POST", body: JSON.stringify(payload) }),
      update: (id: number, payload: Record<string, unknown>) =>
        apiFetch(`/api/admin/ads/direct/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
      remove: (id: number) =>
        apiFetch(`/api/admin/ads/direct/${id}`, { method: "DELETE" })
    }
  },
  rewards: {
    distribute: () => apiFetch("/api/admin/reward/distribute", { method: "POST" })
  },
  support: {
    list: (params: { status?: string; page?: number; limit?: number } = {}) =>
      apiFetch(`/api/support/tickets${buildQuery(params)}`),
    get: (id: number) => apiFetch(`/api/support/ticket/${id}`),
    reply: (id: number, body: string) =>
      apiFetch(`/api/support/ticket/${id}/reply`, { method: "POST", body: JSON.stringify({ body }) }),
    close: (id: number) =>
      apiFetch(`/api/support/ticket/${id}/close`, { method: "POST" })
  },
  permissions: {
    list: (role?: string) => apiFetch(`/api/admin/permissions${buildQuery({ role })}`),
    update: (role: string, permission: string, granted: boolean) =>
      apiFetch("/api/admin/permission", { method: "PUT", body: JSON.stringify({ role, permission, granted }) })
  },
  genres: {
    list: (params: { q?: string; status?: string; page?: number; limit?: number } = {}) =>
      apiFetch(`/api/admin/genres${buildQuery(params)}`),
    create: (payload: Record<string, unknown>) =>
      apiFetch("/api/admin/genre", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: Record<string, unknown>) =>
      apiFetch(`/api/admin/genre/${id}`, { method: "PUT", body: JSON.stringify(payload) })
  },
  logs: (params: { page?: number; limit?: number } = {}) =>
    apiFetch(`/api/admin/logs${buildQuery(params)}`)
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
  return `?${qs}`;
}
