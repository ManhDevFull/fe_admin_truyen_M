"use client";

import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { adminApi } from "../../../lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type DailyPoint = { day: string; count: number };
type AnalyticsResponse = {
  daily_users?: DailyPoint[];
  daily_chapters?: DailyPoint[];
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.analytics("30d")
  });

  const dailyUsers = (data as any)?.daily_users || [];
  const dailyChapters = (data as any)?.daily_chapters || [];

  const labels = dailyUsers.map((d: any) => d.day);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {isLoading && <div className="text-sm">Loading...</div>}

      {data && (
        <div className="card p-4">
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "DAU",
                  data: dailyUsers.map((d: any) => d.count),
                  borderColor: "#0f172a",
                  backgroundColor: "rgba(15, 23, 42, 0.2)"
                },
                {
                  label: "Chapters Read",
                  data: dailyChapters.map((d: any) => d.count),
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37, 99, 235, 0.2)"
                }
              ]
            }}
            options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
          />
        </div>
      )}
    </div>
  );
}
