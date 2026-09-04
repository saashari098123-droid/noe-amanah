import React, { useState, useMemo, useRef } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SyllabusItem, SyllabusTopic } from '../../types';
import { printHtmlElement } from '../../utils/printHelper';
import {
  BookOpen,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  BookMarked,
  FileText,
  ExternalLink,
  X,
  Copy,
  Check,
  Download,
  RotateCcw,
  Upload,
  Eye,
  UserCheck,
  FileUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AutoSyllabusParserModal } from '../common/AutoSyllabusParserModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const AdminSyllabus: React.FC = () => {
  const {
    syllabuses,
    classes,
    teachers,
    madrasaInfo,
    addSyllabus,
    updateSyllabus,
    deleteSyllabus,
    toggleSyllabusTopicCompleted,
    resetSyllabusesToDefault,
  } = useMadrasa();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAiParserOpen, setIsAiParserOpen] = useState<boolean>(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // PDF Viewer Modal State
  const [viewingPdfItem, setViewingPdfItem] = useState<SyllabusItem | null>(null);

  // Quick PDF Upload State for single card
  const [quickUploadItem, setQuickUploadItem] = useState<SyllabusItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [formFileBase64, setFormFileBase64] = useState<string>('');
  const [formFileMimeType, setFormFileMimeType] = useState<string>('application/pdf');
  const [formAiCustomCommand, setFormAiCustomCommand] = useState<string>('');
  const [isAiParsingModal, setIsAiParsingModal] = useState<boolean>(false);
  const [formTopics, setFormTopics] = useState<SyllabusTopic[]>([
    {
      id: `top-${Date.now()}-1`,
      topicName: '১ম অধ্যায়: মৌলিক পাঠ ও বিষয়বস্তু',
      pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ৩০',
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

    return teachers[0]?.nameBangla || 'দায়িত্বশীল উস্তাদ';
  };

  // Process PDF File into Base64 Data URL
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

  // Direct Card-Level PDF Upload
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
      alert(`‘${name}’ সফলভাবে সিলেবাসে পিডিএফ হিসেবে যুক্ত ও ক্লাউডে সিঙ্ক করা হয়েছে!`);
      setQuickUploadItem(null);
    } catch (err) {
      alert('ফাইল আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // Remove PDF
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

  // Handle Opening Modal for Add or Edit
  const handleOpenAddModal = () => {
    setEditingSyllabus(null);
    const defaultClass = classes[0];
    setFormClassId(defaultClass ? defaultClass.id : '');
    const firstKitab = defaultClass?.kitabs?.[0];
    setFormSubjectName(firstKitab?.name || '');
    setFormKitabName(firstKitab?.name || '');
    setFormTeacherName(teachers[0]?.nameBangla || '');
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
        topicName: '১ম অধ্যায়: সূচনা ও প্রাথমিক পাঠ',
        pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ২৫',
        targetDate: '২০২৬-০৩-৩০',
        isCompleted: false,
        note: '',
      },
    ]);
    setIsModalOpen(true);
  };

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

  // On Form Class Change, autofill subjects
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

  // Add / Remove Form Topic rows
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
        topicName: 'সম্পূর্ণ পাঠ্যসূচি',
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
        createdBy: formTeacherName.trim() || 'মুহতামিম দফতর',
      });
    }

    setIsModalOpen(false);
  };

  // Filtered Syllabuses
  const filteredSyllabuses = useMemo(() => {
    return syllabuses.filter((item) => {
      if (selectedClassId !== 'all' && item.classId !== selectedClassId) {
        return false;
      }
      if (selectedTerm !== 'all' && item.term !== selectedTerm) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchSubject = item.subjectName.toLowerCase().includes(query);
        const matchKitab = (item.kitabName || '').toLowerCase().includes(query);
        const matchClass = item.className.toLowerCase().includes(query);
        const matchTerm = item.termLabel.toLowerCase().includes(query);
        const matchTeacher = getTeacherDisplayName(item).toLowerCase().includes(query);
        const matchTopics = item.topics.some(
          (t) =>
            t.topicName.toLowerCase().includes(query) ||
            (t.pageRangeOrChapters || '').toLowerCase().includes(query)
        );
        if (
          !matchSubject &&
          !matchKitab &&
          !matchClass &&
          !matchTerm &&
          !matchTopics &&
          !matchTeacher
        ) {
          return false;
        }
      }
      return true;
    });
  }, [syllabuses, selectedClassId, selectedTerm, searchQuery, teachers]);

  // Statistics calculation
  const totalTopicsCount = useMemo(() => {
    return filteredSyllabuses.reduce((acc, curr) => acc + (curr.topics?.length || 0), 0);
  }, [filteredSyllabuses]);

  const completedTopicsCount = useMemo(() => {
    return filteredSyllabuses.reduce(
      (acc, curr) => acc + (curr.topics?.filter((t) => t.isCompleted)?.length || 0),
      0
    );
  }, [filteredSyllabuses]);

  const activeClassesInSyllabus = useMemo(() => {
    return new Set(filteredSyllabuses.map((s) => s.classId)).size;
  }, [filteredSyllabuses]);

  // Print Complete Filtered Syllabus Sheet
  const handlePrintFullSyllabus = () => {
    printHtmlElement('admin-printable-syllabus-sheet', {
      title: `${madrasaInfo.nameBangla} - সিলেবাস ও পাঠপরিকল্পনা`,
    });
  };

  // Copy syllabus text summary
  const handleCopySummary = (item: SyllabusItem) => {
    const text = `📋 ${item.className} - ${item.termLabel}\n📚 বিষয়: ${item.subjectName} (${item.kitabName || ''})\n👤 শিক্ষক: ${getTeacherDisplayName(item)}\n🎯 মোট নম্বর: ${item.totalMarks || 100} (পাস: ${item.passMarks || 40})\n📊 মানবন্টন: ${item.marksDistribution || 'লিখিত ৮০ + মৌখিক ২০'}\n\n📖 পাঠ্যসূচি:\n${item.topics.map((t, idx) => `${idx + 1}. ${t.topicName} [${t.pageRangeOrChapters || 'সকল অধ্যায়'}] ${t.isCompleted ? ' (সম্পন্ন ✅)' : ''}`).join('\n')}\n\n${item.overview ? `💡 নির্দেশনা: ${item.overview}` : ''}`;
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

      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-900 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-blue-700" />
                অভ্যন্তরীণ পাঠ্যসূচি, শিক্ষক নির্ধারণ ও পিডিএফ ফাইল
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full">
                {syllabuses.length}টি বিষয় তালিকাভুক্ত
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2">
              জামাতভিত্তিক সিলেবাস ও পাঠপরিকল্পনা
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              সকল জামাতের বিষয়ভিত্তিক কিতাব, শিক্ষক নির্ধারণ, পিডিএফ আপলোড, পরীক্ষার মানবন্টন ও পাঠের অগ্রগতি
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'আপনি কি ‘এসো আরবী শিখি’ (৩টি খণ্ড পূর্ণাঙ্গ ২৩৬ দিনের পাঠপরিকল্পনা) সহ সকল আদর্শ সিলেবাস ডাটাবেজে রিস্টোর ও সিঙ্ক করতে চান?'
                  )
                ) {
                  resetSyllabusesToDefault();
                  alert(
                    '‘এসো আরবী শিখি’ (১ম, ২য় ও ৩য় খণ্ড) সহ সকল জামাতের পূর্ণাঙ্গ সিলেবাস সফলভাবে ডাটাবেজে লোড ও ক্লাউডে সিঙ্ক করা হয়েছে!'
                  );
                }
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="এসো আরবি শিখি ৩টি খণ্ডের ২৩৬ দিনের পূর্ণাঙ্গ পাঠপরিকল্পনা ও হাদিস-কুরআন পাঠ্যসূচি রিস্টোর করুন"
            >
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              <span>এসো আরবী শিখি সিলেবাস রিস্টোর</span>
            </button>

            <button
              onClick={() => setIsAiParserOpen(true)}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer border border-amber-300/60"
              title="পিডিএফ বা ছবি দিলে এআই স্বয়ংক্রিয়ভাবে বিষয়, অধ্যায় ও পৃষ্ঠা টেবিলে সাজিয়ে দিবে"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>এআই দিয়ে পিডিএফ সিলেবাস পার্স করুন</span>
            </button>

            <button
              onClick={handlePrintFullSyllabus}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>সিলেবাস শিট প্রিন্ট করুন</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>নতুন সিলেবাস যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3.5 text-center">
            <div className="text-xs text-blue-700 font-medium">সিলেবাস বিষয়সমূহ</div>
            <div className="text-xl font-extrabold text-blue-900 mt-0.5">
              {filteredSyllabuses.length} <span className="text-xs font-normal">টি</span>
            </div>
          </div>
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 text-center">
            <div className="text-xs text-indigo-700 font-medium">মোট অধ্যায় ও টপিক</div>
            <div className="text-xl font-extrabold text-indigo-900 mt-0.5">
              {totalTopicsCount} <span className="text-xs font-normal">টি</span>
            </div>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3.5 text-center">
            <div className="text-xs text-emerald-700 font-medium">সম্পন্ন পাঠ্যসূচি</div>
            <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
              {completedTopicsCount} <span className="text-xs font-normal">টি</span>
              {totalTopicsCount > 0 && (
                <span className="text-[11px] text-emerald-600 ml-1 font-semibold">
                  ({Math.round((completedTopicsCount / totalTopicsCount) * 100)}%)
                </span>
              )}
            </div>
          </div>
          <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3.5 text-center">
            <div className="text-xs text-amber-800 font-medium">অন্তর্ভুক্ত জামাত</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">
              {activeClassesInSyllabus} <span className="text-xs font-normal">টি</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              জামাত / শ্রেণি নির্বাচন
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সকল জামাত ও শ্রেণি ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Term Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পরীক্ষা / মেয়াদের ধরন
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সকল পরীক্ষা ও পাঠপরিকল্পনা</option>
              <option value="first_term">১ম সাময়িক পরীক্ষা</option>
              <option value="mid_term">অর্ধ-বার্ষিক / ২য় সাময়িক পরীক্ষা</option>
              <option value="final_term">বার্ষিক / সমাপনী পরীক্ষা</option>
              <option value="annual">পূর্ণাঙ্গ বার্ষিক পাঠপরিকল্পনা</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">অনুসন্ধান করুন</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিষয়, শিক্ষক, কিতাব বা অধ্যায় খুঁজুন..."
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

      {/* Syllabus Cards List */}
      {filteredSyllabuses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">কোন সিলেবাস পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            আপনার নির্বাচিত ফিল্টারে কোনো তথ্য নেই অথবা নতুন সিলেবাস যোগ করা হয়নি। উপরে "নতুন
            সিলেবাস যুক্ত করুন" বাটনে ক্লিক করে যোগ করতে পারেন।
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            নতুন সিলেবাস যুক্ত করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSyllabuses.map((item) => {
            const completedCount = item.topics.filter((t) => t.isCompleted).length;
            const totalCount = item.topics.length;
            const progressPercent =
              totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
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
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="bg-blue-800 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                          {item.className}
                        </span>
                        <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                          {item.termLabel}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        {item.subjectName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                        {item.kitabName && item.kitabName !== item.subjectName && (
                          <span>
                            মূল কিতাব: <strong className="text-blue-900">{item.kitabName}</strong>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200/60">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          {teacherName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopySummary(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="সিলেবাস কপি করুন"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: item.id, name: item.subjectName })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Marks & Distribution Pill */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">মোট নম্বর / পাস নম্বর:</span>
                      <span className="font-bold text-slate-800">
                        {item.totalMarks || 100} নম্বর (পাস: {item.passMarks || 40})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">মানবন্টন বিবরণ:</span>
                      <span className="font-semibold text-blue-900 truncate block">
                        {item.marksDistribution || 'লিখিত ৮০ + মৌখিক ২০'}
                      </span>
                    </div>
                  </div>

                  {/* Overview note if available */}
                  {item.overview && (
                    <p className="text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50 mb-3 leading-relaxed">
                      <span className="font-bold text-amber-900">নির্দেশনা:</span> {item.overview}
                    </p>
                  )}

                  {/* Topics / Chapters List */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>পাঠ্য অধ্যায় ও বিষয়বস্তু ({item.topics.length}টি)</span>
                      <span className="text-[11px] text-blue-700 font-semibold">
                        অগ্রগতি: {progressPercent}%
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {item.topics.map((topic) => (
                        <div
                          key={topic.id}
                          onClick={() => toggleSyllabusTopicCompleted(item.id, topic.id)}
                          className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-2.5 border transition cursor-pointer ${
                            topic.isCompleted
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              className="mt-0.5 shrink-0"
                              title={
                                topic.isCompleted ? 'সম্পন্ন হিসেবে চিহ্নিত' : 'চলমান/অসম্পূর্ণ'
                              }
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
                                  topic.isCompleted
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-800'
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold">
                  <BookMarked className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingSyllabus ? 'সিলেবাস সম্পাদনা করুন' : 'নতুন জামাতভিত্তিক সিলেবাস যোগ করুন'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    বিষয়, শিক্ষক নির্ধারণ, পরীক্ষা, মানবন্টন এবং সরাসরি পিডিএফ ফাইল আপলোড করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveSyllabus} className="p-6 overflow-y-auto space-y-4">
              {/* Class & Subject Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    জামাত / শ্রেণি নির্বাচন *
                  </label>
                  <select
                    required
                    value={formClassId}
                    onChange={(e) => handleFormClassChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      জামাত নির্বাচন করুন...
                    </option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    দায়িত্বশীল উস্তাদ / শিক্ষক *
                  </label>
                  <select
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.nameBangla}>
                        {t.nameBangla} ({t.designation || 'শিক্ষক'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    বিষয়ের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="যেমন: এসো আরবি শিখি, নূরানী কায়দা"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Kitab & Exam Term Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    মূল কিতাব / পাঠ্যবই
                  </label>
                  <input
                    type="text"
                    value={formKitabName}
                    onChange={(e) => setFormKitabName(e.target.value)}
                    placeholder="মূল কিতাব বা লেখকের নাম"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    পরীক্ষার মেয়াদ / ক্যাটাগরি
                  </label>
                  <select
                    value={formTerm}
                    onChange={(e) => {
                      setFormTerm(e.target.value);
                      if (e.target.value === 'first_term')
                        setFormTermLabel('১ম সাময়িক পরীক্ষা ২০২৬');
                      else if (e.target.value === 'mid_term')
                        setFormTermLabel('অর্ধ-বার্ষিক / ২য় সাময়িক পরীক্ষা ২০২৬');
                      else if (e.target.value === 'final_term')
                        setFormTermLabel('বার্ষিক / সমাপনী পরীক্ষা ২০২৬');
                      else setFormTermLabel('পূর্ণাঙ্গ বার্ষিক পাঠপরিকল্পনা ২০২৬');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="first_term">১ম সাময়িক পরীক্ষা</option>
                    <option value="mid_term">অর্ধ-বার্ষিক / ২য় সাময়িক</option>
                    <option value="final_term">বার্ষিক / সমাপনী পরীক্ষা</option>
                    <option value="annual">পূর্ণাঙ্গ বার্ষিক পাঠপরিকল্পনা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    পরীক্ষার শিরোনাম (লেবেল)
                  </label>
                  <input
                    type="text"
                    value={formTermLabel}
                    onChange={(e) => setFormTermLabel(e.target.value)}
                    placeholder="যেমন: ১ম সাময়িক পরীক্ষা ২০২৬"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Marks & Distribution Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">মোট নম্বর</label>
                  <input
                    type="number"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">পাস নম্বর</label>
                  <input
                    type="number"
                    value={formPassMarks}
                    onChange={(e) => setFormPassMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    মানবন্টন (Marks Distribution)
                  </label>
                  <input
                    type="text"
                    value={formMarksDistribution}
                    onChange={(e) => setFormMarksDistribution(e.target.value)}
                    placeholder="যেমন: লিখিত ৭০ + মৌখিক ৩০"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Direct PDF Upload inside Modal */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    সরাসরি সিলেবাস পিডিএফ ফাইল আপলোড (PDF Upload)
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    ✨ এআই পার্সিং উপলব্ধ
                  </span>
                </div>
                {formAttachmentUrl ? (
                  <div className="space-y-2.5">
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
                          setFormFileBase64('');
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        মুছুন
                      </button>
                    </div>

                    {/* AI Parse PDF Button & Custom Command */}
                    <div className="space-y-2 mt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          এআই পার্সিংয়ের জন্য কাস্টম নির্দেশনা / কমান্ড (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={formAiCustomCommand}
                          onChange={(e) => setFormAiCustomCommand(e.target.value)}
                          placeholder="যেমন: এই সিলেবাসটি ১০টি অধ্যায়ে ভাগ করুন বা নাহব কায়দা অনুযায়ী সাজান..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isAiParsingModal}
                        onClick={async () => {
                          setIsAiParsingModal(true);
                          try {
                            const targetClassObj = classes.find((c) => c.id === formClassId);
                            const res = await fetch('/api/parse-syllabus', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                fileBase64: formFileBase64 || formAttachmentUrl,
                                mimeType: formFileMimeType,
                                classHint: targetClassObj?.name,
                                subjectHint: formSubjectName || undefined,
                                termHint: formTermLabel,
                                parseDepth: 'এডভান্সড পূর্ণাঙ্গ বিশ্লেষণ',
                                customCommand: formAiCustomCommand.trim() || undefined,
                              }),
                            });
                            const json = await res.json();
                            if (json.success && json.data) {
                              const d = json.data;
                              if (d.subjectName && (!formSubjectName || formSubjectName.trim() === '')) {
                                setFormSubjectName(d.subjectName);
                              }
                              if (d.kitabName && (!formKitabName || formKitabName.trim() === '')) {
                                setFormKitabName(d.kitabName);
                              }
                              if (d.totalMarks) setFormTotalMarks(d.totalMarks);
                              if (d.passMarks) setFormPassMarks(d.passMarks);
                              if (d.marksDistribution) setFormMarksDistribution(d.marksDistribution);
                              if (d.overview && (!formOverview || formOverview.trim() === '')) {
                                setFormOverview(d.overview);
                              }
                              if (d.topics && d.topics.length > 0) {
                                setFormTopics(
                                  d.topics.map((t: any, idx: number) => ({
                                    id: `top-ai-mod-${Date.now()}-${idx + 1}`,
                                    topicName: t.topicName || `অধ্যায় ${idx + 1}`,
                                    pageRangeOrChapters: t.pageRangeOrChapters || '',
                                    note: t.note || '',
                                    targetDate: '',
                                    isCompleted: false,
                                  }))
                                );
                              }
                              showToast('✨ এআই সফলভাবে পিডিএফ পার্স করে টপিক ও সিলেবাস সাজিয়ে দিয়েছে!');
                            } else {
                              throw new Error(json.error || 'পার্সিং ব্যর্থ হয়েছে');
                            }
                          } catch (err: any) {
                            showToast('এআই পার্সিংয়ে সমস্যা: ' + (err.message || 'নেটওয়ার্ক ত্রুটি'));
                          } finally {
                            setIsAiParsingModal(false);
                          }
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        {isAiParsingModal ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>এআই পিডিএফ বিশ্লেষণ করছে... (দয়া করে অপেক্ষা করুন)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>✨ এই পিডিএফ থেকে এআই দিয়ে স্বয়ংক্রিয় টপিক ও সিলেবাস পার্স করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                      <Upload className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="text-xs font-bold text-blue-900">
                        ডিভাইস থেকে পিডিএফ সিলেবাস ফাইল আপলোড করুন
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        .pdf, .doc, .docx বা ইমেজ ফাইল নির্বাচন করুন (আপলোডের পর এআই পার্স করার অপশন আসবে)
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
                            setFormFileBase64(url);
                            setFormFileMimeType(file.type || 'application/pdf');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Overview / Guidelines */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  শিক্ষকের নির্দেশনা ও সিলেবাসের সংক্ষিপ্ত বিবরণ
                </label>
                <textarea
                  rows={2}
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  placeholder="পরীক্ষার প্রস্তুতি, বিশেষ অধ্যায় বা মানবন্টন নির্দেশিকা লিখুন..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dynamic Topics / Chapters List */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      অধ্যায় ও বিষয়বস্তু তালিকা ({formTopics.length}টি)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      প্রতিটি অধ্যায়, পৃষ্ঠা নম্বর বা হাদিস নম্বর যুক্ত করুন
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTopicRow}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    টপিক যোগ করুন
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {formTopics.map((topic, idx) => (
                    <div
                      key={topic.id || idx}
                      className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2 items-center"
                    >
                      <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                        <input
                          type="text"
                          required
                          value={topic.topicName}
                          onChange={(e) =>
                            handleTopicFieldChange(idx, 'topicName', e.target.value)
                          }
                          placeholder="অধ্যায় / পাঠের নাম (e.g. ১ম অধ্যায়)"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                        <input
                          type="text"
                          value={topic.pageRangeOrChapters || ''}
                          onChange={(e) =>
                            handleTopicFieldChange(idx, 'pageRangeOrChapters', e.target.value)
                          }
                          placeholder="পৃষ্ঠা বা অধ্যায় (e.g. পৃষ্ঠা ১-৪০)"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                        <input
                          type="text"
                          value={topic.note || ''}
                          onChange={(e) => handleTopicFieldChange(idx, 'note', e.target.value)}
                          placeholder="নোট বা সমাপ্তির তারিখ"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopicRow(idx)}
                        disabled={formTopics.length <= 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30 cursor-pointer"
                        title="এই সারি মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  {editingSyllabus ? 'সংরক্ষণ করুন' : 'সিলেবাস প্রকাশ করুন'}
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
                  download={
                    viewingPdfItem.attachmentName || `${viewingPdfItem.subjectName}_syllabus.pdf`
                  }
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
      />

      {/* HIDDEN PRINTABLE CONTAINER FOR A4 PRINTING */}
      <div id="admin-printable-syllabus-sheet" className="hidden">
        <div
          style={{
            padding: '25px',
            fontFamily: 'SolaimanLipi, Kalpurush, sans-serif',
            color: '#0f172a',
          }}
        >
          {/* Header */}
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
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '4px 0',
                color: '#0f172a',
              }}
            >
              {madrasaInfo.nameBangla}
            </h1>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              {madrasaInfo.address} • ফোন: {madrasaInfo.phone} • কোড:{' '}
              {madrasaInfo.codeNumber || 'AIS-786'}
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
              অফিসিয়াল পাঠ্যসূচি ও সিলেবাস বিবরণী ২০২৬
            </div>
          </div>

          {/* Filter details */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#334155',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <strong>জামাত:</strong>{' '}
              {selectedClassId === 'all'
                ? 'সকল জামাত ও শাখা'
                : classes.find((c) => c.id === selectedClassId)?.name}
            </div>
            <div>
              <strong>পরীক্ষা/মেয়াদ:</strong>{' '}
              {selectedTerm === 'all' ? 'পূর্ণাঙ্গ পাঠ্যসূচি' : selectedTerm}
            </div>
            <div>
              <strong>প্রিন্ট তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}
            </div>
          </div>

          {/* Table of Syllabuses */}
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
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>পরীক্ষা / মেয়াদ</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                  নির্ধারিত অধ্যায় ও পৃষ্ঠা
                </th>
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
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.subjectName}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{item.className}</div>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: '#334155' }}>
                    {item.kitabName || item.subjectName}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                    {getTeacherDisplayName(item)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f766e' }}>{item.termLabel}</span>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                    <ul style={{ margin: 0, paddingLeft: '14px' }}>
                      {item.topics.map((t) => (
                        <li key={t.id} style={{ marginBottom: '2px' }}>
                          <strong>{t.topicName}</strong>{' '}
                          {t.pageRangeOrChapters && `(${t.pageRangeOrChapters})`}
                        </li>
                      ))}
                    </ul>
                    {item.overview && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#64748b',
                          marginTop: '4px',
                          fontStyle: 'italic',
                        }}
                      >
                        নির্দেশনা: {item.overview}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}>
                    <div>
                      মোট: {item.totalMarks || 100} (পাস: {item.passMarks || 40})
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>
                      {item.marksDistribution || 'লিখিত ৮০ + মৌখিক ২০'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '45px',
              paddingTop: '15px',
            }}
          >
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div
                style={{
                  borderTop: '1px dashed #64748b',
                  paddingTop: '4px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                নাজেমে তালিমাত
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>শিক্ষা বিভাগ</div>
            </div>
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div
                style={{
                  borderTop: '1px dashed #64748b',
                  paddingTop: '4px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                মুহতামিম / অধ্যক্ষ
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{madrasaInfo.nameBangla}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="সিলেবাস মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteTarget?.name}
        description="আপনি কি নিশ্চিতভাবে এই সিলেবাস ও এর পাঠ্যতালিকা মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={() => {
          if (deleteTarget) {
            deleteSyllabus(deleteTarget.id);
            showToast(`"${deleteTarget.name}" সিলেবাসটি সফলভাবে মুছে ফেলা হয়েছে!`);
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
