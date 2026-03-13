"use client";

import { useQuery } from "@tanstack/react-query";
import StatsCard from "../../../components/StatsCard";
import { adminApi } from "../../../lib/api";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats()
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {isLoading && <div className="text-sm">Loading stats...</div>}
      {error && <div className="text-sm text-red-600">Failed to load stats.</div>}

      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard label="Total users" value={data.users} />
          <StatsCard label="Daily active users" value={data.daily_users} />
          <StatsCard label="Chapters read today" value={data.chapters_read} />
          <StatsCard label="Ad impressions" value={data.ads_impressions} />
          <StatsCard label="Points distributed" value={data.points_distributed} />
          <StatsCard label="Total comics" value={data.total_comics || 0} />
        </div>
      )}
    </div>
  );
}
