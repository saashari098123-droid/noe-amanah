import React, { useState, useRef } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaInfo, PrayerTimeItem } from '../../types';
import { ImageUploadHelper } from '../common/ImageUploadHelper';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserCheck,
  CreditCard,
  Key,
  CheckCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Globe,
  Clock,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  GraduationCap,
  Layers,
  HelpCircle,
  Cloud,
  CloudCheck,
  Download,
  Upload,
  Database,
  HardDrive,
  Video,
  Image as ImageIcon,
  Check,
  RefreshCw,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const {
    madrasaInfo,
    updateMadrasaInfo,
    prayerTimes,
    updatePrayerTimes,
    resetAllToDefault,
    students,
    teachers,
    classes,
    attendance,
    homework,
    feePayments,
    examResults,
    notices,
    mediaEvents,
    complaints,
    admissionApplications,
    routines,
    guardianSmsLogs,
    cloudSyncStatus,
    lastSyncTime,
    syncAllToCloud,
    exportFullDatabaseJson,
    importFullDatabaseJson,
  } = useMadrasa();

  // Active sub-tab in Settings
  const [activeSection, setActiveSection] = useState<'profile' | 'muhtamim' | 'security' | 'payments' | 'prayer_reset' | 'cloud_storage'>(
    'profile'
  );

  const [formData, setFormData] = useState<MadrasaInfo>(madrasaInfo);
  const [localPrayerTimes, setLocalPrayerTimes] = useState<PrayerTimeItem[]>(prayerTimes);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('সকল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');

  // Cloud sync state
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin password state
  const [adminPasswordInput, setAdminPasswordInput] = useState(madrasaInfo.adminPassword || 'admin');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState(madrasaInfo.adminPassword || 'admin');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (field: keyof MadrasaInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrayerChange = (index: number, field: 'adhanTime' | 'iqamahTime', val: string) => {
    const updated = [...localPrayerTimes];
    updated[index] = { ...updated[index], [field]: val };
    setLocalPrayerTimes(updated);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    if (adminPasswordInput !== confirmPasswordInput) {
      setPasswordError('পাসওয়ার্ড দুটি মেলেনি! অনুগ্রহ করে যাচাই করুন।');
      setActiveSection('security');
      return;
    }
    setPasswordError('');

    // Save madrasa info
    updateMadrasaInfo({
      ...formData,
      adminPassword: adminPasswordInput.trim() || 'admin',
    });

    // Save prayer times
    updatePrayerTimes(localPrayerTimes);

    setSaveSuccess(true);
    setSaveMessage('সফলভাবে প্রতিষ্ঠানের সকল তথ্য, মুহতামিম বাণী ও পাসওয়ার্ড সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await syncAllToCloud();
    setIsManualSyncing(false);
    setSaveSuccess(true);
    setSaveMessage('সকল ডাটা সফলভাবে ক্লাউডে সিঙ্ক করা হয়েছে!');
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = await importFullDatabaseJson(content);
        setImportStatusMessage(result.message);
        setTimeout(() => setImportStatusMessage(null), 5000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalRecordCount =
    students.length +
    teachers.length +
    classes.length +
    attendance.length +
    homework.length +
    feePayments.length +
    examResults.length +
    notices.length +
    mediaEvents.length +
    complaints.length +
    admissionApplications.length +
    routines.length +
    guardianSmsLogs.length;

  const handleResetSystem = () => {
    if (
      confirm(
        'সতর্কবার্তা! আপনি কি সব ডাটা ফ্যাক্টরি ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান? এতে আপনার করা সকল সাম্প্রতিক পরিবর্তন মুছে যাবে।'
      )
    ) {
      resetAllToDefault();
      alert('সফলভাবে সিস্টেম ডিফল্ট অবস্থায় রিসেট করা হয়েছে।');
      window.location.reload();
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <Building2 className="w-4 h-4" />
            <span>স্কুল এন্ড কলেজ প্রোফাইল ও কেন্দ্রীয় নিয়ন্ত্রণ</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">প্রতিষ্ঠানের সার্বিক তথ্য ও সিস্টেম কনফিগারেশন</h2>
          <p className="text-xs text-slate-500">
            প্রতিষ্ঠানের নাম, ঠিকানা, যোগাযোগ, মুহতামিম বাণী, বিকাশ/নগদ মার্চেন্ট নম্বর, নামাজের সময়সূচী ও অ্যাডমিন পাসওয়ার্ড পরিবর্তন
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-pulse">
              <CheckCircle className="w-4 h-4" />
              {saveMessage}
            </span>
          )}
          <button
            type="submit"
            className="bg-blue-800 hover:bg-blue-900 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            সকল পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSection === 'profile'
              ? 'bg-white text-blue-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-700" />
          ১. স্কুল এন্ড কলেজ পরিচিতি ও ইতিহাস
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('muhtamim')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSection === 'muhtamim'
              ? 'bg-white text-blue-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-600" />
          ২. মুহতামিম বাণী ও ফটো
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSection === 'security'
              ? 'bg-white text-blue-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4 text-rose-600" />
          ৩. অ্যাডমিন পাসওয়ার্ড পরিবর্তন
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSection === 'payments'
              ? 'bg-white text-blue-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-teal-700" />
          ৪. বিকাশ / নগদ পেমেন্ট গেটওয়ে
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('prayer_reset')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSection === 'prayer_reset'
              ? 'bg-white text-blue-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-700" />
          ৫. নামাজের সময় ও সিস্টেম রিসেট
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cloud_storage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSection === 'cloud_storage'
              ? 'bg-white text-blue-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cloud className="w-4 h-4 text-emerald-600" />
          ৬. ৩-৫ বছরের ক্লাউড স্টোরেজ ও ব্যাকআপ
        </button>
      </div>

      {/* SECTION 1: PROFILE & IDENTITY */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              প্রতিষ্ঠানের প্রাথমিক নাম ও পরিচিতি
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠানের নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  value={formData.nameBangla}
                  onChange={(e) => handleChange('nameBangla', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠানের নাম (আরবিতে)
                </label>
                <input
                  type="text"
                  value={formData.nameArabic}
                  onChange={(e) => handleChange('nameArabic', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-['Amiri'] text-right focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠানের নাম (ইংরেজিতে)
                </label>
                <input
                  type="text"
                  value={formData.nameEnglish}
                  onChange={(e) => handleChange('nameEnglish', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠা সাল (খ্রিষ্টাব্দ)
                </label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => handleChange('establishedYear', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  স্কুল এন্ড কলেজ কোড / বেফাক নম্বর
                </label>
                <input
                  type="text"
                  value={formData.codeNumber}
                  onChange={(e) => handleChange('codeNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  EIIN / সরকারি ইনডেক্স নম্বর
                </label>
                <input
                  type="text"
                  value={formData.eiinNumber}
                  onChange={(e) => handleChange('eiinNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মূল প্রতিপাদ্য / স্লোগান (বাংলায়)
                </label>
                <input
                  type="text"
                  value={formData.mottoBangla}
                  onChange={(e) => handleChange('mottoBangla', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  কোরআনিক আয়াত / নীতিবাক্য (আরবি)
                </label>
                <input
                  type="text"
                  value={formData.mottoArabic}
                  onChange={(e) => handleChange('mottoArabic', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-['Amiri'] text-right focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-blue-600" />
              ঠিকানা ও যোগাযোগ তথ্য
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠানের পূর্ণাঙ্গ ঠিকানা *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  যাতায়াত ও দিকনির্দেশনা
                </label>
                <input
                  type="text"
                  value={formData.directions || ''}
                  onChange={(e) => handleChange('directions', e.target.value)}
                  placeholder="যেমন: আজমপুর বাসস্ট্যান্ড সংলগ্ন"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  অফিস প্রধান ফোন নম্বর *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  বিকল্প হেল্পলাইন নম্বর
                </label>
                <input
                  type="text"
                  value={formData.alternatePhone}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  অফিসিয়াল ইমেইল
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              ইতিহাস, লক্ষ্য ও উদ্দেশ্য
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠানের সংক্ষিপ্ত ইতিহাস
                </label>
                <textarea
                  rows={4}
                  value={formData.aboutHistory || ''}
                  onChange={(e) => handleChange('aboutHistory', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রতিষ্ঠানের লক্ষ্য ও উদ্দেশ্যসমূহ (প্রতি লাইনে ১টি করে)
                </label>
                <textarea
                  rows={4}
                  value={formData.aboutMission || ''}
                  onChange={(e) => handleChange('aboutMission', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মাদানী নেসাব কারিকুলাম পরিচিতি
                </label>
                <textarea
                  rows={3}
                  value={formData.aboutMadaniNisab || ''}
                  onChange={(e) => handleChange('aboutMadaniNisab', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MUHTAMIM INFO & PHOTO */}
      {activeSection === 'muhtamim' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-blue-600" />
            মুহতামিম সাহেবের প্রোফাইল, বাণী ও ফটো
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মুহতামিম সাহেবের নাম *
                </label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পদবি ও খেতাব
                </label>
                <input
                  type="text"
                  value={formData.principalDesignation}
                  onChange={(e) => handleChange('principalDesignation', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মুহতামিমের দিকনির্দেশনামূলক বাণী *
                </label>
                <textarea
                  rows={6}
                  value={formData.principalMessage}
                  onChange={(e) => handleChange('principalMessage', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  মুহতামিম সাহেবের ছবি আপলোড বা URL
                </label>
                <ImageUploadHelper
                  currentImageUrl={formData.principalPhotoUrl}
                  onImageSelected={(url) => handleChange('principalPhotoUrl', url)}
                  label="মুহতামিমের ছবি পরিবর্তন করুন"
                />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  স্কুল এন্ড কলেজ ক্যাম্পাস ব্যানার ছবি আপলোড বা URL
                </label>
                <ImageUploadHelper
                  currentImageUrl={formData.campusPhotoUrl || ''}
                  onImageSelected={(url) => handleChange('campusPhotoUrl', url)}
                  label="ক্যাম্পাস ছবি পরিবর্তন করুন"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ADMIN PASSWORD & SECURITY */}
      {activeSection === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="w-4 h-4 text-rose-600" />
            অ্যাডমিন প্যানেলের গোপন পাসওয়ার্ড পরিবর্তন
          </h3>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              পাসওয়ার্ড সংক্রান্ত নির্দেশনা:
            </p>
            <p>
              এই পাসওয়ার্ড দ্বারা সুপার অ্যাডমিন প্যানেলে লগইন করতে পারবেন। পরিবর্তন করার পর "সকল পরিবর্তন সংরক্ষণ করুন" বাটনে ক্লিক করুন।
            </p>
          </div>

          {passwordError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl font-bold">
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                নতুন অ্যাডমিন পাসওয়ার্ড *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 pr-10 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="যেমন: darul786"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PAYMENT GATEWAY ACCOUNTS */}
      {activeSection === 'payments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-teal-600" />
            অনলাইন ফি ও পেমেন্ট একাউন্ট নম্বর কনফিগারেশন
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                বিকাশ মার্চেন্ট / পার্সোনাল নম্বর *
              </label>
              <input
                type="text"
                value={formData.bkashMerchantNumber}
                onChange={(e) => handleChange('bkashMerchantNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                নগদ মার্চেন্ট নম্বর *
              </label>
              <input
                type="text"
                value={formData.nagadMerchantNumber}
                onChange={(e) => handleChange('nagadMerchantNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                রকেট এজেন্ট / পার্সোনাল নম্বর
              </label>
              <input
                type="text"
                value={formData.rocketNumber}
                onChange={(e) => handleChange('rocketNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ব্যাংক একাউন্ট বিবরণ (অনলাইন পেমেন্ট ও অনুদানের জন্য)
              </label>
              <input
                type="text"
                value={formData.bankAccountDetails}
                onChange={(e) => handleChange('bankAccountDetails', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PRAYER TIMES & SYSTEM RESET */}
      {activeSection === 'prayer_reset' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              দৈনিক ৫ ওয়াক্ত ও জুমুআহ নামাজের সময়সূচী
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localPrayerTimes.map((item, index) => (
                <div key={item.nameBangla} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-sm">{item.nameBangla}</span>
                    <span className="font-['Amiri'] text-blue-800 font-bold text-sm">{item.nameArabic}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">আজান সময়</label>
                      <input
                        type="text"
                        value={item.adhanTime}
                        onChange={(e) => handlePrayerChange(index, 'adhanTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">ইকামত সময়</label>
                      <input
                        type="text"
                        value={item.iqamahTime}
                        onChange={(e) => handlePrayerChange(index, 'iqamahTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>সিস্টেম ডাটা ফ্যাক্টরি রিসেট</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              যদি আপনি টেস্ট ডাটা মুছে একদম প্রাথমিক ডিফল্ট অবস্থায় ফিরে যেতে চান, তবে নিচের রিসেট বাটনে ক্লিক করুন।
            </p>
            <button
              type="button"
              onClick={handleResetSystem}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              ফ্যাক্টরি ডিফল্টে রিসেট করুন
            </button>
          </div>
        </div>
      )}

      {/* SECTION 6: 3-5 YEAR CLOUD STORAGE & BACKUP MANAGER */}
      {activeSection === 'cloud_storage' && (
        <div className="space-y-6">
          {/* Cloud Status Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-emerald-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs text-emerald-200">
                <Cloud className="w-3.5 h-3.5" />
                <span>Google Firebase Firestore & Cloud Backup Active</span>
              </div>
              <h3 className="text-lg font-bold">৩-৫ বছরের দীর্ঘমেয়াদী ফ্রি ডাটা ও মিডিয়া স্টোরেজ সিস্টেম</h3>
              <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                আপনার মাদরাসার সকল ছাত্র-শিক্ষক, হাজিরা, পরীক্ষার ফলাফল, ফি আদায়ের হিসাব এবং রসিদ স্বয়ংক্রিয়ভাবে গুগল ফায়ারস্টোর ক্লাউডে সংরক্ষিত হচ্ছে। সম্পূর্ণ ফ্রিতে ৫+ বছরের ১০ লক্ষাধিক তথ্য সংরক্ষণ করা যাবে।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isManualSyncing}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
                {isManualSyncing ? 'ক্লাউডে সিঙ্ক হচ্ছে...' : 'এখনই ক্লাউডে সিঙ্ক করুন'}
              </button>
              <button
                type="button"
                onClick={exportFullDatabaseJson}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 backdrop-blur-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                পূর্ণাঙ্গ ডাটাবেস ডাউনলোড (JSON)
              </button>
            </div>
          </div>

          {importStatusMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              {importStatusMessage}
            </div>
          )}

          {/* Real-time Storage Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">বর্তমান মোট রেকর্ড</span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-800">{totalRecordCount.toLocaleString('bn-BD')} টি</div>
              <p className="text-[11px] text-slate-500">ছাত্র, শিক্ষক, ফি, হাজিরা ও নোটিশ সহ</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">ক্লাউড সিঙ্ক স্ট্যাটাস</span>
                <Cloud className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-black text-emerald-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {cloudSyncStatus === 'synced' ? 'সক্রিয় ও ক্লাউডে সিঙ্কড' : cloudSyncStatus === 'syncing' ? 'সিঙ্ক হচ্ছে...' : 'লোকাল + ফায়ারবেস'}
              </div>
              <p className="text-[11px] text-slate-500">সর্বশেষ সিঙ্ক: {lastSyncTime}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">৩-৫ বছরের ফ্রি স্টোরেজ</span>
                <HardDrive className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700">১ গিগাবাইট (ফ্রি)</div>
              <p className="text-[11px] text-slate-500">১০,০০,০০০+ টেক্সট ডাটা রাখার সক্ষমতা</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">ব্যবহৃত স্টোরেজ (আনুমানিক)</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">&lt; ০.১%</div>
              <p className="text-[11px] text-slate-500">বাকি ৯৯.৯% ফ্রি ক্লাউড স্পেস অবশিষ্ট আছে</p>
            </div>
          </div>

          {/* Strategy Guide for 3-5 Year Images & Videos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images strategy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">ছবি (Images) দীর্ঘমেয়াদী ফ্রি সংরক্ষণের নিয়ম</h4>
                  <p className="text-xs text-slate-500">ছাত্র-শিক্ষক ছবি, বার্ষিক মাহফিল ও ক্যাম্পাস ফটোগ্যালারি</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>সরাসরি ডিভাইস থেকে আপলোড:</strong> ছবি সিলেক্ট করলে সিস্টেমটি স্বয়ংক্রিয়ভাবে অপটিমাইজ করে সুরক্ষিত ডাটাবেসে সেভ করে।
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ফ্রি ইমেজ ক্লাউড লিঙ্ক (প্রস্তাবিত):</strong> হাজার হাজার ছবির জন্য ImgBB, Cloudinary বা Google Drive পাবলিক ডিরেক্ট লিঙ্ক ব্যবহার করা যাবে।
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>স্বয়ংক্রিয় ব্যাকআপ:</strong> প্রতিটি ছবির লিঙ্ক ডাটাবেস ব্যাকআপে সংরক্ষিত থাকে, ফলে ৫ বছর পরেও কোনো ছবি হারাবে না।
                  </span>
                </div>
              </div>
            </div>

            {/* Video strategy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">ভিডিও (Videos) ৫ বছর ফ্রি সংরক্ষণের সেরা পদ্ধতি</h4>
                  <p className="text-xs text-slate-500">বার্ষিক জলসা, কোরআন তিলাওয়াত প্রতিযোগিতা ও বক্তব্য</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>YouTube Unlisted/Public:</strong> মাদরাসার অফিশিয়াল ইউটিউব চ্যানেলে ভিডিওগুলো Unlisted বা Public হিসেবে আপলোড করে লিংকটি এখানে যুক্ত করুন।
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>সীমাহীন ও আজীবন ফ্রি:</strong> ইউটিউবে ১০০০+ ভিডিও আজীবন ফ্রি ও ফুল HD রেজোলিউশনে সেভ থাকবে এবং ওয়েবসাইট থেকে সরাসরি প্লে হবে।
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ওয়েবসাইটের দ্রুত গতি:</strong> ভিডিও ক্লাউডে স্ট্রিম হওয়ার কারণে ওয়েবসাইট অত্যন্ত দ্রুত লোড হবে।
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Offline Database Import / Restore Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-700" />
                <h4 className="font-bold text-sm text-slate-800">ডাটাবেস ব্যাকআপ রিস্টোর / মাইগ্রেশন (Import JSON)</h4>
              </div>
              <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                অফলাইন সেভ ও অন্য কম্পিউটারে ট্রান্সফার
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি যদি আগের ডাউনলোড করা কোনো JSON ব্যাকআপ ফাইল থেকে সকল তথ্য ফিরিয়ে আনতে চান অথবা নতুন সার্ভারে স্থানান্তর করতে চান, তবে নিচের বাটন চেপে ফাইল সিলেক্ট করুন।
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="db-file-upload"
              />
              <label
                htmlFor="db-file-upload"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                কম্পিউটার থেকে JSON ব্যাকআপ আপলোড করুন
              </label>

              <button
                type="button"
                onClick={exportFullDatabaseJson}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                বর্তমান সব ডাটার কপি ডাউনলোড করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
