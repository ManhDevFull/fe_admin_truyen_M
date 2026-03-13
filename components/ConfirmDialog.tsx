"use client";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{title || "Confirm action"}</h3>
        {description && <p className="mt-2 text-sm text-black/60">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-lg border border-black/10 px-3 py-1 text-sm" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
