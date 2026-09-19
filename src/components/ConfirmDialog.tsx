import React, { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between p-6 pb-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5 text-[#2A2A2A]/60" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          <h2 className="text-xl font-display text-[#2A2A2A] mb-2">{title}</h2>
          <p className="text-sm text-[#2A2A2A]/60 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-[#FDFBF7] border-t border-black/5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-[#2A2A2A]/80 hover:text-[#2A2A2A] hover:bg-black/5 rounded-full transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-black hover:bg-[#333]'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
