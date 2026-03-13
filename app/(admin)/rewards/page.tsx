"use client";

import { useState } from "react";
import { adminApi } from "../../../lib/api";
import { toast } from "sonner";

export default function RewardsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleDistribute() {
    setLoading(true);
    try {
      const res = await adminApi.rewards.distribute();
      setResult(JSON.stringify(res));
      toast.success("Rewards distributed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rewards</h1>
      <button
        onClick={handleDistribute}
        disabled={loading}
        className="rounded-lg bg-ink px-4 py-2 text-sm text-white"
      >
        {loading ? "Processing..." : "Distribute Daily Rewards"}
      </button>
      {result && <pre className="text-xs text-black/60">{result}</pre>}
    </div>
  );
}
