import React, { useState, useMemo, useRef } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SyllabusItem, SyllabusTopic } from '../../types';
import { printHtmlElement } from '../../utils/printHelper';
import {
  BookMarked,
  Search,
  CheckCircle2,
  Circle,
  Printer,
  Calendar,
  ExternalLink,
  BookOpen,
  X,
  FileCheck2,
  Copy,
  Check,
  Upload,
  FileText,
  Trash2,
  Plus,
  Edit3,
  Download,
  Eye,
  UserCheck,
  Sparkles,
  AlertCircle,
  FileUp,
  RotateCcw,
} from 'lucide-react';

import { AutoSyllabusParserModal } from '../common/AutoSyllabusParserModal';

export const TeacherSyllabus: React.FC = () => {
  const {
    syllabuses,
    classes,
    teachers,
    currentTeacher,
    madrasaInfo,
    addSyllabus,
    updateSyllabus,
    deleteSyllabus,
    toggleSyllabusTopicCompleted,
  } = useMadrasa();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiParserOpen, setIsAiParserOpen] = useState<boolean>(false);

  // PDF Viewer Modal State
  const [viewingPdfItem, setViewingPdfItem] = useState<SyllabusItem | null>(null);

  // Quick PDF Upload State for single card
  const [quickUploadItem, setQuickUploadItem] = useState<SyllabusItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add/Edit Syllabus Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusItem | null>(null);

  // Form State
  const [formClassId, setFormClassId] = useState<string>('');
  const [formSubjectName, setFormSubjectName] = useState<string>('');
  const [formKitabName, setFormKitabName] = useState<string>('');
  const [formTeacherName, setFormTeacherName] = useState<string>('');
  const [formTerm, setFormTerm] = useState<string>('first_term');
  const [formTermLabel, setFormTermLabel] = useState<string>('১ম সাময়িক পরীক্ষা ২০২৬');
  const [formAcademicYear, setFormAcademicYear] = useState<number>(2026);
  const [formTotalMarks, setFormTotalMarks] = useState<number>(100);
  const [formPassMarks, setFormPassMarks] = useState<number>(40);
  const [formMarksDistribution, setFormMarksDistribution] = useState<string>('লিখিত ৮০ + মৌখিক ২০');
  const [formOverview, setFormOverview] = useState<string>('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formAttachmentSize, setFormAttachmentSize] = useState<string>('');
  const [formTopics, setFormTopics] = useState<SyllabusTopic[]>([
    {
      id: `top-${Date.now()}-1`,
      topicName: '১ম অধ্যায়: সূচনা ও মৌলিক পাঠ',
      pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ২৫',
      targetDate: '',
      isCompleted: false,
      note: '',
    },
  ]);

  // Helper to dynamically resolve teacher display name from live teacher list
  const getTeacherDisplayName = (item: SyllabusItem): string => {
    if (item.teacherId) {
      const t = teachers.find((teach) => teach.id === item.teacherId);
      if (t) return t.nameBangla;
    }
    if (item.teacherName) {
      const t = teachers.find((teach) => teach.nameBangla === item.teacherName);
      if (t) return t.nameBangla;
    }
    if (item.createdBy) {
      const t = teachers.find(
        (teach) => teach.nameBangla === item.createdBy || item.createdBy?.includes(teach.nameBangla)
      );
      if (t) return t.nameBangla;
    }
    // Match from class periods
    const cls = classes.find((c) => c.id === item.classId);
    const periodTeacher = cls?.periods?.find(
      (p) =>
        p.subjectName.toLowerCase().includes(item.subjectName.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(p.subjectName.toLowerCase())
    )?.teacherName;
    if (periodTeacher) {
      const t = teachers.find((teach) => teach.nameBangla === periodTeacher);
      if (t) return t.nameBangla;
    }
    // Match from teacher assigned subjects
    const subjectTeacher = teachers.find((t) =>
      t.assignedSubjects?.some(
        (s) =>
          s.toLowerCase().includes(item.subjectName.toLowerCase()) ||
          item.subjectName.toLowerCase().includes(s.toLowerCase())
      )
    );
    if (subjectTeacher) return subjectTeacher.nameBangla;

    // Fallback to currently logged in teacher or first teacher
    return currentTeacher?.nameBangla || teachers[0]?.nameBangla || 'দায়িত্বশীল উস্তাদ';
  };

  // Filter syllabuses
  const filteredSyllabuses = useMemo(() => {
    return syllabuses.filter((item) => {
      if (selectedClassId !== 'all' && item.classId !== selectedClassId) {
        return false;
      }
      if (selectedTerm !== 'all' && item.term !== selectedTerm) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSub = item.subjectName.toLowerCase().includes(q);
        const matchKit = (item.kitabName || '').toLowerCase().includes(q);
        const matchClass = item.className.toLowerCase().includes(q);
        const matchTeacher = getTeacherDisplayName(item).toLowerCase().includes(q);
        const matchTopic = item.topics.some(
          (t) =>
            t.topicName.toLowerCase().includes(q) ||
            (t.pageRangeOrChapters || '').toLowerCase().includes(q)
        );
        if (!matchSub && !matchKit && !matchClass && !matchTopic && !matchTeacher) return false;
      }
      return true;
    });
  }, [syllabuses, selectedClassId, selectedTerm, searchQuery, teachers]);

  // Statistics
  const totalTopics = useMemo(() => {
    return filteredSyllabuses.reduce((acc, curr) => acc + (curr.topics?.length || 0), 0);
  }, [filteredSyllabuses]);

  const completedTopics = useMemo(() => {
    return filteredSyllabuses.reduce(
      (acc, curr) => acc + (curr.topics?.filter((t) => t.isCompleted)?.length || 0),
      0
    );
  }, [filteredSyllabuses]);

  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Handle PDF File Conversion to Base64 Data URL
  const processPdfFile = (file: File): Promise<{ url: string; name: string; size: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      reader.onload = () => {
        resolve({
          url: reader.result as string,
          name: file.name,
          size: sizeStr,
        });
      };
      reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে'));
      reader.readAsDataURL(file);
    });
  };

  // Direct File Selection from Card
  const handleDirectPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadItem) return;

    try {
      const { url, name, size } = await processPdfFile(file);
      updateSyllabus({
        ...quickUploadItem,
        attachmentUrl: url,
        attachmentName: name,
        attachmentSize: size,
        updatedAt: new Date().toISOString(),
      });
      alert(`‘${name}’ সফলভাবে এই সিলেবাসে পিডিএফ হিসেবে যুক্ত ও সংরক্ষণ করা হয়েছে!`);
      setQuickUploadItem(null);
    } catch (err) {
      alert('ফাইল আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // Remove PDF from a syllabus
  const handleRemovePdf = (item: SyllabusItem) => {
    if (window.confirm(`আপনি কি এই সিলেবাস থেকে ‘${item.attachmentName || 'সংযুক্ত ফাইল'}’ মুছে ফেলতে চান?`)) {
      updateSyllabus({
        ...item,
        attachmentUrl: '',
        attachmentName: '',
        attachmentSize: '',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSyllabus(null);
    const defaultClass =
      classes.find((c) => currentTeacher?.assignedClasses?.includes(c.id)) || classes[0];
    setFormClassId(defaultClass ? defaultClass.id : '');
    const firstKitab = defaultClass?.kitabs?.[0];
    setFormSubjectName(firstKitab?.name || '');
    setFormKitabName(firstKitab?.name || '');
    setFormTeacherName(currentTeacher?.nameBangla || teachers[0]?.nameBangla || '');
    setFormTerm('first_term');
    setFormTermLabel('১ম সাময়িক পরীক্ষা ২০২৬');
    setFormAcademicYear(2026);
    setFormTotalMarks(firstKitab?.fullMarks || 100);
    setFormPassMarks(firstKitab?.passMarks || 40);
    setFormMarksDistribution(
      firstKitab
        ? `লিখিত ${firstKitab.writtenMarks ?? 80} + মৌখিক ${firstKitab.oralMarks ?? 20}`
        : 'লিখিত ৮০ + মৌখিক ২০'
    );
    setFormOverview('');
    setFormAttachmentUrl('');
    setFormAttachmentName('');
    setFormAttachmentSize('');
    setFormTopics([
      {
        id: `top-${Date.now()}-1`,
        topicName: '১ম অধ্যায়: সূচনা ও মৌলিক পাঠ',
        pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ২৫',
        targetDate: '',
        isCompleted: false,
        note: '',
      },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: SyllabusItem) => {
    setEditingSyllabus(item);
    setFormClassId(item.classId);
    setFormSubjectName(item.subjectName);
    setFormKitabName(item.kitabName || '');
    setFormTeacherName(getTeacherDisplayName(item));
    setFormTerm(item.term);
    setFormTermLabel(item.termLabel);
    setFormAcademicYear(item.academicYear);
    setFormTotalMarks(item.totalMarks || 100);
    setFormPassMarks(item.passMarks || 40);
    setFormMarksDistribution(item.marksDistribution || '');
    setFormOverview(item.overview || '');
    setFormAttachmentUrl(item.attachmentUrl || '');
    setFormAttachmentName(item.attachmentName || '');
    setFormAttachmentSize(item.attachmentSize || '');
    setFormTopics(item.topics && item.topics.length > 0 ? [...item.topics] : []);
    setIsModalOpen(true);
  };

  // Form Class Change
  const handleFormClassChange = (newClassId: string) => {
    setFormClassId(newClassId);
    const targetClass = classes.find((c) => c.id === newClassId);
    if (targetClass && targetClass.kitabs && targetClass.kitabs.length > 0) {
      const firstKitab = targetClass.kitabs[0];
      setFormSubjectName(firstKitab.name);
      setFormKitabName(firstKitab.name);
      setFormTotalMarks(firstKitab.fullMarks);
      setFormPassMarks(firstKitab.passMarks);
      setFormMarksDistribution(
        `লিখিত ${firstKitab.writtenMarks ?? 80} + মৌখিক ${firstKitab.oralMarks ?? 20}`
      );
    }
  };

  // Form Topics Management
  const handleAddTopicRow = () => {
    const newTopic: SyllabusTopic = {
      id: `top-${Date.now()}-${formTopics.length + 1}`,
      topicName: '',
      pageRangeOrChapters: '',
      targetDate: '',
      isCompleted: false,
      note: '',
    };
    setFormTopics([...formTopics, newTopic]);
  };

  const handleRemoveTopicRow = (idx: number) => {
    setFormTopics(formTopics.filter((_, i) => i !== idx));
  };

  const handleTopicFieldChange = (idx: number, field: keyof SyllabusTopic, value: any) => {
    const updated = [...formTopics];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormTopics(updated);
  };

  // Save Syllabus
  const handleSaveSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassId || !formSubjectName.trim()) {
      alert('অনুগ্রহ করে জামাত এবং বিষয়ের নাম নির্ধারণ করুন।');
      return;
    }

    const selectedClass = classes.find((c) => c.id === formClassId);
    const className = selectedClass ? selectedClass.name : 'সাধারণ শ্রেণি';
    const selectedTeacher = teachers.find((t) => t.nameBangla === formTeacherName);

    const cleanTopics = formTopics.filter((t) => t.topicName.trim() !== '');
    if (cleanTopics.length === 0) {
      cleanTopics.push({
        id: `top-${Date.now()}`,
        topicName: 'সম্পূর্ণ পাঠ্যসূচি ও অনুশীলন',
        pageRangeOrChapters: 'সম্পূর্ণ কিতাব',
        isCompleted: false,
      });
    }

    if (editingSyllabus) {
      updateSyllabus({
        ...editingSyllabus,
        classId: formClassId,
        className,
        subjectName: formSubjectName.trim(),
        kitabName: formKitabName.trim() || formSubjectName.trim(),
        teacherId: selectedTeacher?.id,
        teacherName: formTeacherName.trim(),
        term: formTerm,
        termLabel: formTermLabel,
        academicYear: Number(formAcademicYear) || 2026,
        totalMarks: Number(formTotalMarks) || 100,
        passMarks: Number(formPassMarks) || 40,
        marksDistribution: formMarksDistribution.trim(),
        overview: formOverview.trim(),
        attachmentUrl: formAttachmentUrl.trim(),
        attachmentName: formAttachmentName.trim(),
        attachmentSize: formAttachmentSize.trim(),
        topics: cleanTopics,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addSyllabus({
        classId: formClassId,
        className,
        subjectName: formSubjectName.trim(),
        kitabName: formKitabName.trim() || formSubjectName.trim(),
        teacherId: selectedTeacher?.id,
        teacherName: formTeacherName.trim(),
        term: formTerm,
        termLabel: formTermLabel,
        academicYear: Number(formAcademicYear) || 2026,
        totalMarks: Number(formTotalMarks) || 100,
        passMarks: Number(formPassMarks) || 40,
        marksDistribution: formMarksDistribution.trim(),
        overview: formOverview.trim(),
        attachmentUrl: formAttachmentUrl.trim(),
        attachmentName: formAttachmentName.trim(),
        attachmentSize: formAttachmentSize.trim(),
        topics: cleanTopics,
        createdBy: formTeacherName.trim() || currentTeacher?.nameBangla || 'শিক্ষক',
      });
    }

    setIsModalOpen(false);
  };

  // Print syllabus
  const handlePrint = () => {
    printHtmlElement('teacher-printable-syllabus-sheet', {
      title: `${madrasaInfo.nameBangla} - শিক্ষক পাঠ্যসূচি`,
    });
  };

  const handleCopy = (item: SyllabusItem) => {
    const text = `📋 ${item.className} - ${item.termLabel}\n📚 বিষয়: ${item.subjectName}\n👤 শিক্ষক: ${getTeacherDisplayName(item)}\n📖 অধ্যায়সমূহ:\n${item.topics.map((t, idx) => `${idx + 1}. ${t.topicName} [${t.pageRangeOrChapters || ''}] ${t.isCompleted ? ' (সম্পন্ন ✅)' : ''}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Card-level Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,image/*"
        onChange={handleDirectPdfUpload}
        className="hidden"
      />

      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-100 text-blue-900 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-blue-700" />
                পাঠ্যক্রম, পাঠপরিকল্পনা ও পিডিএফ ব্যবস্থাপনা
              </span>
              <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-700" />
                শিক্ষক: {currentTeacher?.nameBangla || teachers[0]?.nameBangla || 'মুহতারাম উস্তাদ'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2">
              ক্লাসভিত্তিক সিলেবাস ও শিক্ষক পাঠপরিকল্পনা
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              সরাসরি পিডিএফ ফাইল যোগ করুন, অধ্যায়গুলোর প্রগ্রেস টিক দিন এবং পাঠপরিকল্পনা পরিচালনা করুন
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAiParserOpen(true)}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer border border-amber-300/60"
              title="পিডিএফ বা ছবি দিলে এআই স্বয়ংক্রিয়ভাবে বিষয়, অধ্যায় ও পৃষ্ঠা সাজিয়ে দিবে"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>এআই পিডিএফ সিলেবাস পার্সার</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সিলেবাস যোগ করুন</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>প্রিন্ট শিট</span>
            </button>
          </div>
        </div>

        {/* Teacher Progress Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-700 font-medium">নির্ধারিত বিষয়</div>
              <div className="text-xl font-extrabold text-blue-900 mt-0.5">
                {filteredSyllabuses.length} টি
              </div>
            </div>
            <BookOpen className="w-8 h-8 text-blue-300" />
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-700 font-medium">সম্পন্ন অধ্যায়/সবক</div>
              <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                {completedTopics} / {totalTopics} টি
              </div>
            </div>
            <FileCheck2 className="w-8 h-8 text-emerald-300" />
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
                <span>সার্বিক সিলেবাস অগ্রগতি</span>
                <span className="font-extrabold text-amber-900">{overallProgress}%</span>
              </div>
              <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">জামাত / শ্রেণি</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সকল জামাত ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পরীক্ষা / টার্ম</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সকল পরীক্ষা</option>
              <option value="first_term">১ম সাময়িক পরীক্ষা</option>
              <option value="mid_term">অর্ধ-বার্ষিক / ২য় সাময়িক</option>
              <option value="final_term">বার্ষিক / সমাপনী</option>
              <option value="annual">পূর্ণাঙ্গ বার্ষিক পাঠপরিকল্পনা</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">অনুসন্ধান</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিষয়, শিক্ষক বা অধ্যায় খুঁজুন..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Syllabuses Cards */}
      {filteredSyllabuses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">সিলেবাস পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1">
            নির্বাচিত ফিল্টারে কোনো তথ্য পাওয়া যায়নি। আপনি নতুন সিলেবাস যোগ করতে পারেন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSyllabuses.map((item) => {
            const completedCount = item.topics.filter((t) => t.isCompleted).length;
            const totalCount = item.topics.length;
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const teacherName = getTeacherDisplayName(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="bg-blue-800 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                          {item.className}
                        </span>
                        <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                          {item.termLabel}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900">{item.subjectName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                        {item.kitabName && item.kitabName !== item.subjectName && (
                          <span>
                            কিতাব: <strong className="text-blue-900">{item.kitabName}</strong>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200/60">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          {teacherName}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="সিলেবাস সম্পাদনা করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="অনুলিপি (Copy) করুন"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Marks breakdown */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-3">
                    <span className="text-slate-600">
                      মোট: <strong className="text-slate-900">{item.totalMarks || 100}</strong> (পাস:{' '}
                      {item.passMarks || 40})
                    </span>
                    <span className="text-blue-900 font-medium">{item.marksDistribution}</span>
                  </div>

                  {/* Overview note */}
                  {item.overview && (
                    <p className="text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50 mb-3">
                      <strong>নির্দেশনা:</strong> {item.overview}
                    </p>
                  )}

                  {/* Interactive Topics Checklist */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>পাঠ্য অধ্যায় ও অগ্রগতি ({item.topics.length}টি)</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{pct}% সম্পন্ন</span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {item.topics.map((topic) => (
                        <div
                          key={topic.id}
                          onClick={() => toggleSyllabusTopicCompleted(item.id, topic.id)}
                          className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-2.5 border transition cursor-pointer select-none ${
                            topic.isCompleted
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              className="mt-0.5 shrink-0"
                              title={topic.isCompleted ? 'সম্পন্ন' : 'অসম্পূর্ণ'}
                            >
                              {topic.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <div>
                              <div
                                className={`font-semibold leading-tight ${
                                  topic.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                                }`}
                              >
                                {topic.topicName}
                              </div>
                              {topic.note && (
                                <p className="text-[10px] text-slate-500 mt-0.5">{topic.note}</p>
                              )}
                            </div>
                          </div>

                          {topic.pageRangeOrChapters && (
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                              {topic.pageRangeOrChapters}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PDF & Document Attachment Section */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  {item.attachmentUrl ? (
                    <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-blue-950 truncate">
                            {item.attachmentName || `${item.subjectName} সিলেবাস`}
                          </div>
                          <div className="text-[10px] text-blue-700">
                            {item.attachmentSize ? `${item.attachmentSize} • ` : ''}পিডিএফ ফাইল সংযুক্ত
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setViewingPdfItem(item)}
                          className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          title="পিডিএফ প্রিভিউ দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>দেখুন</span>
                        </button>

                        <button
                          onClick={() => {
                            setQuickUploadItem(item);
                            fileInputRef.current?.click();
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition"
                          title="পিডিএফ পরিবর্তন করুন"
                        >
                          <FileUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleRemovePdf(item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="পিডিএফ মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-2.5 px-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>কোনো পিডিএফ ফাইল সংযুক্ত নেই</span>
                      </div>
                      <button
                        onClick={() => {
                          setQuickUploadItem(item);
                          fileInputRef.current?.click();
                        }}
                        className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>পিডিএফ আপলোড</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Syllabus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingSyllabus ? 'সিলেবাস ও পাঠপরিকল্পনা সম্পাদনা' : 'নতুন সিলেবাস ও পাঠপরিকল্পনা তৈরি'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  পাঠ্যবই, শিক্ষক নির্ধারণ, অধ্যায় বিভাজন ও পিডিএফ ফাইল আপলোড করুন
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSyllabus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জামাত / শ্রেণি <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => handleFormClassChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    দায়িত্বশীল উস্তাদ / শিক্ষক <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.nameBangla}>
                        {t.nameBangla} ({t.designation || 'শিক্ষক'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিষয়ের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="যেমন: এসো আরবি শিখি"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মূল কিতাব / পাঠ্যবই
                  </label>
                  <input
                    type="text"
                    value={formKitabName}
                    onChange={(e) => setFormKitabName(e.target.value)}
                    placeholder="যেমন: الطريق إلى العربية"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পরীক্ষার টার্ম</label>
                  <select
                    value={formTerm}
                    onChange={(e) => {
                      setFormTerm(e.target.value);
                      if (e.target.value === 'first_term') setFormTermLabel('১ম সাময়িক পরীক্ষা ২০২৬');
                      else if (e.target.value === 'mid_term') setFormTermLabel('২য় সাময়িক / অর্ধ-বার্ষিক পরীক্ষা');
                      else if (e.target.value === 'final_term') setFormTermLabel('বার্ষিক / সমাপনী পরীক্ষা ২০২৬');
                      else setFormTermLabel('পূর্ণাঙ্গ বার্ষিক পাঠপরিকল্পনা ২০২৬');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="first_term">১ম সাময়িক পরীক্ষা</option>
                    <option value="mid_term">২য় সাময়িক / অর্ধ-বার্ষিক</option>
                    <option value="final_term">বার্ষিক / সমাপনী পরীক্ষা</option>
                    <option value="annual">পূর্ণাঙ্গ বার্ষিক পাঠপরিকল্পনা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">টার্মের শিরোনাম</label>
                  <input
                    type="text"
                    value={formTermLabel}
                    onChange={(e) => setFormTermLabel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোট নম্বর</label>
                  <input
                    type="number"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পাস নম্বর</label>
                  <input
                    type="number"
                    value={formPassMarks}
                    onChange={(e) => setFormPassMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মানবন্টন বিবরণ</label>
                  <input
                    type="text"
                    value={formMarksDistribution}
                    onChange={(e) => setFormMarksDistribution(e.target.value)}
                    placeholder="লিখিত ৮০ + মৌখিক ২০"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Direct PDF Upload inside Form */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  সরাসরি সিলেবাস পিডিএফ ফাইল আপলোড (PDF Upload)
                </label>
                {formAttachmentUrl ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold truncate">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="truncate">{formAttachmentName || 'পিডিএফ সিলেবাস সংযুক্ত'}</span>
                      {formAttachmentSize && (
                        <span className="text-[10px] text-emerald-700">({formAttachmentSize})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormAttachmentUrl('');
                        setFormAttachmentName('');
                        setFormAttachmentSize('');
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      মুছুন
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                      <Upload className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="text-xs font-bold text-blue-900">
                        ডিভাইস থেকে পিডিএফ সিলেবাস ফাইল নির্বাচন করুন
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        .pdf, .doc, .docx বা ইমেজ ফাইল সাপোর্ট করে
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const { url, name, size } = await processPdfFile(file);
                            setFormAttachmentUrl(url);
                            setFormAttachmentName(name);
                            setFormAttachmentSize(size);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Topics / Chapters */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    পাঠ্য অধ্যায় ও বিষয়বস্তুর তালিকা
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTopicRow}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    অধ্যায় যোগ করুন
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formTopics.map((topic, idx) => (
                    <div
                      key={topic.id || idx}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-xs"
                    >
                      <span className="font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={topic.topicName}
                        onChange={(e) => handleTopicFieldChange(idx, 'topicName', e.target.value)}
                        placeholder="অধ্যায়ের নাম / বিষয়"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <input
                        type="text"
                        value={topic.pageRangeOrChapters || ''}
                        onChange={(e) =>
                          handleTopicFieldChange(idx, 'pageRangeOrChapters', e.target.value)
                        }
                        placeholder="পৃষ্ঠা / দিন"
                        className="w-28 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                      />
                      {formTopics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTopicRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  শিক্ষকের বিশেষ নির্দেশনা বা নোট
                </label>
                <textarea
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  rows={2}
                  placeholder="শ্রেণিকক্ষে পাঠদানের বিশেষ দিকনির্দেশনা..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs cursor-pointer"
                >
                  {editingSyllabus ? 'পরিবর্তন সংরক্ষণ করুন' : 'সিলেবাস প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive PDF Viewer Modal */}
      {viewingPdfItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {viewingPdfItem.attachmentName || `${viewingPdfItem.subjectName} - পিডিএফ সিলেবাস`}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {viewingPdfItem.className} • {viewingPdfItem.termLabel} • শিক্ষক:{' '}
                    {getTeacherDisplayName(viewingPdfItem)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={viewingPdfItem.attachmentUrl}
                  download={viewingPdfItem.attachmentName || `${viewingPdfItem.subjectName}_syllabus.pdf`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </a>
                <a
                  href={viewingPdfItem.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>নতুন ট্যাবে খুলুন</span>
                </a>
                <button
                  onClick={() => setViewingPdfItem(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / PDF Frame */}
            <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex flex-col items-center justify-center">
              {viewingPdfItem.attachmentUrl ? (
                <iframe
                  src={viewingPdfItem.attachmentUrl}
                  title="PDF Viewer"
                  className="w-full h-full rounded-2xl border border-slate-300 bg-white"
                />
              ) : (
                <div className="text-center p-8">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">পিডিএফ ফাইল পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Syllabus PDF Parser Modal */}
      <AutoSyllabusParserModal
        isOpen={isAiParserOpen}
        onClose={() => setIsAiParserOpen(false)}
        defaultClassId={selectedClassId !== 'all' ? selectedClassId : undefined}
        defaultTeacherName={currentTeacher?.nameBangla}
      />

      {/* Printable Sheet */}
      <div id="teacher-printable-syllabus-sheet" className="hidden">
        <div
          style={{
            padding: '25px',
            fontFamily: 'SolaimanLipi, Kalpurush, sans-serif',
            color: '#0f172a',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #0f766e',
              paddingBottom: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ fontSize: '15px', color: '#047857', fontWeight: 'bold' }}>
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0', color: '#0f172a' }}>
              {madrasaInfo.nameBangla}
            </h1>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              {madrasaInfo.address} • ফোন: {madrasaInfo.phone}
            </div>
            <div
              style={{
                display: 'inline-block',
                background: '#0f766e',
                color: '#ffffff',
                fontWeight: 'bold',
                padding: '4px 18px',
                borderRadius: '20px',
                fontSize: '14px',
                marginTop: '8px',
              }}
            >
              শিক্ষক পাঠ্যক্রম ও পাঠপরিকল্পনা ২০২৬
            </div>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th
                  style={{
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    width: '35px',
                    textAlign: 'center',
                  }}
                >
                  ক্র.
                </th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>জামাত ও বিষয়</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>মূল কিতাব</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>শিক্ষক</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>মেয়াদ</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>পাঠ্য অধ্যায় ও টপিক</th>
                <th
                  style={{
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    width: '110px',
                  }}
                >
                  মানবন্টন
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSyllabuses.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td
                    style={{
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.subjectName}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{item.className}</div>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                    {item.kitabName || item.subjectName}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                    {getTeacherDisplayName(item)}
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 'bold',
                      color: '#0f766e',
                    }}
                  >
                    {item.termLabel}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                    <ul style={{ margin: 0, paddingLeft: '14px' }}>
                      {item.topics.map((t) => (
                        <li key={t.id} style={{ marginBottom: '2px' }}>
                          {t.isCompleted ? '✅ ' : '⬜ '}
                          <strong>{t.topicName}</strong>{' '}
                          {t.pageRangeOrChapters && `(${t.pageRangeOrChapters})`}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                    <div>
                      মোট: {item.totalMarks || 100} (পাস: {item.passMarks || 40})
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>
                      {item.marksDistribution || ''}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
