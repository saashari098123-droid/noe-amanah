/**
 * YouTube and Video Helpers for Darul Amanah Media Gallery
 */

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // 2. youtube.com/watch?v=ID or /v/ID
  const watchMatch = trimmed.match(/(?:watch\?v=|v\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 3. Query param ?v=ID or &v=ID
  const paramMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (paramMatch && paramMatch[1]) return paramMatch[1];

  return null;
}

export function formatVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const ytId = extractYouTubeVideoId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?rel=0&autoplay=1`;
  }
  return trimmed;
}

export function getMediaThumbnail(url: string, customThumbnail?: string): string {
  if (customThumbnail && customThumbnail.trim()) {
    return customThumbnail.trim();
  }
  if (!url) {
    return 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80';
  }
  const ytId = extractYouTubeVideoId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return url.trim();
}
