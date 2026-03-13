"use client";

import { ReactNode } from "react";

type Column<T> = {
  header: string;
  key: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  page: number;
  total: number;
  limit: number;
  onPageChange?: (page: number) => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
};

export default function DataTable<T>({
  columns,
  data,
  page,
  total,
  limit,
  onPageChange,
  onSearch,
  searchPlaceholder = "Tìm kiếm...",
  loading
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card space-y-4 p-4">
      {onSearch && (
        <input
          className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-black/50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-2 py-2">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-4 text-center text-xs text-black/50">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-4 text-center text-xs text-black/50">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {!loading &&
              data.map((row, idx) => (
                <tr key={idx} className="border-t border-black/5">
                  {columns.map((col) => (
                    <td key={col.key} className="px-2 py-2">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="flex items-center justify-between text-xs text-black/60">
          <span>
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-black/10 px-2 py-1 disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Trước
            </button>
            <button
              className="rounded-md border border-black/10 px-2 py-1 disabled:opacity-50"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
