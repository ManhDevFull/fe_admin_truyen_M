"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import DataTable from "../../../components/DataTable";
import { adminApi } from "../../../lib/api";

type Comic = {
  id: number;
  title: string;
  author?: string;
  content_type?: string;
  status?: string;
  views?: number;
};

export default function ComicsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comics", page, query],
    queryFn: () => adminApi.comics.list({ page, q: query, limit: 20 })
  });

  const comics = (data as any)?.data || [];
  const total = (data as any)?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý truyện</h1>
        <Link href="/comics/new" className="rounded-lg bg-ink px-3 py-2 text-sm text-white">
          Thêm truyện mới
        </Link>
      </div>

      <DataTable<Comic>
        columns={[
          {
            header: "Tiêu đề",
            key: "title",
            render: (c) => (
              <Link href={`/comics/${c.id}`} className="font-medium hover:underline">
                {c.title}
              </Link>
            )
          },
          { header: "Tác giả", key: "author", render: (c) => c.author || "Chưa rõ" },
          {
            header: "Loại",
            key: "content_type",
            render: (c) => (c.content_type === "novel" ? "Truyện chữ" : "Truyện tranh")
          },
          { header: "Trạng thái", key: "status", render: (c) => c.status || "ongoing" },
          { header: "Lượt xem", key: "views", render: (c) => c.views || 0 }
        ]}
        data={comics}
        page={page}
        total={total}
        limit={20}
        loading={isLoading}
        onPageChange={setPage}
        onSearch={(value) => {
          setQuery(value);
          setPage(1);
        }}
        searchPlaceholder="Tìm truyện..."
      />
    </div>
  );
}
