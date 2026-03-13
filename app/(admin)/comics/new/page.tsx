"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../../lib/api";
import { toast } from "sonner";

export default function NewComicPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [contentType, setContentType] = useState("comic");
  const [status, setStatus] = useState("ongoing");
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const [crawlerEnabled, setCrawlerEnabled] = useState(false);
  const [crawlerMode, setCrawlerMode] = useState(1);
  const [crawlerSourceUrl, setCrawlerSourceUrl] = useState("");
  const [crawlerIntervalMinutes, setCrawlerIntervalMinutes] = useState(0);
  const [crawlerWeekdays, setCrawlerWeekdays] = useState<number[]>([]);
  const router = useRouter();
  const { data: genreData } = useQuery({
    queryKey: ["admin-genres"],
    queryFn: () => adminApi.genres.list()
  });
  const genres = (genreData as any)?.data || [];
  const weekdays = [
    { value: 1, label: "Thứ 2" },
    { value: 2, label: "Thứ 3" },
    { value: 3, label: "Thứ 4" },
    { value: 4, label: "Thứ 5" },
    { value: 5, label: "Thứ 6" },
    { value: 6, label: "Thứ 7" },
    { value: 7, label: "Chủ nhật" }
  ];

  useEffect(() => {
    if (crawlerMode === 1) {
      setCrawlerIntervalMinutes(0);
    }
    if (crawlerMode === 2 && crawlerIntervalMinutes === 0) {
      setCrawlerIntervalMinutes(30);
    }
    if (crawlerMode === 3 && crawlerIntervalMinutes === 0) {
      setCrawlerIntervalMinutes(10);
    }
  }, [crawlerMode, crawlerIntervalMinutes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const comic = await adminApi.comics.create({
        title,
        author,
        description,
        cover,
        status,
        content_type: contentType,
        genre_ids: genreIds,
        crawler_enabled: crawlerEnabled,
        crawler_mode: crawlerMode,
        crawler_source_url: crawlerSourceUrl,
        crawler_interval_minutes: crawlerIntervalMinutes,
        crawler_weekdays: crawlerWeekdays
      });
      toast.success("Đã tạo truyện");
      router.push(`/comics/${(comic as any).id}`);
    } catch {
      toast.error("Tạo truyện thất bại");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thêm truyện mới</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span>Tiêu đề truyện</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              placeholder="Nhập tiêu đề"
              title="Tiêu đề truyện"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Tác giả</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              placeholder="Tên tác giả"
              title="Tác giả"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Ảnh bìa</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              placeholder="Đường dẫn ảnh bìa"
              title="Ảnh bìa"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Loại truyện</span>
            <select
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Loại truyện"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="comic">Truyện tranh</option>
              <option value="novel">Truyện chữ</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Trạng thái</span>
            <select
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Trạng thái phát hành"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ongoing">Đang ra</option>
              <option value="completed">Hoàn thành</option>
              <option value="paused">Tạm dừng</option>
              <option value="dropped">Ngừng</option>
            </select>
          </label>
        </div>

        <label className="space-y-1 text-sm font-medium">
          <span>Mô tả</span>
          <textarea
            className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
            placeholder="Tóm tắt nội dung"
            title="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="space-y-2">
          <div className="text-sm font-medium">Thể loại</div>
          {genres.length === 0 ? (
            <div className="text-xs text-black/50">Chưa có thể loại, bạn có thể bổ sung sau.</div>
          ) : (
            <div className="grid gap-2 md:grid-cols-3">
              {genres.map((g: any) => (
                <label key={g.id} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    checked={genreIds.includes(g.id)}
                    onChange={() =>
                      setGenreIds((prev) =>
                        prev.includes(g.id) ? prev.filter((id) => id !== g.id) : [...prev, g.id]
                      )
                    }
                  />
                  <span>{g.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Cấu hình crawler</div>
          <label className="space-y-1 text-sm font-medium">
            <span>Link nguồn truyện</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              placeholder="Ví dụ: https://truyenqq.com.vn/vo-luyen-dinh-phong/chapter-3857"
              title="Link nguồn để crawler"
              value={crawlerSourceUrl}
              onChange={(e) => setCrawlerSourceUrl(e.target.value)}
            />
          </label>
          <div className="text-xs text-black/50">
            Có thể dán link chapter, hệ thống tự nhận và lưu link truyện gốc để theo dõi.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium">
              <span>Chế độ crawler</span>
              <select
                className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
                title="Chế độ crawler"
                value={crawlerMode}
                onChange={(e) => setCrawlerMode(Number(e.target.value))}
              >
                <option value={1}>Chế độ 1: Đồng bộ toàn bộ khi tạo</option>
                <option value={2}>Chế độ 2: Theo dõi hằng ngày</option>
                <option value={3}>Chế độ 3: Theo lịch đăng</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>Chu kỳ chạy (phút)</span>
              <input
                className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
                type="number"
                min={0}
                title="Chu kỳ chạy"
                value={crawlerIntervalMinutes}
                onChange={(e) => setCrawlerIntervalMinutes(Number(e.target.value))}
              />
              <span className="text-xs text-black/50">Chế độ 2 mặc định 30 phút, chế độ 3 mặc định 10 phút.</span>
            </label>
          </div>

          {crawlerMode === 3 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Ngày chạy theo lịch</div>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day.value} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs">
                    <input
                      type="checkbox"
                      checked={crawlerWeekdays.includes(day.value)}
                      onChange={() =>
                        setCrawlerWeekdays((prev) =>
                          prev.includes(day.value) ? prev.filter((d) => d !== day.value) : [...prev, day.value]
                        )
                      }
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={crawlerEnabled} onChange={(e) => setCrawlerEnabled(e.target.checked)} />
            <span>{crawlerMode === 1 ? "Chạy đồng bộ ngay sau khi tạo" : "Bật tự động theo dõi chương mới"}</span>
          </label>
          <div className="text-xs text-black/50">
            Chế độ 1 chỉ chạy một lần khi bật. Chế độ 2/3 sẽ chạy theo lịch đã chọn.
          </div>
        </div>

        <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" type="submit">
          Tạo truyện
        </button>
      </form>
    </div>
  );
}
