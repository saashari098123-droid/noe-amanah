import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'মুছে ফেলার নিশ্চিতকরণ',
  itemName,
  description = 'আপনি কি নিশ্চিতভাবে এই আইটেমটি মুছে ফেলতে চান? এটি মুছে ফেললে আর পুনরুদ্ধার করা সম্ভব নাও হতে পারে।',
  confirmText = 'হ্যাঁ, মুছে ফেলুন',
  cancelText = 'বাতিল',
  isDangerous = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDangerous
                ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400'
                : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isDangerous ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="pr-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            {itemName && (
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mt-0.5 line-clamp-1">
                &ldquo;{itemName}&rdquo;
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98 ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isDangerous ? <Trash2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
