import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Teacher } from '../../types';
import { ImageUploadHelper } from '../common/ImageUploadHelper';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Key,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  BookOpen,
  Shield,
  LayoutGrid,
  Table as TableIcon,
  Search,
  ChevronRight,
  UserPlus,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminTeachers: React.FC = () => {
  const {
    teachers,
    classes,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    syncAllToCloud,
    cloudSyncStatus,
    lastSyncTime,
  } = useMadrasa();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [id, setId] = useState(`tch-${String(teachers.length + 1).padStart(2, '0')}`);
  const [nameBangla, setNameBangla] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('madrasa123');
  const [designation, setDesignation] = useState('মুহাদ্দিস ও সিনিয়র উস্তাদ');
  const [qualification, setQualification] = useState('দাওরায়ে হাদিস (মুমতাজ)');
  const [phone, setPhone] = useState('');
  const [assignedClasses, setAssignedClasses] = useState<string[]>([classes[0]?.id || 'cls-madani-1']);
  const [assignedSubjectsStr, setAssignedSubjectsStr] = useState('এসো আরবি শিখি, আদাবুল মুআশারাত');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  );

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const toggleClassCheck = (classId: string) => {
    if (assignedClasses.includes(classId)) {
      setAssignedClasses(assignedClasses.filter((c) => c !== classId));
    } else {
      setAssignedClasses([...assignedClasses, classId]);
    }
  };

  const openAddModal = () => {
    setEditingTeacherId(null);
    setId(`tch-${String(teachers.length + 1).padStart(2, '0')}`);
    setNameBangla('');
    setNameEnglish('');
    setEmail(`teacher${teachers.length + 1}@darulamanah.edu.bd`);
    setPassword('madrasa123');
    setDesignation('সহকারী উস্তাদ');
    setQualification('দাওরায়ে হাদিস, বেফাকুল মাদারিস');
    setPhone('');
    setAssignedClasses([classes[0]?.id || 'cls-madani-1']);
    setAssignedSubjectsStr('এসো আরবি শিখি, তামরীন');
    setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setId(t.id);
    setNameBangla(t.nameBangla);
    setNameEnglish(t.nameEnglish || '');
    setEmail(t.email);
    setPassword(t.password);
    setDesignation(t.designation);
    setQualification(t.qualification);
    setPhone(t.phone);
    setAssignedClasses(t.assignedClasses || []);
    setAssignedSubjectsStr(t.assignedSubjects?.join(', ') || '');
    setPhotoUrl(t.photoUrl || '');
    setIsModalOpen(true);
  };

  const handleSyncNow = async () => {
    setIsSyncingNow(true);
    await syncAllToCloud();
    setIsSyncingNow(false);
    showToast('সব শিক্ষকের তালিকা সফলভাবে ফায়ারবেস ক্লাউডে সিঙ্ক করা হয়েছে!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = assignedSubjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const teacherData: Teacher = {
      id,
      nameBangla: nameBangla.trim(),
      nameEnglish: nameEnglish.trim() || undefined,
      email: email.trim().toLowerCase(),
      password: password.trim() || 'madrasa123',
      designation: designation.trim(),
      qualification: qualification.trim(),
      phone: phone.trim(),
      assignedClasses: assignedClasses.length > 0 ? assignedClasses : [classes[0]?.id || 'cls-madani-1'],
      assignedSubjects: subjects.length > 0 ? subjects : ['সাধারণ ইসলামিক শিক্ষা'],
      joiningDate: new Date().toLocaleDateString('bn-BD'),
      photoUrl,
    };

    if (editingTeacherId) {
      updateTeacher(teacherData);
      showToast('উস্তাদের তথ্য সফলভাবে আপডেট ও ক্লাউডে সংরক্ষণ করা হয়েছে!');
    } else {
      addTeacher(teacherData);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      showToast(`নতুন উস্তাদ "${teacherData.nameBangla}" সফলভাবে যোগ ও ক্লাউডে সংরক্ষণ করা হয়েছে!`);
    }

    setIsModalOpen(false);
  };

  const togglePasswordVisibility = (teacherId: string) => {
    setShowPasswords((prev) => ({ ...prev, [teacherId]: !prev[teacherId] }));
  };

  const copyCreds = (name: string, phoneNum: string, passStr: string) => {
    navigator.clipboard.writeText(`উস্তাদের নাম: ${name} | মোবাইল: ${phoneNum} | পাসওয়ার্ড: ${passStr}`);
    alert(`উস্তাদের লগইন তথ্য কপি করা হয়েছে!`);
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.nameBangla.toLowerCase().includes(q) ||
      (t.nameEnglish && t.nameEnglish.toLowerCase().includes(q)) ||
      t.phone.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      (t.assignedSubjects && t.assignedSubjects.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <Shield className="w-4 h-4" />
            <span>শিক্ষক ও উস্তাদ নিয়ন্ত্রণ কেন্দ্র</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">উস্তাদ ও শিক্ষক তালিকা এবং লগইন ব্যবস্থাপনা</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নতুন উস্তাদের নাম যোগ করুন। শিক্ষকগণ তাদের নাম এবং মোবাইল নম্বর দিয়েই মোবাইল বা ল্যাপটপ থেকে সহজে লগইন করতে পারবেন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleSyncNow}
            disabled={isSyncingNow}
            className="flex-1 sm:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-4 py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            title="সব শিক্ষকের তথ্য ফায়ারবেস ক্লাউড ডাটাবেসে জোরপূর্বক সিঙ্ক করুন"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncingNow ? 'animate-spin' : ''}`} />
            <span>{isSyncingNow ? 'ক্লাউডে সিঙ্ক হচ্ছে...' : 'ফায়ারবেস সিঙ্ক'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>নতুন উস্তাদের নাম যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & View Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="উস্তাদের নাম, পদবি, মোবাইল বা বিষয় খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-slate-500 font-medium">
            মোট উস্তাদ: <strong className="text-blue-800 font-mono">{filteredTeachers.length}</strong> জন
          </span>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="টেবিল ভিউ"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>টেবিল ভিউ</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="কার্ড ভিউ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>কার্ড ভিউ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table View (Responsive on all devices) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 overflow-hidden space-y-3">
          {/* Mobile scroll hint */}
          <div className="sm:hidden flex items-center justify-between bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
            <span>📱 মোবাইলে টেবিলের সকল অপশন দেখতে ডানে স্ক্রল করুন</span>
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">কোন উস্তাদের তথ্য পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[780px] text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">উস্তাদের নাম ও ছবি</th>
                    <th className="p-3">পদবি ও শিক্ষাগত যোগ্যতা</th>
                    <th className="p-3">মোবাইল (লগইন)</th>
                    <th className="p-3">লগইন পাসওয়ার্ড</th>
                    <th className="p-3">পাঠদানের কিতাব ও বিষয়</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t) => {
                    const isPassVisible = showPasswords[t.id];
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
                              alt={t.nameBangla}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{t.nameBangla}</div>
                              {t.nameEnglish && <div className="text-[10px] text-slate-400">{t.nameEnglish}</div>}
                              <div className="text-[10px] text-slate-400 font-mono">ID: {t.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-blue-700">{t.designation}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{t.qualification}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{t.phone || 'মোবাইল নেই'}</span>
                          </div>
                          {t.email && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" />
                              <span>{t.email}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg w-fit border border-slate-200">
                            <Key className="w-3 h-3 text-amber-500" />
                            <span className="font-mono font-bold text-blue-900 text-xs">
                              {isPassVisible ? t.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(t.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title={isPassVisible ? 'লুকান' : 'দেখুন'}
                            >
                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => copyCreds(t.nameBangla, t.phone, t.password)}
                              className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                              title="লগইন তথ্য কপি করুন"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {t.assignedSubjects?.map((sub, i) => (
                              <span
                                key={i}
                                className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-blue-200/60"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(t)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">সম্পাদনা</span>
                            </button>
                            {teachers.length > 1 && (
                              <button
                                onClick={() => setDeleteTarget({ id: t.id, name: t.nameBangla })}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-1.5 rounded-lg text-xs transition cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Teachers Cards Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((t) => {
            const isPassVisible = showPasswords[t.id];
            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header with Photo and Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
                        alt={t.nameBangla}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-blue-100 shadow-xs shrink-0 bg-slate-100"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{t.nameBangla}</h3>
                        <p className="text-[11px] text-blue-700 font-semibold">{t.designation}</p>
                        <p className="text-[10px] text-slate-400">{t.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {teachers.length > 1 && (
                        <button
                          onClick={() => setDeleteTarget({ id: t.id, name: t.nameBangla })}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Login Credentials Box */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        লগইন মোবাইল:
                      </span>
                      <span className="font-mono font-bold text-slate-900 select-all">{t.phone || 'নেই'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-[11px]">
                        <Key className="w-3 h-3 text-amber-500" />
                        পাসওয়ার্ড:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-800">
                          {isPassVisible ? t.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(t.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          title={isPassVisible ? 'লুকান' : 'দেখুন'}
                        >
                          {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyCreds(t.nameBangla, t.phone, t.password)}
                          className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                          title="লগইন তথ্য কপি করুন"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {t.email && (
                      <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200 text-[10px]">
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          <Mail className="w-3 h-3 text-blue-600" />
                          ইমেইল:
                        </span>
                        <span className="font-mono text-slate-600">{t.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Subjects */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">পাঠদানের কিতাব ও বিষয়:</span>
                    <div className="flex flex-wrap gap-1">
                      {t.assignedSubjects?.map((sub, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-blue-200/60"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>যোগদান: {t.joiningDate}</span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">সক্রিয় উস্তাদ</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal (Fully responsive on mobile & desktop) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
            <div className="bg-blue-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base sm:text-lg">
                  {editingTeacherId ? 'উস্তাদের তথ্য ও পাসওয়ার্ড সম্পাদনা' : 'নতুন উস্তাদের নাম ও তথ্য যোগ করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-blue-900 leading-relaxed text-[11px]">
                💡 <strong>সহজ লগইন সুবিধা:</strong> উস্তাদ লগইন করতে কোনো ইমেইলের প্রয়োজন নেই। উস্তাদ শুধু নিজের নাম নির্বাচন করে এবং পাসওয়ার্ড হিসেবে তার মোবাইল নম্বর দিলেই সরাসরি পোর্টালে ঢুকতে পারবেন।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">উস্তাদের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={nameBangla}
                    onChange={(e) => setNameBangla(e.target.value)}
                    placeholder="মাওলানা মুহাম্মাদ সাইফুল্লাহ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    placeholder="Mawlana Saifullah"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর (লগইন পাসওয়ার্ড) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!editingTeacherId || password === 'madrasa123') {
                        setPassword(e.target.value || 'madrasa123');
                      }
                    }}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পদবি (Designation) *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="মুহাদ্দিস / প্রধান ক্বারী / সহকারী উস্তাদ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-700" />
                  উস্তাদের বিকল্প লগইন পাসওয়ার্ড ও ইমেইল (ঐচ্ছিক):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">লগইন পাসওয়ার্ড</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="মোবাইল নম্বর বা পাসওয়ার্ড"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-blue-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">অফিসিয়াল ইমেইল (যদি থাকে)</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@darulamanah.edu.bd"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">শিক্ষাগত যোগ্যতা *</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="দাওরায়ে হাদিস (মুমতাজ), জামিয়া রাহমানিয়া"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পাঠদানের বিষয়সমূহ (কমা দিয়ে লিখুন) *
                </label>
                <input
                  type="text"
                  required
                  value={assignedSubjectsStr}
                  onChange={(e) => setAssignedSubjectsStr(e.target.value)}
                  placeholder="এসো আরবি শিখি, আদাবুল মুআশারাত, নাহবেমীর"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  দায়িত্বপ্রাপ্ত জামাতসমূহ বেছে নিন
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {classes.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={assignedClasses.includes(cls.id)}
                        onChange={() => toggleClassCheck(cls.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <ImageUploadHelper
                  label="শিক্ষকের ছবি (ফোল্ডার থেকে নির্বাচন করুন)"
                  currentValue={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                  aspectRatio="square"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer active:scale-98"
                >
                  {editingTeacherId ? 'আপডেট সম্পন্ন করুন' : 'শিক্ষক সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="উস্তাদের তথ্য মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteTarget?.name}
        description="আপনি কি নিশ্চিতভাবে এই উস্তাদের যাবতীয় তথ্য ও বরাদ্দকৃত ক্লাসের রেকর্ড মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTeacher(deleteTarget.id);
            showToast(`"${deleteTarget.name}" এর তথ্য তালিকা থেকে মুছে ফেলা হয়েছে!`);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
