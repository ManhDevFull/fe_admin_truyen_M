"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api";
import { toast } from "sonner";

export default function AdsPage() {
  const { data, refetch } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: () => adminApi.ads.stats("30d")
  });

  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ["admin-ads-settings"],
    queryFn: () => adminApi.ads.settings()
  });

  const { data: directAdsData, refetch: refetchDirectAds } = useQuery({
    queryKey: ["admin-direct-ads"],
    queryFn: () => adminApi.ads.direct.list({ page: 1, limit: 50 })
  });

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [impressions, setImpressions] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [adsenseEnabled, setAdsenseEnabled] = useState(true);

  const [directTitle, setDirectTitle] = useState("");
  const [directImage, setDirectImage] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [directTracking, setDirectTracking] = useState("");
  const [directActive, setDirectActive] = useState(true);

  useEffect(() => {
    if (settingsData && typeof (settingsData as any).adsense_enabled === "boolean") {
      setAdsenseEnabled((settingsData as any).adsense_enabled);
    }
  }, [settingsData]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    await adminApi.ads.update(date, { impressions, revenue });
    toast.success("Ads stat updated");
    refetch();
  }

  async function handleToggleAdsense(value: boolean) {
    setAdsenseEnabled(value);
    try {
      await adminApi.ads.updateSettings({ adsense_enabled: value });
      toast.success("Đã cập nhật trạng thái AdSense");
      refetchSettings();
    } catch {
      toast.error("Không thể cập nhật AdSense");
    }
  }

  async function handleCreateDirectAd(e: React.FormEvent) {
    e.preventDefault();
    if (!directTitle || !directImage || !directLink) {
      toast.error("Cần nhập đầy đủ tiêu đề, link ảnh và link đích");
      return;
    }
    try {
      await adminApi.ads.direct.create({
        title: directTitle,
        image_url: directImage,
        link_url: directLink,
        tracking_key: directTracking,
        is_active: directActive
      });
      toast.success("Đã tạo quảng cáo");
      setDirectTitle("");
      setDirectImage("");
      setDirectLink("");
      setDirectTracking("");
      setDirectActive(true);
      refetchDirectAds();
    } catch {
      toast.error("Không thể tạo quảng cáo");
    }
  }

  async function handleToggleDirectAd(id: number, isActive: boolean) {
    try {
      await adminApi.ads.direct.update(id, { is_active: isActive });
      toast.success("Đã cập nhật quảng cáo");
      refetchDirectAds();
    } catch {
      toast.error("Không thể cập nhật quảng cáo");
    }
  }

  async function handleDeleteDirectAd(id: number) {
    try {
      await adminApi.ads.direct.remove(id);
      toast.success("Đã xóa quảng cáo");
      refetchDirectAds();
    } catch {
      toast.error("Không thể xóa quảng cáo");
    }
  }

  const directAds = ((directAdsData as any)?.data || []) as Array<{
    id: number;
    title: string;
    image_url: string;
    link_url: string;
    tracking_key?: string;
    is_active: boolean;
  }>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Quản lý quảng cáo</h1>

      <div className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Google AdSense</h2>
        <div className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-3 text-sm">
          <div>
            <div className="font-medium">Bật hiển thị quảng cáo AdSense</div>
            <div className="text-xs text-black/60">
              Bật: người dùng phải tắt chặn quảng cáo để tương tác nhận điểm. Tắt: cho phép bật chặn quảng cáo.
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={adsenseEnabled}
              onChange={(e) => handleToggleAdsense(e.target.checked)}
            />
            <span>{adsenseEnabled ? "Đang bật" : "Đang tắt"}</span>
          </label>
        </div>
      </div>

      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quảng cáo thuê trực tiếp</h2>
          <span className="text-xs text-black/60">Chuẩn bị sẵn không gian để mở rộng thêm dữ liệu</span>
        </div>

        <form onSubmit={handleCreateDirectAd} className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-black/20 px-3 py-2 text-sm"
            placeholder="Tiêu đề quảng cáo"
            value={directTitle}
            onChange={(e) => setDirectTitle(e.target.value)}
          />
          <input
            className="rounded-lg border border-black/20 px-3 py-2 text-sm"
            placeholder="Link ảnh banner (Cloudinary)"
            value={directImage}
            onChange={(e) => setDirectImage(e.target.value)}
          />
          <input
            className="rounded-lg border border-black/20 px-3 py-2 text-sm"
            placeholder="Link đích"
            value={directLink}
            onChange={(e) => setDirectLink(e.target.value)}
          />
          <input
            className="rounded-lg border border-black/20 px-3 py-2 text-sm"
            placeholder="Tracking key (tuỳ chọn)"
            value={directTracking}
            onChange={(e) => setDirectTracking(e.target.value)}
          />
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={directActive} onChange={(e) => setDirectActive(e.target.checked)} />
            <span>Đang kích hoạt</span>
          </div>
          <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white md:col-span-2" type="submit">
            Thêm quảng cáo
          </button>
        </form>

        <div className="grid gap-2 text-sm">
          {directAds.length === 0 ? (
            <div className="text-xs text-black/50">Chưa có quảng cáo trực tiếp.</div>
          ) : (
            directAds.map((ad) => (
              <div key={ad.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2">
                <div className="min-w-[200px]">
                  <div className="font-medium">{ad.title}</div>
                  <div className="text-xs text-black/60">{ad.tracking_key || "Không có tracking key"}</div>
                </div>
                <div className="text-xs text-black/60">
                  <div className="truncate">Ảnh: {ad.image_url}</div>
                  <div className="truncate">Link: {ad.link_url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-black/20 px-2 py-1 text-xs"
                    onClick={() => handleToggleDirectAd(ad.id, !ad.is_active)}
                  >
                    {ad.is_active ? "Tắt" : "Bật"}
                  </button>
                  <button
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
                    onClick={() => handleDeleteDirectAd(ad.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleUpdate} className="card grid gap-2 p-4 md:grid-cols-3">
        <input className="rounded-lg border border-black/20 px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
        <input
          className="rounded-lg border border-black/20 px-3 py-2 text-sm"
          type="number"
          value={impressions}
          onChange={(e) => setImpressions(Number(e.target.value))}
          placeholder="Lượt hiển thị"
        />
        <input
          className="rounded-lg border border-black/20 px-3 py-2 text-sm"
          type="number"
          value={revenue}
          onChange={(e) => setRevenue(Number(e.target.value))}
          placeholder="Doanh thu (ước tính)"
        />
        <button className="rounded-lg bg-ink px-4 py-2 text-sm text-white md:col-span-3" type="submit">
          Lưu thống kê
        </button>
      </form>

      <div className="card p-4 text-sm">
        <pre className="text-xs text-black/60">{JSON.stringify((data as any)?.data || [], null, 2)}</pre>
      </div>
    </div>
  );
}
