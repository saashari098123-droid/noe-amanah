import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { AcademicClass, KitabSubject } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Clock,
  Layers,
  Award,
  DollarSign,
  GraduationCap,
  Sparkles,
  BookMarked,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const AdminClasses: React.FC = () => {
  const {
    classes,
    teachers,
    addClass,
    updateClass,
    deleteClass,
    addKitabToClass,
    updateKitabInClass,
    deleteKitabFromClass,
  } = useMadrasa();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);

  // Delete targets & toast
  const [deleteClassTarget, setDeleteClassTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteKitabTarget, setDeleteKitabTarget] = useState<{ classId: string; kitabId: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New/Edit Class Form State
  const [className, setClassName] = useState('');
  const [classArabicName, setClassArabicName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [department, setDepartment] = useState<AcademicClass['department']>('madani_nisab');
  const [departmentLabel, setDepartmentLabel] = useState('মাদানী নেসাব বিভাগ');
  const [monthlyFee, setMonthlyFee] = useState(4500);
  const [monthlyFeeNonResidential, setMonthlyFeeNonResidential] = useState(1500);
  const [monthlyFeeDayCare, setMonthlyFeeDayCare] = useState(2800);
  const [monthlyFeeResidential, setMonthlyFeeResidential] = useState(4500);
  const [yearlyFee, setYearlyFee] = useState(6000);
  const [admissionFee, setAdmissionFee] = useState(3000);
  const [description, setDescription] = useState('');

  // Kitab Form State
  const [isAddingKitab, setIsAddingKitab] = useState(false);
  const [editingKitab, setEditingKitab] = useState<KitabSubject | null>(null);
  const [kitabName, setKitabName] = useState('');
  const [kitabType, setKitabType] = useState<KitabSubject['subjectType']>('madani_arabic');
  const [kitabTypeLabel, setKitabTypeLabel] = useState('আরবি ভাষা ও কথোপকথন');
  const [fullMarks, setFullMarks] = useState(100);
  const [passMarks, setPassMarks] = useState(40);
  const [writtenMarks, setWrittenMarks] = useState(80);
  const [oralMarks, setOralMarks] = useState(20);
  const [assignedTeacherName, setAssignedTeacherName] = useState('');

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassName('');
    setClassArabicName('');
    setClassCode(`MDN-0${classes.length + 1}`);
    setDepartment('madani_nisab');
    setDepartmentLabel('মাদানী নেসাব বিভাগ');
    setMonthlyFee(4500);
    setMonthlyFeeNonResidential(1500);
    setMonthlyFeeDayCare(2800);
    setMonthlyFeeResidential(4500);
    setYearlyFee(6000);
    setAdmissionFee(3000);
    setDescription('মাদানী নেসাবভিত্তিক বিশেষ পাঠ্যক্রম');
    setIsAddingClass(true);
  };

  const handleOpenEditClass = (cls: AcademicClass) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassArabicName(cls.arabicName || '');
    setClassCode(cls.code);
    setDepartment(cls.department);
    setDepartmentLabel(cls.departmentLabel || 'মাদানী নেসাব');
    setMonthlyFee(cls.monthlyFee || 4500);
    setMonthlyFeeNonResidential(cls.monthlyFeeNonResidential || 1500);
    setMonthlyFeeDayCare(cls.monthlyFeeDayCare || 2800);
    setMonthlyFeeResidential(cls.monthlyFeeResidential || cls.monthlyFee || 4500);
    setYearlyFee(cls.yearlyFee);
    setAdmissionFee(cls.admissionFee || 3000);
    setDescription(cls.description || '');
    setIsAddingClass(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      alert('জামাত/শ্রেণির নাম আবশ্যক!');
      return;
    }

    if (editingClass) {
      updateClass({
        ...editingClass,
        name: className.trim(),
        arabicName: classArabicName.trim(),
        code: classCode.trim(),
        department,
        departmentLabel,
        monthlyFee: Number(monthlyFeeResidential || monthlyFee),
        monthlyFeeNonResidential: Number(monthlyFeeNonResidential),
        monthlyFeeDayCare: Number(monthlyFeeDayCare),
        monthlyFeeResidential: Number(monthlyFeeResidential),
        yearlyFee: Number(yearlyFee),
        admissionFee: Number(admissionFee),
        description: description.trim(),
      });
      showToast('জামাতের তথ্য ও ফি কাঠামো সফলভাবে আপডেট হয়েছে!');
    } else {
      const created = addClass({
        name: className.trim(),
        arabicName: classArabicName.trim(),
        code: classCode.trim(),
        department,
        departmentLabel,
        monthlyFee: Number(monthlyFeeResidential || monthlyFee),
        monthlyFeeNonResidential: Number(monthlyFeeNonResidential),
        monthlyFeeDayCare: Number(monthlyFeeDayCare),
        monthlyFeeResidential: Number(monthlyFeeResidential),
        yearlyFee: Number(yearlyFee),
        admissionFee: Number(admissionFee),
        description: description.trim(),
        kitabs: [],
        periods: [],
      });
      setSelectedClassId(created.id);
      showToast('নতুন জামাত ও ফি কাঠামো সফলভাবে তৈরি করা হয়েছে!');
    }
    setIsAddingClass(false);
  };

  const handleDeleteClass = (id: string, name: string) => {
    setDeleteClassTarget({ id, name });
  };

  const confirmDeleteClass = () => {
    if (deleteClassTarget) {
      deleteClass(deleteClassTarget.id);
      showToast(`"${deleteClassTarget.name}" জামাতটি মুছে ফেলা হয়েছে!`);
      const remaining = classes.filter((c) => c.id !== deleteClassTarget.id);
      if (remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
      setDeleteClassTarget(null);
    }
  };

  // Kitab Actions
  const handleOpenAddKitab = () => {
    if (!activeClass) return;
    setEditingKitab(null);
    setKitabName('');
    setKitabType('madani_arabic');
    setKitabTypeLabel('আরবি ভাষা ও কথোপকথন');
    setFullMarks(100);
    setPassMarks(40);
    setWrittenMarks(80);
    setOralMarks(20);
    setAssignedTeacherName(teachers[0]?.nameBangla || '');
    setIsAddingKitab(true);
  };

  const handleOpenEditKitab = (k: KitabSubject) => {
    setEditingKitab(k);
    setKitabName(k.name);
    setKitabType(k.subjectType);
    setKitabTypeLabel(k.subjectTypeLabel || 'কিতাব/বিষয়');
    setFullMarks(k.fullMarks || 100);
    setPassMarks(k.passMarks || 40);
    setWrittenMarks(k.writtenMarks ?? 80);
    setOralMarks(k.oralMarks ?? 20);
    setAssignedTeacherName(k.assignedTeacherName || '');
    setIsAddingKitab(true);
  };

  const handleSaveKitab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;
    if (!kitabName.trim()) {
      return;
    }

    if (editingKitab) {
      updateKitabInClass(activeClass.id, {
        ...editingKitab,
        name: kitabName.trim(),
        subjectType: kitabType,
        subjectTypeLabel: kitabTypeLabel.trim(),
        fullMarks: Number(fullMarks),
        passMarks: Number(passMarks),
        writtenMarks: Number(writtenMarks),
        oralMarks: Number(oralMarks),
        assignedTeacherName: assignedTeacherName.trim(),
      });
      showToast('কিতাবের তথ্য আপডেট হয়েছে!');
    } else {
      addKitabToClass(activeClass.id, {
        name: kitabName.trim(),
        subjectType: kitabType,
        subjectTypeLabel: kitabTypeLabel.trim(),
        fullMarks: Number(fullMarks),
        passMarks: Number(passMarks),
        writtenMarks: Number(writtenMarks),
        oralMarks: Number(oralMarks),
        assignedTeacherName: assignedTeacherName.trim(),
      });
      showToast('নতুন কিতাব সফলভাবে জামাতে যুক্ত হয়েছে!');
    }
    setIsAddingKitab(false);
  };

  const handleDeleteKitab = (kitabId: string, name: string) => {
    if (!activeClass) return;
    setDeleteKitabTarget({ classId: activeClass.id, kitabId, name });
  };

  const confirmDeleteKitab = () => {
    if (deleteKitabTarget) {
      deleteKitabFromClass(deleteKitabTarget.classId, deleteKitabTarget.kitabId);
      showToast(`"${deleteKitabTarget.name}" কিতাবটি মুছে ফেলা হয়েছে!`);
      setDeleteKitabTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>মাদানী নেসাব ও সকল জামাত ডিরেক্টরি</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">জামাত ও কিতাব/পাঠ্যসূচী ব্যবস্থাপনা</h2>
          <p className="text-xs text-slate-500">
            অ্যাডমিন প্যানেল থেকে জামাত তৈরি করুন, ফি নির্ধারণ করুন এবং প্রতি জামাতের কিতাব ও পূর্ণমান সাজান
          </p>
        </div>

        <button
          onClick={handleOpenAddClass}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          নতুন জামাত তৈরি করুন
        </button>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {classes.map((cls) => {
          const isSelected = cls.id === (activeClass?.id || '');
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-800 text-white border-blue-900 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{cls.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-blue-950 text-blue-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cls.kitabs?.length || 0} কিতাব
              </span>
            </button>
          );
        })}
      </div>

      {activeClass && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Jamat Overview & Controls */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {activeClass.departmentLabel || activeClass.department}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">{activeClass.name}</h3>
                  {activeClass.arabicName && (
                    <p className="text-sm font-arabic text-blue-800 font-semibold">{activeClass.arabicName}</p>
                  )}
                  <p className="text-xs font-mono text-slate-400">কোড: {activeClass.code}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditClass(activeClass)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                    title="জামাত সম্পাদনা করুন"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {classes.length > 1 && (
                    <button
                      onClick={() => handleDeleteClass(activeClass.id, activeClass.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="জামাত মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {activeClass.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {activeClass.description}
                </p>
              )}

              {/* Fee Breakdown By Residence */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">আবাসন অনুযায়ী নির্ধারিত ফি কাঠামো:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-semibold">অনাবাসিক মাসিক</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-950">৳{activeClass.monthlyFeeNonResidential || 1500}</span>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-sky-700 block font-semibold">ডে-কেয়ার মাসিক</span>
                    <span className="text-xs sm:text-sm font-extrabold text-sky-950">৳{activeClass.monthlyFeeDayCare || 2800}</span>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 block font-semibold">আবাসিক মাসিক</span>
                    <span className="text-xs sm:text-sm font-extrabold text-indigo-950">৳{activeClass.monthlyFeeResidential || activeClass.monthlyFee || 4500}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-700 block font-semibold">ভর্তি ফি (এককালীন)</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-950">৳{activeClass.admissionFee || 3000}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-900 text-white p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                <Info className="w-4 h-4" />
                <span>মাদানী নেসাব ও কিতাব প্রণয়ন তথ্য</span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                এই জামাতে যেসব কিতাব যুক্ত করবেন, শিক্ষক ও ছাত্র প্যানেলে সেসব কিতাবের তালিকা প্রদর্শিত হবে এবং পরীক্ষার রেজাল্ট তৈরির সময় স্বয়ংক্রিয়ভাবে বিষয়গুলো চলে আসবে।
              </p>
            </div>
          </div>

          {/* Right Column (2 spans): Kitabs List & Kitab Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-blue-700" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">এই জামাতের নির্ধারিত কিতাব ও বিষয়সমূহ</h3>
                    <p className="text-xs text-slate-500">মোট কিতাব: {activeClass.kitabs?.length || 0} টি</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenAddKitab}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন কিতাব যোগ করুন
                </button>
              </div>

              {/* Kitabs Table / Cards */}
              {!activeClass.kitabs || activeClass.kitabs.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">এই জামাতে এখনো কোনো কিতাব যোগ করা হয়নি।</p>
                  <button
                    onClick={handleOpenAddKitab}
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    প্রথম কিতাব যোগ করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeClass.kitabs.map((k, idx) => (
                    <div
                      key={k.id || idx}
                      className="p-3.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-800">{k.name}</h4>
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                              {k.subjectTypeLabel || k.subjectType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>পূর্ণমান: <strong className="text-slate-800">{k.fullMarks}</strong></span>
                            <span>পাস: <strong className="text-blue-700">{k.passMarks}</strong></span>
                            <span>লিখিত: {k.writtenMarks ?? 80}</span>
                            <span>মৌখিক: {k.oralMarks ?? 20}</span>
                            {k.assignedTeacherName && (
                              <span className="text-blue-800 font-medium">উস্তাদ: {k.assignedTeacherName}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEditKitab(k)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition"
                          title="কিতাব সম্পাদনা"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKitab(k.id, k.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition"
                          title="কিতাব মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isAddingClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingClass ? 'জামাতের তথ্য সম্পাদনা করুন' : 'নতুন জামাত / শ্রেণি তৈরি করুন'}
              </h3>
              <button
                onClick={() => setIsAddingClass(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">জামাত / শ্রেণির নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="যেমন: ইবতিদায়িয়্যাহ ১ম বর্ষ (মাদানী নেসাব)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আরবি নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={classArabicName}
                    onChange={(e) => setClassArabicName(e.target.value)}
                    placeholder="السنة الأولى الابتدائية"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-arabic focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জামাত কোড</label>
                  <input
                    type="text"
                    required
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="MDN-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিভাগ টাইপ</label>
                  <select
                    value={department}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setDepartment(val);
                      if (val === 'madani_nisab') setDepartmentLabel('মাদানী নেসাব বিভাগ');
                      else if (val === 'hifz') setDepartmentLabel('হিফজুল কুরআন বিভাগ');
                      else if (val === 'kitab') setDepartmentLabel('দাওরায়ে হাদিস / কিতাব');
                      else if (val === 'noorani') setDepartmentLabel('নূরানী ও নাজেরা');
                      else setDepartmentLabel('সাধারণ ও অন্যান্য');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="madani_nisab">মাদানী নেসাব (Madani Nisab)</option>
                    <option value="hifz">হিফজুল কুরআন বিভাগ (Hifz)</option>
                    <option value="kitab">দাওরায়ে হাদিস / কিতাব (Kitab)</option>
                    <option value="noorani">নূরানী ও নাজেরা (Noorani)</option>
                    <option value="ifta">উচ্চতর ইফতা বিভাগ (Ifta)</option>
                    <option value="general">সাধারণ ও অন্যান্য (General)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-blue-950 block">আবাসন অনুযায়ী মাসিক বেতন ও অন্যান্য ফি নির্ধারণ:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">অনাবাসিক মাসিক বেতন (৳)</label>
                      <input
                        type="number"
                        required
                        value={monthlyFeeNonResidential}
                        onChange={(e) => setMonthlyFeeNonResidential(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ডে-কেয়ার মাসিক বেতন (৳)</label>
                      <input
                        type="number"
                        required
                        value={monthlyFeeDayCare}
                        onChange={(e) => setMonthlyFeeDayCare(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">আবাসিক মাসিক বেতন (৳)</label>
                      <input
                        type="number"
                        required
                        value={monthlyFeeResidential}
                        onChange={(e) => {
                          setMonthlyFeeResidential(Number(e.target.value));
                          setMonthlyFee(Number(e.target.value));
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">এককালীন ভর্তি ফি (টাকা)</label>
                      <input
                        type="number"
                        value={admissionFee}
                        onChange={(e) => setAdmissionFee(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-amber-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">বার্ষিক সেশন ফি (টাকা)</label>
                      <input
                        type="number"
                        required
                        value={yearlyFee}
                        onChange={(e) => setYearlyFee(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">জামাতের সংক্ষিপ্ত বিবরণ ও বৈশিষ্ট্য</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="এই জামাতে কি কি শেখানো হবে..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingClass(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingClass ? 'পরিবর্তন সংরক্ষণ করুন' : 'জামাত তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Kitab Modal */}
      {isAddingKitab && activeClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-blue-700 font-bold">{activeClass.name}</span>
                <h3 className="font-bold text-slate-800 text-base">
                  {editingKitab ? 'কিতাবের তথ্য সম্পাদনা' : 'নতুন কিতাব / বিষয় অন্তর্ভুক্তি'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddingKitab(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKitab} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কিতাব / বিষয়ের নাম *</label>
                <input
                  type="text"
                  required
                  value={kitabName}
                  onChange={(e) => setKitabName(e.target.value)}
                  placeholder="যেমন: এসো আরবি শিখি (১ম খণ্ড), নাহবেমীর, ইত্যাদি"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিষয়ের ধরন</label>
                  <select
                    value={kitabType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setKitabType(val);
                      if (val === 'madani_arabic') setKitabTypeLabel('আরবি ভাষা ও কথোপকথন');
                      else if (val === 'nahu_sarf') setKitabTypeLabel('নাহু ও সরফ');
                      else if (val === 'hadith') setKitabTypeLabel('হাদিস শরিফ');
                      else if (val === 'fiqh') setKitabTypeLabel('ফিকহ ও উসুল');
                      else if (val === 'tafsir') setKitabTypeLabel('তাফসিরুল কুরআন');
                      else if (val === 'quran_hifz') setKitabTypeLabel('হিফজ ও তাজবীদ');
                      else if (val === 'adab') setKitabTypeLabel('আরবি সাহিত্য ও লিখন');
                      else setKitabTypeLabel('সাধারণ শিক্ষা');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="madani_arabic">মাদানী আরবি (Madani Arabic)</option>
                    <option value="nahu_sarf">নাহু ও সরফ (Nahu & Sarf)</option>
                    <option value="hadith">হাদিস শরিফ (Hadith)</option>
                    <option value="fiqh">ফিকহ ও উসুল (Fiqh)</option>
                    <option value="tafsir">তাফসির (Tafsir)</option>
                    <option value="quran_hifz">হিফজ ও তাজবীদ (Quran)</option>
                    <option value="adab">আরবি সাহিত্য (Adab)</option>
                    <option value="general">সাধারণ শিক্ষা (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">লেবেল / বিভাগ</label>
                  <input
                    type="text"
                    value={kitabTypeLabel}
                    onChange={(e) => setKitabTypeLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণমান (Full Marks)</label>
                  <input
                    type="number"
                    required
                    value={fullMarks}
                    onChange={(e) => setFullMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পাস নম্বর (Pass Marks)</label>
                  <input
                    type="number"
                    required
                    value={passMarks}
                    onChange={(e) => setPassMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">লিখিত নম্বর</label>
                  <input
                    type="number"
                    value={writtenMarks}
                    onChange={(e) => setWrittenMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মৌখিক নম্বর</label>
                  <input
                    type="number"
                    value={oralMarks}
                    onChange={(e) => setOralMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">নিযুক্ত উস্তাদ / শিক্ষক</label>
                  <input
                    type="text"
                    value={assignedTeacherName}
                    onChange={(e) => setAssignedTeacherName(e.target.value)}
                    placeholder="যেমন: মাওলানা আব্দুল্লাহ আল মামুন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingKitab(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingKitab ? 'আপডেট করুন' : 'কিতাব যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Class Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteClassTarget)}
        title="জামাত মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteClassTarget?.name}
        description="আপনি কি নিশ্চিতভাবে এই জামাত ও এর অন্তর্ভুক্ত সকল কিতাবের তালিকা মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={confirmDeleteClass}
        onClose={() => setDeleteClassTarget(null)}
      />

      {/* Delete Kitab Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteKitabTarget)}
        title="কিতাব মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteKitabTarget?.name}
        description="আপনি কি নিশ্চিতভাবে এই কিতাবটি উক্ত জামাত থেকে মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={confirmDeleteKitab}
        onClose={() => setDeleteKitabTarget(null)}
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
