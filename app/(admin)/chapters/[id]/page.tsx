"use client";

import { useEffect, useState } from "react";
import { adminApi, apiFetch } from "../../../../lib/api";
import { toast } from "sonner";

type Chapter = {
  id: number;
  comic_id: number;
  chapter_number: number;
  title?: string;
  content_url?: string;
  page_count?: number;
  created_at?: string;
  updated_at?: string;
};

export default function ChapterPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const formatDate = (value?: string | null) => {
    if (!value) return "Chưa có dữ liệu";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
    return date.toLocaleString("vi-VN");
  };

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    apiFetch<Chapter>(`/api/chapter/${id}`).then((data) => {
      setChapter(data);
      setTitle(data.title || "");
      setContentUrl(data.content_url || "");
      setPageCount(data.page_count || 0);
      setCreatedAt(data.created_at || null);
      setUpdatedAt(data.updated_at || null);
    });
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminApi.chapters.update(id, { title, content_url: contentUrl, page_count: pageCount });
      toast.success("Đã cập nhật chương");
    } catch {
      toast.error("Không thể cập nhật chương");
    }
  }

  async function handleUpload() {
    if (!files || files.length === 0) return;
    setUploading(true);
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    try {
      await adminApi.chapters.upload(id, form);
      toast.success("Tải lên thành công");
    } catch {
      toast.error("Tải lên thất bại");
    } finally {
      setUploading(false);
    }
  }

  if (!chapter) return <div className="text-sm">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Chương {chapter.chapter_number}</h1>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lưu lượng & tương tác</h2>
        <span className="text-xs text-black/50">Dữ liệu sẽ cập nhật khi có tracking.</span>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4 text-sm">
          <div className="text-xs text-black/50">Tổng lượt xem</div>
          <div className="text-lg font-semibold">Chưa có dữ liệu</div>
        </div>
        <div className="card p-4 text-sm">
          <div className="text-xs text-black/50">Lượt xem 7 ngày</div>
          <div className="text-lg font-semibold">Chưa có dữ liệu</div>
        </div>
        <div className="card p-4 text-sm">
          <div className="text-xs text-black/50">Theo dõi</div>
          <div className="text-lg font-semibold">Chưa có dữ liệu</div>
        </div>
        <div className="card p-4 text-sm">
          <div className="text-xs text-black/50">Yêu thích</div>
          <div className="text-lg font-semibold">Chưa có dữ liệu</div>
        </div>
      </div>

      <div className="card space-y-2 p-4 text-sm">
        <div className="text-sm font-semibold">Thông tin sửa đổi</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-black/50">Tạo lúc</div>
            <div className="text-sm font-medium">{formatDate(createdAt)}</div>
          </div>
          <div>
            <div className="text-xs text-black/50">Cập nhật gần nhất</div>
            <div className="text-sm font-medium">{formatDate(updatedAt)}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="card space-y-4 p-4">
        <h2 className="text-lg font-semibold">Thông tin chương</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span>Tiêu đề chương</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Tiêu đề chương"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề"
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Đường dẫn nội dung</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Đường dẫn nội dung"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="Ví dụ: /comics/1/chapters/1"
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Số trang</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              type="number"
              title="Số trang"
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
            />
          </label>
        </div>
        <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" type="submit">
          Lưu thay đổi
        </button>
      </form>

      <div className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Tải lên trang ảnh</h2>
        <div
          className="rounded-lg border border-dashed border-black/20 bg-black/[0.02] px-4 py-6 text-sm text-black/60"
          tabIndex={0}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
            if (dropped.length > 0) {
              setFiles((prev) => [...prev, ...dropped]);
            }
          }}
          onPaste={(e) => {
            const items = Array.from(e.clipboardData.items || []);
            const pasted = items
              .filter((item) => item.type.startsWith("image/"))
              .map((item) => item.getAsFile())
              .filter(Boolean) as File[];
            if (pasted.length > 0) {
              setFiles((prev) => [...prev, ...pasted]);
            }
          }}
        >
          Kéo thả ảnh vào đây hoặc bấm vào khung rồi dán ảnh từ clipboard.
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const picked = Array.from(e.target.files || []);
            if (picked.length > 0) setFiles((prev) => [...prev, ...picked]);
          }}
        />
        {files.length > 0 ? (
          <div className="space-y-1 text-xs text-black/60">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between">
                <span>{file.name}</span>
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-black/50">Chưa có ảnh nào được chọn.</div>
        )}
        <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Đang tải lên..." : "Tải lên"}
        </button>
      </div>
    </div>
  );
}
