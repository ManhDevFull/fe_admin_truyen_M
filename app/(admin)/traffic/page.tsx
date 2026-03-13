"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api";
import DataTable from "../../../components/DataTable";

export default function TrafficPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-traffic"],
    queryFn: () => adminApi.traffic("30d")
  });

  const top = (data as any)?.top_comics || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Traffic</h1>
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Top Comics</h2>
        <DataTable
          columns={[
            { header: "Comic", key: "title", render: (c: any) => c.title },
            { header: "Views", key: "views", render: (c: any) => c.view_count }
          ]}
          data={top}
          page={1}
          total={top.length}
          limit={top.length || 1}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
