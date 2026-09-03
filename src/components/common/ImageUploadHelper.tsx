import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Link, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

interface ImageUploadHelperProps {
  label: string;
  currentValue?: string;
  currentImageUrl?: string;
  onChange?: (newValue: string) => void;
  onImageSelected?: (newValue: string) => void;
  placeholder?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
}

export const ImageUploadHelper: React.FC<ImageUploadHelperProps> = ({
  label,
  currentValue,
  currentImageUrl,
  onChange,
  onImageSelected,
  placeholder = 'https://...',
  helperText = 'কম্পিউটার বা ফোনের ফোল্ডার থেকে ছবি আপলোড করুন অথবা ছবির লিঙ্ক দিন',
  aspectRatio = 'square',
}) => {
  const actualValue = currentValue ?? currentImageUrl ?? '';
  const handleChange = (val: string) => {
    if (onChange) onChange(val);
    if (onImageSelected) onImageSelected(val);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }
    // Limit to 15MB input file (will be compressed down to ~25KB in milliseconds)
    if (file.size > 15 * 1024 * 1024) {
      alert('ছবির সাইজ ১৫ মেগাবাইটের কম হতে হবে।');
      return;
    }

    try {
      setIsCompressing(true);
      const targetMax = aspectRatio === 'banner' ? 800 : aspectRatio === 'video' ? 500 : 350;
      const compressed = await compressImage(file, targetMax, targetMax, 0.72);
      if (compressed) {
        handleChange(compressed);
      }
    } catch (err) {
      console.warn('Error compressing image:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUrlApply = async () => {
    const rawUrl = urlInput.trim();
    if (!rawUrl) return;

    if (rawUrl.startsWith('data:image/')) {
      try {
        setIsCompressing(true);
        const targetMax = aspectRatio === 'banner' ? 800 : aspectRatio === 'video' ? 500 : 350;
        const compressed = await compressImage(rawUrl, targetMax, targetMax, 0.72);
        handleChange(compressed || rawUrl);
      } catch {
        handleChange(rawUrl);
      } finally {
        setIsCompressing(false);
        setUrlInput('');
      }
    } else {
      handleChange(rawUrl);
      setUrlInput('');
    }
  };

  const clearImage = () => {
    handleChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : aspectRatio === 'video'
      ? 'w-full max-w-sm h-40'
      : 'w-full h-32';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">{label}</label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md font-semibold transition ${
              mode === 'upload' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ফাইল / ফোল্ডার
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-semibold transition ${
              mode === 'url' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ওয়েব লিঙ্ক
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Preview and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {actualValue ? (
          <div className="relative group shrink-0">
            <img
              src={actualValue}
              alt="Preview"
              className={`${aspectClass} object-cover rounded-xl border-2 border-blue-500/60 shadow-sm bg-slate-100`}
            />
            <button
              type="button"
              onClick={clearImage}
              aria-label="ছবি মুছুন"
              className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            className={`${aspectClass} shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs p-2 text-center`}
          >
            <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
            <span className="text-[10px]">ছবি নেই</span>
          </div>
        )}

        <div className="flex-1 w-full space-y-2">
          {mode === 'upload' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50 text-slate-600'
              }`}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="text-xs font-semibold text-blue-700">ছবি প্রসেস ও সাইজ অপ্টিমাইজ করা হচ্ছে...</div>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-blue-600" />
                  <div className="text-xs font-semibold">
                    <span className="text-blue-700 font-bold underline">ফোল্ডার থেকে বেছে নিন</span> বা ড্র্যাগ করে ছাড়ুন
                  </div>
                  <div className="text-[10px] text-slate-600">JPG, PNG, WebP (অটো সাইজ অপ্টিমাইজেশন)</div>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleUrlApply}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-bold transition flex items-center gap-1 shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                যোগ করুন
              </button>
            </div>
          )}

          {helperText && <p className="text-[11px] text-slate-600">{helperText}</p>}
        </div>
      </div>
    </div>
  );
};
