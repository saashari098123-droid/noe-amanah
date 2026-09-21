import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  type?: 'student' | 'teacher' | 'user';
  showEmoji?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = '',
  className = 'w-10 h-10 rounded-xl',
  type = 'student',
  showEmoji = true,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error status if the src prop changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanSrc = src ? src.trim() : '';
  const isFallback = !cleanSrc || hasError;

  if (isFallback) {
    // If no photo is provided or image failed to load, display a clean placeholder with a subtle male emoji lightly shown
    const fallbackEmoji = type === 'teacher' ? '👨' : '👦';
    const label = type === 'teacher' ? 'উস্তাদ' : 'শিক্ষার্থী';

    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shrink-0 select-none text-slate-400`}
        title={alt || label}
        aria-label={alt || label}
      >
        {showEmoji && (
          <span
            className="text-base sm:text-lg opacity-50 grayscale-[15%] select-none flex items-center justify-center leading-none transform transition-transform hover:scale-110"
            role="img"
            aria-hidden="true"
          >
            {fallbackEmoji}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className={`${className} object-cover shrink-0 bg-slate-100 dark:bg-slate-800`}
    />
  );
};
