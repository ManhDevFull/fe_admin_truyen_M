"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "../../../lib/api";

export default function SupportPage() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets", status],
    queryFn: () => adminApi.support.list({ status })
  });

  const tickets = (data as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Support Tickets</h1>
        <select className="rounded-lg border border-black/20 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading && <div className="text-sm">Loading...</div>}
      <div className="grid gap-3">
        {tickets.map((t: any) => (
          <Link key={t.id} href={`/support/${t.id}`} className="card flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{t.subject}</p>
              <p className="text-xs text-black/50">User #{t.user_id}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${t.status === "closed" ? "bg-black/10 text-black/60" : "bg-green-100 text-green-700"}`}>
              {t.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
