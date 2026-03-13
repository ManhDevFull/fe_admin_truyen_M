"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api";

export default function LogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => adminApi.logs({ limit: 50 })
  });

  const logs = (data as any)?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">System Logs</h1>
      {isLoading && <div className="text-sm">Loading...</div>}
      <div className="card space-y-2 p-4 text-xs">
        {logs.map((log: any) => (
          <div key={log.id} className="border-b border-black/5 pb-2">
            <div className="text-black/60">{log.created_at}</div>
            <div className="font-medium">{log.action}</div>
            <div>{log.detail}</div>
          </div>
        ))}
        {logs.length === 0 && !isLoading && <div className="text-black/50">No logs.</div>}
      </div>
    </div>
  );
}
