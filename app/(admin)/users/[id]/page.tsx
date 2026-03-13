"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../../lib/api";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const userId = Number(params.id);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminApi.users.get(userId),
    enabled: Number.isFinite(userId)
  });

  if (isLoading) return <div className="text-sm">Loading...</div>;
  if (!data) return <div className="text-sm text-red-600">User not found.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User Detail</h1>
      <div className="card space-y-2 p-4 text-sm">
        <div>Username: {(data as any).user?.username}</div>
        <div>Email: {(data as any).user?.email}</div>
        <div>Role: {(data as any).user?.role}</div>
        <div>Points: {(data as any).user?.points}</div>
        <div>Chapters read: {(data as any).chapters_read}</div>
        <div>Total points: {(data as any).total_points}</div>
      </div>
    </div>
  );
}
