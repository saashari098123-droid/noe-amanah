import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MediaEvent } from '../../types';
import { formatVideoEmbedUrl, getMediaThumbnail, extractYouTubeVideoId } from '../../utils/videoHelpers';
import {
  Image as ImageIcon,
  Play,
  X,
  Calendar,
  MapPin,
  ExternalLink,
  Youtube,
} from 'lucide-react';

export const PublicGallery: React.FC = () => {
  const { mediaEvents } = useMadrasa();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'photo' | 'video' | 'mahfil' | 'hifz'>('all');
  const [activeMediaModal, setActiveMediaModal] = useState<MediaEvent | null>(null);

  const filtered = mediaEvents.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'photo') return item.type === 'photo';
    if (selectedFilter === 'video') return item.type === 'video';
    return item.category === selectedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
          ছবি ও ভিডিও অ্যালবাম
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">
          অনুষ্ঠানের কার্যক্রম, মাহফিল ও স্মৃতিসমূহ
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl mx-auto">
          আমানত প্রতিষ্ঠানের বার্ষিক ইসলামী মহাসম্মেলন, হিফজ সমাপনী পাগড়ি প্রদান ও ক্রীড়া-সাংস্কৃতিক কার্যক্রম।
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            selectedFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          সবগুলো ({mediaEvents.length})
        </button>
        <button
          onClick={() => setSelectedFilter('photo')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
            selectedFilter === 'photo'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          ছবি অ্যালবাম
        </button>
        <button
          onClick={() => setSelectedFilter('video')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
            selectedFilter === 'video'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Play className="w-4 h-4 text-rose-500" />
          ভিডিও গ্যালারি
        </button>
        <button
          onClick={() => setSelectedFilter('hifz')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            selectedFilter === 'hifz'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          হিফজ সমাপনী
        </button>
        <button
          onClick={() => setSelectedFilter('mahfil')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            selectedFilter === 'mahfil'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          বার্ষিক ওয়াজ মাহফিল
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const displayThumbnail = getMediaThumbnail(item.mediaUrl, item.thumbnailUrl);
          const isYt = Boolean(extractYouTubeVideoId(item.mediaUrl));

          return (
            <div
              key={item.id}
              onClick={() => setActiveMediaModal(item)}
              className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="h-56 overflow-hidden relative bg-slate-900">
                <img
                  src={displayThumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>

                {item.type === 'video' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition ring-4 ring-white/30">
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    ছবি
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1 text-blue-700 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Video Modal */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveMediaModal(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 text-white p-2 rounded-full hover:bg-rose-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeMediaModal.type === 'video' ? (
                <iframe
                  src={formatVideoEmbedUrl(activeMediaModal.mediaUrl)}
                  title={activeMediaModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <img
                  src={activeMediaModal.mediaUrl}
                  alt={activeMediaModal.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="p-6 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeMediaModal.date}</span>
                  {activeMediaModal.location && <span>• {activeMediaModal.location}</span>}
                </div>
                <h2 className="text-lg sm:text-xl font-bold">{activeMediaModal.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeMediaModal.description}
                </p>
              </div>

              {activeMediaModal.type === 'video' && (
                <a
                  href={activeMediaModal.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 transition"
                >
                  <Youtube className="w-4 h-4" />
                  <span>ইউটিউবে সরাসরি দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
