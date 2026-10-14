import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
          <AlertTriangle className="size-5" />
        </div>
        <p className="pt-2 text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
      <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-ghost" onClick={onClose} id="confirm-cancel">Voltar</button>
        <button
          id="confirm-ok"
          onClick={handle}
          disabled={loading}
          className={`btn text-white shadow-lg ${danger ? 'bg-rose-600 shadow-rose-500/25 hover:bg-rose-700' : 'bg-amber-500 shadow-amber-500/25 hover:bg-amber-600'}`}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
