import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MediaEvent } from '../../types';
import { ImageUploadHelper } from '../common/ImageUploadHelper';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { formatVideoEmbedUrl, getMediaThumbnail, extractYouTubeVideoId } from '../../utils/videoHelpers';
import {
  Image,
  Video,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle,
  X,
  Eye,
  Calendar,
  MapPin,
  FolderOpen,
  Play,
  Film,
  AlertCircle,
  Youtube,
  ExternalLink,
} from 'lucide-react';

export const AdminMedia: React.FC = () => {
  const { mediaEvents, addMediaEvent, updateMediaEvent, deleteMediaEvent } = useMadrasa();

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('bn-BD'));
  const [category, setCategory] = useState<MediaEvent['category']>('campus');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [location, setLocation] = useState('স্কুল এন্ড কলেজ প্রাঙ্গণ');
  const [albumName, setAlbumName] = useState('সাধারণ গ্যালারি');

  const [previewMedia, setPreviewMedia] = useState<MediaEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toLocaleDateString('bn-BD'));
    setCategory('campus');
    setMediaType('photo');
    setMediaUrl('');
    setThumbnailUrl('');
    setLocation('স্কুল এন্ড কলেজ প্রাঙ্গণ');
    setAlbumName('সাধারণ গ্যালারি');
    setIsAdding(true);
  };

  const handleOpenEdit = (item: MediaEvent) => {
    setEditingItem(item);
    setFormError(null);
    setTitle(item.title);
    setDescription(item.description);
    setDate(item.date);
    setCategory(item.category);
    setMediaType(item.type);
    setMediaUrl(item.mediaUrl);
    setThumbnailUrl(item.thumbnailUrl || item.mediaUrl);
    setLocation(item.location || 'স্কুল এন্ড কলেজ প্রাঙ্গণ');
    setAlbumName(item.albumName || 'সাধারণ গ্যালারি');
    setIsAdding(true);
  };

  const handleVideoUrlChange = (url: string) => {
    setMediaUrl(url);
    const ytId = extractYouTubeVideoId(url);
    if (ytId && !thumbnailUrl) {
      setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('অনুগ্রহ করে শিরোনাম প্রদান করুন।');
      return;
    }
    if (!mediaUrl.trim()) {
      setFormError('অনুগ্রহ করে ছবি নির্বাচন করুন বা ভিডিও লিঙ্ক দিন।');
      return;
    }

    // Auto compute best thumbnail
    const finalThumb = getMediaThumbnail(mediaUrl.trim(), thumbnailUrl.trim());

    if (editingItem) {
      updateMediaEvent({
        ...editingItem,
        title: title.trim(),
        description: description.trim(),
        date,
        category,
        type: mediaType,
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: finalThumb,
        location: location.trim(),
        albumName: albumName.trim(),
      });
      showToast('গ্যালারির ছবি/ভিডিও সফলভাবে আপডেট হয়েছে!');
    } else {
      addMediaEvent({
        title: title.trim(),
        description: description.trim(),
        date,
        category,
        type: mediaType,
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: finalThumb,
        location: location.trim(),
        albumName: albumName.trim(),
      });
      showToast('নতুন ছবি/ভিডিও সফলভাবে গ্যালারিতে যোগ হয়েছে!');
    }
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMediaEvent(deleteTarget.id);
      showToast(`"${deleteTarget.title}" সফলভাবে মুছে ফেলা হয়েছে!`);
      setDeleteTarget(null);
    }
  };

  const filteredMedia = mediaEvents.filter((m) => {
    if (activeFilter === 'photo') return m.type === 'photo';
    if (activeFilter === 'video') return m.type === 'video';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <Film className="w-4 h-4" />
            <span>ছবি ও ভিডিও ব্যবস্থাপনা</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">প্রতিষ্ঠানের ফটো ও ভিডিও গ্যালারি</h2>
          <p className="text-xs text-slate-500">
            কম্পিউটার বা ফোনের ফোল্ডার থেকে সরাসরি ছবি আপলোড করুন, ইউটিউব বা অন্যান্য ভিডিও লিংক যোগ করুন
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-800 hover:bg-blue-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          নতুন ছবি / ভিডিও আপলোড করুন
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === 'all' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সব মিডিয়া ({mediaEvents.length})
          </button>
          <button
            onClick={() => setActiveFilter('photo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'photo' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            ছবি ({mediaEvents.filter((m) => m.type === 'photo').length})
          </button>
          <button
            onClick={() => setActiveFilter('video')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'video' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-rose-600" />
            ভিডিও ({mediaEvents.filter((m) => m.type === 'video').length})
          </button>
        </div>
      </div>

      {/* Grid of Media Items */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3">
          <Image className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো মিডিয়া ফাইল পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">আপনার ডিভাইস থেকে ফটো বা ভিডিও গ্যালারিতে যোগ করুন</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
          >
            প্রথম ছবি বা ভিডিও যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map((item) => {
            const thumb = getMediaThumbnail(item.mediaUrl, item.thumbnailUrl);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition"
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={thumb}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-white shadow-xs ${
                        item.type === 'video' ? 'bg-rose-600' : 'bg-blue-700'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <>
                          <Video className="w-3 h-3" />
                          ভিডিও
                        </>
                      ) : (
                        <>
                          <Image className="w-3 h-3" />
                          ছবি
                        </>
                      )}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewMedia(item)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition cursor-pointer"
                      title="প্লে বা বড় করে দেখুন"
                    >
                      {item.type === 'video' ? <Play className="w-4 h-4 fill-current text-rose-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-md transition cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                      className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Media Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                      {item.albumName && (
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {item.albumName}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug">{item.title}</h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>

                  {item.location && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-100">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingItem ? 'মিডিয়া তথ্য সম্পাদনা' : 'নতুন ছবি / ভিডিও যোগ করুন'}
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Type Switcher */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMediaType('photo')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mediaType === 'photo' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  ছবি (Photo)
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mediaType === 'video' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-rose-600" />
                  ভিডিও (YouTube/Video)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক মাহফিল ও পাগড়ি প্রদান ২০২৬"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Image Uploader or Video URL */}
              {mediaType === 'photo' ? (
                <div>
                  <ImageUploadHelper
                    label="ফটো আপলোড (ফোল্ডার থেকে নির্বাচন করুন)"
                    currentValue={mediaUrl}
                    onChange={(url) => {
                      setMediaUrl(url);
                      setThumbnailUrl(url);
                    }}
                    aspectRatio="video"
                    helperText="কম্পিউটার বা ফোনের গ্যালারি থেকে সরাসরি ছবি বেছে নিন"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ইউটিউব ভিডিও লিংক (YouTube Video / Shorts / Embed Link) *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={mediaUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      />
                      <Youtube className="w-4 h-4 text-rose-600 absolute left-2.5 top-2.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ইউটিউবের যেকোনো লিংক পেস্ট করুন, সিস্টেমটি স্বয়ংক্রিয়ভাবে ভিডিও ও থাম্বনেইল প্রদর্শন করবে।
                    </p>
                  </div>

                  <ImageUploadHelper
                    label="ভিডিও কভার / থাম্বনেইল ছবি (ঐচ্ছিক - ডিফল্ট ইউটিউব থাম্বনেইল ব্যবহৃত হবে)"
                    currentValue={thumbnailUrl}
                    onChange={(url) => setThumbnailUrl(url)}
                    aspectRatio="video"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="campus">ক্যাম্পাস ও পরিবেশ</option>
                    <option value="mahfil">ওয়াজ মাহফিল ও সম্মেলন</option>
                    <option value="hifz">হিফজ ও দস্তারবন্দী</option>
                    <option value="competition">প্রতিযোগিতা ও পুরস্কার</option>
                    <option value="social">সামাজিক কার্যক্রম</option>
                    <option value="sports">খেলাধুলা ও শরীরচর্চা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অ্যালবামের নাম</label>
                  <input
                    type="text"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="যেমন: দস্তারবন্দী ২০২৬"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্থান / ভেন্যু</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ছবি বা ভিডিও সম্পর্কে কিছু লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingItem ? 'আপডেট করুন' : 'সংরক্ষণ ও প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 border border-slate-800 relative">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <iframe
                  src={formatVideoEmbedUrl(previewMedia.mediaUrl)}
                  title={previewMedia.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={previewMedia.mediaUrl}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="space-y-1">
                <span className="text-xs text-blue-400 font-bold">{previewMedia.albumName || 'গ্যালারি'}</span>
                <h3 className="text-base sm:text-lg font-bold text-white">{previewMedia.title}</h3>
                {previewMedia.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{previewMedia.description}</p>
                )}
              </div>

              {previewMedia.type === 'video' && (
                <a
                  href={previewMedia.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 transition"
                >
                  <Youtube className="w-4 h-4" />
                  <span>ইউটিউবে খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="ছবি/ভিডিও মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteTarget?.title}
        description="আপনি কি নিশ্চিতভাবে এই মিডিয়া ফাইলটি গ্যালারি থেকে মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
