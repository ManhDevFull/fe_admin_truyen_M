"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../../lib/api";
import { toast } from "sonner";

export default function SupportDetailPage({ params }: { params: { id: string } }) {
  const ticketId = Number(params.id);
  const [message, setMessage] = useState("");

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["support-ticket", ticketId],
    queryFn: () => adminApi.support.get(ticketId),
    enabled: Number.isFinite(ticketId)
  });

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    await adminApi.support.reply(ticketId, message);
    setMessage("");
    toast.success("Reply sent");
    refetch();
  }

  if (isLoading) return <div className="text-sm">Loading...</div>;
  if (!data) return <div className="text-sm text-red-600">Ticket not found.</div>;

  const ticket = data as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
        <p className="text-sm text-black/50">Status: {ticket.status}</p>
      </div>

      <div className="card space-y-3 p-4">
        {(ticket.messages || []).map((m: any) => (
          <div key={m.id} className={`rounded-lg p-3 text-sm ${m.is_admin_reply ? "bg-black/5" : "bg-white"}`}>
            <div className="text-xs text-black/50">User #{m.user_id}</div>
            <div>{m.body}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="card space-y-3 p-4">
        <textarea
          className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm"
          placeholder="Reply..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" type="submit">
            Reply
          </button>
          <button
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            type="button"
            onClick={() => adminApi.support.close(ticketId).then(() => refetch())}
          >
            Close ticket
          </button>
        </div>
      </form>
    </div>
  );
}
