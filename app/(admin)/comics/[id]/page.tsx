"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, adminApi } from "../../../../lib/api";
import { toast } from "sonner";

type ComicDetail = {
  comic: {
    id: number;
    title: string;
    author?: string;
    description?: string;
    cover?: string;
    status?: string;
    content_type?: string;
    views?: number;
    created_at?: string;
    updated_at?: string;
    crawler_enabled?: boolean;
    crawler_mode?: number;
    crawler_source_url?: string;
    crawler_interval_minutes?: number;
    crawler_weekdays?: number;
    crawler_last_chapter?: number;
    crawler_target_chapter?: number;
    crawler_last_checked_at?: string;
    genres?: { id: number; name: string }[];
  };
  chapters: { id: number; chapter_number: number; title?: string; page_count?: number; created_at?: string; updated_at?: string }[];
};

export default function ComicEditPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [contentType, setContentType] = useState("comic");
  const [status, setStatus] = useState("ongoing");
  const [chapters, setChapters] = useState<ComicDetail["chapters"]>([]);
  const [views, setViews] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [newChapterNumber, setNewChapterNumber] = useState(1);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newContentUrl, setNewContentUrl] = useState("");
  const [newPageCount, setNewPageCount] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [crawlerEnabled, setCrawlerEnabled] = useState(false);
  const [crawlerMode, setCrawlerMode] = useState(1);
  const [crawlerSourceUrl, setCrawlerSourceUrl] = useState("");
  const [crawlerIntervalMinutes, setCrawlerIntervalMinutes] = useState(0);
  const [crawlerWeekdays, setCrawlerWeekdays] = useState<number[]>([]);
  const [crawlerLastChapter, setCrawlerLastChapter] = useState<number | null>(null);
  const [crawlerTargetChapter, setCrawlerTargetChapter] = useState<number | null>(null);
  const [crawlerLastCheckedAt, setCrawlerLastCheckedAt] = useState<string | null>(null);
  const [crawlerLogs, setCrawlerLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);

  const formatDate = (value?: string | null) => {
    if (!value) return "Chưa có dữ liệu";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
    return date.toLocaleString("vi-VN");
  };

  const weekdays = [
    { value: 1, label: "Thứ 2" },
    { value: 2, label: "Thứ 3" },
    { value: 3, label: "Thứ 4" },
    { value: 4, label: "Thứ 5" },
    { value: 5, label: "Thứ 6" },
    { value: 6, label: "Thứ 7" },
    { value: 7, label: "Chủ nhật" }
  ];

  const maskToWeekdays = (mask?: number) => {
    if (!mask) return [];
    const result: number[] = [];
    for (let i = 1; i <= 7; i += 1) {
      if (mask & (1 << (i - 1))) result.push(i);
    }
    return result;
  };

  const weekdaysLabel = crawlerWeekdays
    .map((value) => weekdays.find((d) => d.value === value)?.label)
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    Promise.all([apiFetch<ComicDetail>(`/api/comics/${id}`), adminApi.genres.list()])
      .then(([data, genreData]) => {
        setTitle(data.comic.title || "");
        setAuthor(data.comic.author || "");
        setDescription(data.comic.description || "");
        setCover(data.comic.cover || "");
        setStatus(data.comic.status || "ongoing");
        setContentType(data.comic.content_type || "comic");
        setChapters(data.chapters || []);
        setViews(typeof data.comic.views === "number" ? data.comic.views : null);
        setCreatedAt(data.comic.created_at || null);
        setUpdatedAt(data.comic.updated_at || null);
        setCrawlerEnabled(Boolean(data.comic.crawler_enabled));
        setCrawlerMode(data.comic.crawler_mode ?? 1);
        setCrawlerSourceUrl(data.comic.crawler_source_url || "");
        setCrawlerIntervalMinutes(data.comic.crawler_interval_minutes || 0);
        setCrawlerWeekdays(maskToWeekdays(data.comic.crawler_weekdays));
        setCrawlerLastChapter(
          typeof data.comic.crawler_last_chapter === "number" ? data.comic.crawler_last_chapter : null
        );
        setCrawlerTargetChapter(
          typeof data.comic.crawler_target_chapter === "number" ? data.comic.crawler_target_chapter : null
        );
        setCrawlerLastCheckedAt(data.comic.crawler_last_checked_at || null);
        const nextNumber =
          data.chapters && data.chapters.length > 0
            ? Math.max(...data.chapters.map((ch) => ch.chapter_number)) + 1
            : 1;
        setNewChapterNumber(nextNumber);
        setGenres((genreData as any)?.data || []);
        setGenreIds((data.comic.genres || []).map((g) => g.id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    setLogsLoading(true);
    adminApi.crawler
      .logs(id, { page: logsPage, limit: 10 })
      .then((data: any) => {
        setCrawlerLogs(data?.data || []);
        setLogsTotal(data?.total || 0);
      })
      .finally(() => setLogsLoading(false));
  }, [id, logsPage]);

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

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminApi.comics.update(id, {
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
      toast.success("Đã lưu thay đổi");
    } catch {
      toast.error("Không thể lưu thay đổi");
    }
  }

  async function handleDelete() {
    try {
      await adminApi.comics.remove(id);
      toast.success("Đã xóa truyện");
      router.push("/comics");
    } catch {
      toast.error("Không thể xóa truyện");
    }
  }

  async function handleCreateChapter(e?: React.FormEvent) {
    e?.preventDefault();
    if (contentType === "comic" && newFiles.length === 0) {
      toast.error("Cần chọn ít nhất 1 ảnh để tạo chương");
      return;
    }
    const payload = {
      chapter_number: newChapterNumber,
      title: newChapterTitle,
      content_url: newContentUrl,
      page_count: newPageCount
    };
    try {
      const created = await adminApi.chapters.create(id, payload);
      if (newFiles.length > 0 && created?.id) {
        const form = new FormData();
        newFiles.forEach((file) => form.append("files", file));
        await adminApi.chapters.upload(created.id, form);
      }
      toast.success("Đã tạo chương mới");
      const data = await apiFetch<ComicDetail>(`/api/comics/${id}`);
      setChapters(data.chapters || []);
      const nextNumber =
        data.chapters && data.chapters.length > 0
          ? Math.max(...data.chapters.map((ch) => ch.chapter_number)) + 1
          : newChapterNumber + 1;
      setNewChapterNumber(nextNumber);
      setNewChapterTitle("");
      setNewContentUrl("");
      setNewPageCount(0);
      setNewFiles([]);
    } catch {
      toast.error("Không thể tạo chương");
    }
  }

  async function handleDeleteChapter(chapterId: number) {
    try {
      await adminApi.chapters.remove(chapterId);
      setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
      toast.success("Đã xóa chương");
    } catch {
      toast.error("Không thể xóa chương");
    }
  }

  async function handleRunCrawlerNow() {
    try {
      await adminApi.crawler.runNow(id);
      toast.success("Đã gửi yêu cầu crawler");
      setLogsPage(1);
    } catch {
      toast.error("Không thể chạy crawler ngay");
    }
  }

  if (loading) return <div className="text-sm">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý truyện</h1>
        <button onClick={handleDelete} className="rounded-lg border border-red-500 px-3 py-1 text-sm text-red-600">
          Xóa truyện
        </button>
      </div>

      <form onSubmit={handleUpdate} className="card space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span>Tiêu đề</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Tiêu đề truyện"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Tác giả</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Tác giả"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Ảnh bìa</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Ảnh bìa"
              placeholder="Đường dẫn ảnh bìa"
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
              {genres.map((g) => (
                <label key={g.id} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    checked={genreIds.includes(g.id)}
                    onChange={() =>
                      setGenreIds((prev) =>
                        prev.includes(g.id) ? prev.filter((gid) => gid !== g.id) : [...prev, g.id]
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
            <span>{crawlerMode === 1 ? "Chạy đồng bộ ngay khi bật" : "Bật tự động theo dõi chương mới"}</span>
          </label>
          <div className="text-xs text-black/50">
            Chế độ 1 chỉ chạy một lần khi bật. Chế độ 2/3 sẽ chạy theo lịch đã chọn.
          </div>
        </div>

        <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" type="submit">
          Lưu thay đổi
        </button>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lưu lượng & tương tác</h2>
        <span className="text-xs text-black/50">Dữ liệu sẽ cập nhật khi có tracking.</span>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4 text-sm">
          <div className="text-xs text-black/50">Tổng lượt xem</div>
          <div className="text-lg font-semibold">{views ?? "Chưa có dữ liệu"}</div>
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

      <div className="card space-y-3 p-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Trạng thái crawler</div>
          <button
            onClick={handleRunCrawlerNow}
            className="rounded-lg border border-black/20 px-3 py-1 text-xs hover:border-black/40"
          >
            Chạy ngay
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <div className="text-xs text-black/50">Chế độ</div>
            <div className="text-sm font-medium">
              {crawlerMode === 1 ? "Chế độ 1" : crawlerMode === 2 ? "Chế độ 2" : "Chế độ 3"}
            </div>
          </div>
          <div>
            <div className="text-xs text-black/50">Chu kỳ</div>
            <div className="text-sm font-medium">
              {crawlerIntervalMinutes > 0 ? `${crawlerIntervalMinutes} phút` : "Theo mặc định"}
            </div>
          </div>
          <div>
            <div className="text-xs text-black/50">Lịch đăng</div>
            <div className="text-sm font-medium">
              {crawlerMode === 3 ? weekdaysLabel || "Chưa chọn ngày" : "Không áp dụng"}
            </div>
          </div>
          <div>
            <div className="text-xs text-black/50">Lần chạy gần nhất</div>
            <div className="text-sm font-medium">{formatDate(crawlerLastCheckedAt)}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-black/50">Chương cuối đã lưu</div>
          <div className="text-sm font-medium">{crawlerLastChapter ?? "Chưa có dữ liệu"}</div>
        </div>
        {crawlerMode === 1 && (
          <div>
            <div className="text-xs text-black/50">Mục tiêu đồng bộ</div>
            <div className="text-sm font-medium">
              {crawlerTargetChapter && crawlerTargetChapter > 0 ? `Chương ${crawlerTargetChapter}` : "Không giới hạn"}
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Danh sách chương</h2>
          <span className="text-xs text-black/50">{chapters.length} chương</span>
        </div>

        {chapters.map((ch) => (
          <div key={ch.id} className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div>
                Chương {ch.chapter_number}
                {ch.title ? ` - ${ch.title}` : ""}
              </div>
              <div className="text-xs text-black/50">
                {typeof ch.page_count === "number" ? `Số trang: ${ch.page_count}` : "Số trang: chưa có"} ·{" "}
                {ch.updated_at ? `Cập nhật: ${formatDate(ch.updated_at)}` : "Cập nhật: chưa có"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs text-black/60 hover:underline" onClick={() => router.push(`/chapters/${ch.id}`)}>
                Chi tiết
              </button>
              <button className="text-xs text-red-600 hover:underline" onClick={() => handleDeleteChapter(ch.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Thêm chương mới</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span>Số chương</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              type="number"
              title="Số chương"
              value={newChapterNumber}
              onChange={(e) => setNewChapterNumber(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Tiêu đề chương</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Tiêu đề chương"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Đường dẫn nội dung</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              title="Đường dẫn nội dung"
              value={newContentUrl}
              onChange={(e) => setNewContentUrl(e.target.value)}
              placeholder="Ví dụ: /comics/1/chapters/1"
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Số trang</span>
            <input
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm font-normal"
              type="number"
              title="Số trang"
              value={newPageCount}
              onChange={(e) => setNewPageCount(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Ảnh chương (kéo thả hoặc dán Ctrl+V)</div>
          <div
            className="rounded-lg border border-dashed border-black/20 bg-black/[0.02] px-4 py-6 text-sm text-black/60"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
              if (files.length > 0) {
                setNewFiles((prev) => [...prev, ...files]);
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const items = Array.from(e.clipboardData.items || []);
              const pasted = items
                .filter((item) => item.type.startsWith("image/"))
                .map((item) => item.getAsFile())
                .filter(Boolean) as File[];
              if (pasted.length > 0) {
                setNewFiles((prev) => [...prev, ...pasted]);
              }
            }}
          >
            Kéo thả ảnh vào đây hoặc bấm vào khung rồi dán ảnh từ clipboard.
          </div>
          <input
            className="text-sm"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) setNewFiles((prev) => [...prev, ...files]);
            }}
          />
          {newFiles.length > 0 ? (
            <div className="space-y-1 text-xs text-black/60">
              {newFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-black/50">Chưa có ảnh nào được chọn.</div>
          )}
        </div>
        <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white" type="button" onClick={() => handleCreateChapter()}>
          Tạo chương
        </button>
      </div>

      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nhật ký crawler</h2>
          <span className="text-xs text-black/50">{logsTotal} lượt</span>
        </div>
        {logsLoading ? (
          <div className="text-sm">Đang tải...</div>
        ) : crawlerLogs.length === 0 ? (
          <div className="text-sm text-black/50">Chưa có log crawler.</div>
        ) : (
          <div className="space-y-2 text-sm">
            {crawlerLogs.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 rounded-lg border border-black/10 bg-white px-3 py-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
                  <span>{log.started_at ? formatDate(log.started_at) : "Chưa có thời gian"}</span>
                  <span>•</span>
                  <span>{log.trigger === "manual" ? "Thủ công" : "Tự động"}</span>
                  <span>•</span>
                  <span>{log.mode === 1 ? "Chế độ 1" : log.mode === 2 ? "Chế độ 2" : "Chế độ 3"}</span>
                  <span>•</span>
                  <span>{log.duration_ms ? `${log.duration_ms}ms` : "Chưa có thời lượng"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      log.status === "success"
                        ? "bg-green-100 text-green-700"
                        : log.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {log.status === "success" ? "Thành công" : log.status === "failed" ? "Thất bại" : "Đang chạy"}
                  </span>
                  <span className="text-xs text-black/60">
                    Chương: {log.last_chapter_before ?? 0} → {log.last_chapter_after ?? 0}
                  </span>
                </div>
                {log.message ? <div className="text-xs text-red-600">{log.message}</div> : null}
              </div>
            ))}
          </div>
        )}
        {logsTotal > 10 && (
          <div className="flex items-center justify-end gap-2 text-xs">
            <button
              className="rounded-lg border border-black/20 px-2 py-1 disabled:opacity-50"
              disabled={logsPage <= 1}
              onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <span>
              Trang {logsPage} / {Math.max(1, Math.ceil(logsTotal / 10))}
            </span>
            <button
              className="rounded-lg border border-black/20 px-2 py-1 disabled:opacity-50"
              disabled={logsPage >= Math.ceil(logsTotal / 10)}
              onClick={() => setLogsPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
