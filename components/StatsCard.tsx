"use client";

type StatsCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <div className="card p-4">
      <p className="text-xs text-black/50">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-black/50">{hint}</p>}
    </div>
  );
}
