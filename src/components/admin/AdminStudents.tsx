import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Student } from '../../types';
import { ImageUploadHelper } from '../common/ImageUploadHelper';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { AdminExcelGoogleDriveModal } from './AdminExcelGoogleDriveModal';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Phone,
  Calendar,
  CheckCircle2,
  Filter,
  Key,
  Shield,
  Copy,
  FileSpreadsheet,
  Upload,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminStudents: React.FC = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent } = useMadrasa();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelModalTab, setExcelModalTab] = useState<'excel_import' | 'excel_export' | 'google_drive'>('excel_import');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Fields
  const [id, setId] = useState(`DA-2026-${100 + students.length + 1}`);
  const [password, setPassword] = useState('student123');
  const [email, setEmail] = useState('');
  const [nameBangla, setNameBangla] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [roll, setRoll] = useState(1);
  const [classId, setClassId] = useState(classes[0]?.id || 'cls-madani-1');
  const [year, setYear] = useState(2026);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [residentialStatus, setResidentialStatus] = useState<'residential' | 'non-residential' | 'day-care'>('residential');
  const [monthlyFee, setMonthlyFee] = useState(4000);
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');

  const filteredStudents = students.filter((st) => {
    const matchClass = selectedClassFilter === 'all' || st.classId === selectedClassFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      st.nameBangla.toLowerCase().includes(q) ||
      (st.nameEnglish && st.nameEnglish.toLowerCase().includes(q)) ||
      st.id.toLowerCase().includes(q) ||
      (st.guardianPhone && st.guardianPhone.includes(q));
    return matchClass && matchSearch;
  });

  const openAddModal = () => {
    setEditingStudentId(null);
    setId(`DA-2026-${100 + students.length + 1}`);
    setPassword('student123');
    setEmail('');
    setNameBangla('');
    setNameEnglish('');
    setRoll(students.length + 1);
    setClassId(classes[0]?.id || 'cls-madani-1');
    setYear(2026);
    setFatherName('');
    setMotherName('');
    setGuardianPhone('');
    setResidentialStatus('residential');
    setMonthlyFee(4000);
    setAddress('');
    setBloodGroup('B+');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (st: Student) => {
    setEditingStudentId(st.id);
    setId(st.id);
    setPassword(st.password || 'student123');
    setEmail(st.email || '');
    setNameBangla(st.nameBangla);
    setNameEnglish(st.nameEnglish || '');
    setRoll(st.roll);
    setClassId(st.classId);
    setYear(st.year || 2026);
    setFatherName(st.fatherName || '');
    setMotherName(st.motherName || '');
    setGuardianPhone(st.guardianPhone || '');
    setResidentialStatus(st.residentialStatus || 'residential');
    setMonthlyFee(st.monthlyFee || 4000);
    setAddress(st.address || '');
    setBloodGroup(st.bloodGroup || 'B+');
    setPhotoUrl(st.photoUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClass = classes.find((c) => c.id === classId);
    const resolvedClassName = selClass ? selClass.name : 'জামাত';

    const studentData: Student = {
      id: id.trim(),
      password: password.trim() || 'student123',
      email: email.trim() || undefined,
      nameBangla: nameBangla.trim(),
      nameEnglish: nameEnglish.trim() || undefined,
      roll: Number(roll),
      classId,
      className: resolvedClassName,
      year: Number(year),
      fatherName: fatherName.trim() || undefined,
      motherName: motherName.trim() || undefined,
      guardianPhone: guardianPhone.trim() || undefined,
      residentialStatus,
      monthlyFee: Number(monthlyFee),
      admissionDate: new Date().toLocaleDateString('bn-BD'),
      photoUrl,
      address: address.trim() || undefined,
      bloodGroup: bloodGroup.trim() || undefined,
    };

    if (editingStudentId) {
      updateStudent(studentData);
      alert('শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      addStudent(studentData);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      alert(`নতুন শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে! লগইন আইডি: ${studentData.id}`);
    }

    setIsModalOpen(false);
  };

  const copyId = (studentId: string) => {
    navigator.clipboard.writeText(studentId);
    alert(`ছাত্র আইডি "${studentId}" কপি করা হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              প্রতিষ্ঠানের ছাত্র তালিকা ও আইডি নম্বর ব্যবস্থাপনা
            </h2>
            <p className="text-xs text-slate-500">
              মোট নিবন্ধিত শিক্ষার্থী: {students.length} জন • শুধুমাত্র অ্যাডমিন কর্তৃক প্রদত্ত আইডি দিয়েই ছাত্ররা লগইন করতে পারবে
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setExcelModalTab('excel_import');
                setIsExcelModalOpen(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="এক্সেলে শিক্ষার্থীদের তথ্য প্রস্তুত করে একসাথে আপলোড করুন"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>এক্সেল ইম্পোর্ট / এক্সপোর্ট</span>
            </button>

            <button
              onClick={openAddModal}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ছাত্র ভর্তি</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">শ্রেণি ফিল্টার:</span>
            <button
              onClick={() => setSelectedClassFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedClassFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              সকল শ্রেণি ({students.length})
            </button>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassFilter(cls.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedClassFilter === cls.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, আইডি বা মোবাইল খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 overflow-hidden space-y-3">
        {/* Mobile scroll indicator */}
        <div className="sm:hidden flex items-center justify-between bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
          <span>📱 মোবাইলে টেবিলের সকল তথ্য দেখতে ডানে-বামে স্ক্রল করুন</span>
          <span className="font-mono text-xs">👉</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">কোন শিক্ষার্থী পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[780px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">লগইন আইডি ও পাসওয়ার্ড</th>
                  <th className="p-3">শিক্ষার্থীর নাম</th>
                  <th className="p-3">শ্রেণি ও বছর</th>
                  <th className="p-3">পিতা ও অভিভাবক মোবাইল</th>
                  <th className="p-3">আবাসন ও ফি</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-blue-800 text-sm">{st.id}</span>
                        <button
                          onClick={() => copyId(st.id)}
                          title="আইডি কপি করুন"
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Key className="w-3 h-3 text-amber-500" />
                        <span className="font-mono">{st.password || 'student123'}</span>
                        <span className="text-slate-300">|</span>
                        <span>রোল: {st.roll}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                          alt={st.nameBangla}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{st.nameBangla}</div>
                          {st.nameEnglish && <div className="text-[11px] text-slate-400">{st.nameEnglish}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{st.className}</div>
                      <div className="text-[10px] text-slate-400">শিক্ষাবর্ষ: {st.year || 2026}</div>
                    </td>

                    <td className="p-3 text-slate-600">
                      <div>পিতা: {st.fatherName || 'উল্লেখ নেই'}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-600" />
                        {st.guardianPhone || 'মোবাইল নেই'}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900 font-mono">৳{st.monthlyFee}</div>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {st.residentialStatus === 'residential'
                          ? 'আবাসিক'
                          : st.residentialStatus === 'non-residential'
                          ? 'অনাবাসিক'
                          : 'ডে-কেয়ার'}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: st.id, name: st.nameBangla })}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingStudentId ? 'শিক্ষার্থীর তথ্য ও আইডি পরিবর্তন' : 'নতুন শিক্ষার্থী ভর্তি ফরম'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ID & Password */}
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 space-y-1">
                  <label className="block text-xs font-bold text-blue-950">
                    ছাত্র আইডি নম্বর (লগইন আইডি) *
                  </label>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="যেমন: DA-2026-101"
                    className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold text-blue-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-blue-700">এই আইডি নম্বরটি দিয়েই ছাত্র লগইন করবে</p>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100 space-y-1">
                  <label className="block text-xs font-bold text-amber-950">
                    ছাত্র পাসওয়ার্ড / পিন
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ডিফল্ট: student123"
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-700">ছাত্রের পাসওয়ার্ড (ডিফল্ট: student123)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={nameBangla}
                    onChange={(e) => setNameBangla(e.target.value)}
                    placeholder="মুহাম্মদ তৌহিদুল ইসলাম"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ইংরেজি নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    placeholder="Muhammad Towhidul Islam"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জামাত / শ্রেণি *</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শ্রেণি রোল</label>
                  <input
                    type="number"
                    required
                    value={roll}
                    onChange={(e) => setRoll(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অভিভাবকের মোবাইল *</label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="01711-xxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আবাসিক অবস্থা</label>
                  <select
                    value={residentialStatus}
                    onChange={(e) => setResidentialStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="residential">আবাসিক (Residential)</option>
                    <option value="non-residential">অনাবাসিক (Non-residential)</option>
                    <option value="day-care">ডে-কেয়ার (Day care)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মাসিক বেতন (টাকা)</label>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadHelper
                    label="শিক্ষার্থীর ছবি (ফোল্ডার থেকে নির্বাচন করুন)"
                    currentValue={photoUrl}
                    onChange={(url) => setPhotoUrl(url)}
                    aspectRatio="square"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingStudentId ? 'আপডেট করুন' : 'ভর্তি সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="শিক্ষার্থীর তথ্য মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteTarget?.name}
        description="আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর যাবতীয় তথ্য মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={() => {
          if (deleteTarget) {
            deleteStudent(deleteTarget.id);
            showToast(`"${deleteTarget.name}" এর তথ্য সফলভাবে মুছে ফেলা হয়েছে!`);
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

      {/* Excel & Google Drive Modal */}
      <AdminExcelGoogleDriveModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        defaultTab={excelModalTab}
      />
    </div>
  );
};
