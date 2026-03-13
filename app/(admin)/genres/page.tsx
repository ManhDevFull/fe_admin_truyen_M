"use client";

import { useMemo, useState, useEffect, FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../../components/DataTable";
import RoleGate from "../../../components/RoleGate";
import { adminApi } from "../../../lib/api";

const PAGE_SIZE = 20;

type Genre = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  comic_count: number;
  created_at: string;
  updated_at: string;
};

export default function GenresPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-genres", page, query, status],
    queryFn: () => adminApi.genres.list({ page, q: query, status, limit: PAGE_SIZE })
  });

  const genres = (data as any)?.data || [];
  const total = (data as any)?.total || 0;

  useEffect(() => {
    if (!editingId) return;
    const target = genres.find((g: Genre) => g.id === editingId);
    if (!target) return;
    setName(target.name);
    setSlug(target.slug);
    setIsActive(target.is_active);
  }, [editingId, genres]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setIsActive(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Tên thể loại",
        key: "name",
        render: (g: Genre) => (
          <div>
            <div className="font-medium">{g.name}</div>
            <div className="text-xs text-black/50">/{g.slug}</div>
          </div>
        )
      },
      {
        header: "Trạng thái",
        key: "status",
        render: (g: Genre) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${g.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
          >
            {g.is_active ? "Đang hoạt động" : "Đang ẩn"}
          </span>
        )
      },
      {
        header: "Số truyện",
        key: "count",
        render: (g: Genre) => g.comic_count
      },
      {
        header: "Thao tác",
        key: "actions",
        render: (g: Genre) => (
          <div className="flex flex-wrap gap-2 text-xs">
            <RoleGate permission="admin.genres.write">
              <button
                className="rounded-md border border-black/10 px-2 py-1"
                onClick={() => setEditingId(g.id)}
              >
                Chỉnh sửa
              </button>
            </RoleGate>
            <RoleGate permission="admin.genres.write">
              <button
                className="rounded-md border border-black/10 px-2 py-1"
                onClick={async () => {
                  try {
                    await adminApi.genres.update(g.id, { is_active: !g.is_active });
                    toast.success(g.is_active ? "Đã ẩn thể loại." : "Đã kích hoạt thể loại.");
                    refetch();
                  } catch (err: any) {
                    toast.error(err?.message || "Không thể cập nhật trạng thái.");
                  }
                }}
              >
                {g.is_active ? "Ẩn" : "Kích hoạt"}
              </button>
            </RoleGate>
          </div>
        )
      }
    ],
    [refetch]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thể loại.");
      return;
    }

    const payload: Record<string, unknown> = {
      name: name.trim(),
      is_active: isActive
    };
    if (slug.trim()) {
      payload.slug = slug.trim();
    }

    setSaving(true);
    try {
      if (editingId) {
        await adminApi.genres.update(editingId, payload);
        toast.success("Đã cập nhật thể loại.");
      } else {
        await adminApi.genres.create(payload);
        toast.success("Đã tạo thể loại mới.");
      }
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu thể loại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Quản lý thể loại</h1>
        <p className="text-sm text-black/60">
          Thêm mới, chỉnh sửa, bật/tắt hiển thị và theo dõi số lượng truyện theo từng thể loại.
        </p>
      </div>

      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase text-black/60">
            {editingId ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
          </h2>
          {editingId && (
            <button className="text-xs text-black/60 hover:text-black" onClick={resetForm}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên thể loại"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug (tự động nếu bỏ trống)"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Đang hoạt động
            </label>
            <RoleGate permission="admin.genres.write">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {editingId ? "Lưu" : "Tạo"}
              </button>
            </RoleGate>
          </div>
        </form>
      </div>

      <div className="card space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên hoặc slug..."
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đang ẩn</option>
          </select>
        </div>

        <DataTable<Genre>
          columns={columns}
          data={genres}
          page={page}
          total={total}
          limit={PAGE_SIZE}
          loading={isLoading}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
