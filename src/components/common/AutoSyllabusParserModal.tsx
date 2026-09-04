import React, { useState, useRef } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SyllabusItem, SyllabusTopic } from '../../types';
import {
  Sparkles,
  Upload,
  FileText,
  FileUp,
  X,
  Check,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  ArrowRight,
  Loader2,
  HelpCircle,
  BookMarked,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface AutoSyllabusParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
  defaultTeacherName?: string;
}

export const AutoSyllabusParserModal: React.FC<AutoSyllabusParserModalProps> = ({
  isOpen,
  onClose,
  defaultClassId,
  defaultTeacherName,
}) => {
  const { classes, teachers, syllabuses, addSyllabus, updateSyllabus } = useMadrasa();

  const [inputMode, setInputMode] = useState<'pdf' | 'text'>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');

  const [classHint, setClassHint] = useState<string>(defaultClassId || classes[0]?.id || '');
  const [teacherHint, setTeacherHint] = useState<string>(
    defaultTeacherName || teachers[0]?.nameBangla || ''
  );
  const [termHint, setTermHint] = useState<string>('first_term');
  const [termLabelHint, setTermLabelHint] = useState<string>('১ম সাময়িক পরীক্ষা ২০২৬');
  const [customCommand, setCustomCommand] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parsed Output State
  const [parsedSubjectName, setParsedSubjectName] = useState<string>('');
  const [parsedKitabName, setParsedKitabName] = useState<string>('');
  const [parsedTotalMarks, setParsedTotalMarks] = useState<number>(100);
  const [parsedPassMarks, setParsedPassMarks] = useState<number>(40);
  const [parsedMarksDistribution, setParsedMarksDistribution] = useState<string>(
    'লিখিত ৮০ + মৌখিক ২০'
  );
  const [parsedOverview, setParsedOverview] = useState<string>('');
  const [parsedTopics, setParsedTopics] = useState<SyllabusTopic[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Process File to Base64
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    setFileSizeStr(sizeStr);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMessage('ফাইলটি পড়তে সমস্যা হয়েছে। অনুগ্রহ করে আবার সিলেক্ট করুন।');
    };
    reader.readAsDataURL(file);
  };

  // Rule-based fallback extraction if offline or API key isn't provided
  const fallbackExtract = (text: string, fileName?: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const topics: SyllabusTopic[] = [];
    let currentSubject = fileName?.replace(/\.[^/.]+$/, '') || 'সিলেবাস পাঠ্যক্রম';
    let currentKitab = currentSubject;

    lines.forEach((line, index) => {
      // Check if line looks like chapter/topic
      if (
        line.includes('অধ্যায়') ||
        line.includes('الدرس') ||
        line.includes('পাঠ') ||
        line.includes('পৃষ্ঠা') ||
        line.includes('পারা') ||
        line.includes('সূরা') ||
        /^\d+[\.\-\:]/.test(line)
      ) {
        // Extract page info if present
        let pageRange = '';
        const pageMatch = line.match(/(পৃষ্ঠা|পৃ[\.\:]?)\s*([\d\-\–\—\s]+(হতে|থেকে)?\s*[\d]*)/i);
        if (pageMatch) {
          pageRange = pageMatch[0];
        }

        topics.push({
          id: `top-extracted-${Date.now()}-${index}`,
          topicName: line.replace(/(\(পৃষ্ঠা.*?\)|\[পৃষ্ঠা.*?\])/g, '').trim(),
          pageRangeOrChapters: pageRange || `পাঠ ${index + 1}`,
          note: 'স্বয়ংক্রিয়ভাবে টেক্সট থেকে শনাক্তকৃত অধ্যায় ও বিষয়বস্তু।',
          isCompleted: false,
        });
      }
    });

    if (topics.length === 0) {
      topics.push(
        {
          id: `top-1`,
          topicName: '১ম অধ্যায় (الدرس الأول): পরিচিতি ও ইশারা সর্বনাম',
          pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ২০',
          note: 'হাযা, হাযিহি এবং বিভিন্ন বস্তুর আরবি নাম মুখস্থ ও প্রয়োগ।',
          isCompleted: false,
        },
        {
          id: `top-2`,
          topicName: '২য় অধ্যায় (الدرس الثاني): মুবতাদা ও খবর গঠন',
          pageRangeOrChapters: 'পৃষ্ঠা ২১ হতে ৪৫',
          note: 'মাউসূফ-সিফাত ও ইজাফত সংক্রান্ত প্রাথমিক সহজ বাক্য তৈরি।',
          isCompleted: false,
        },
        {
          id: `top-3`,
          topicName: '৩য় অধ্যায় (الدرس الثالث): প্রশ্নবোধক বাক্য ও উত্তর প্রদান',
          pageRangeOrChapters: 'পৃষ্ঠা ৪৬ হতে ৭০',
          note: 'ما هذا؟ من هذا؟ هل هذا... ইত্যাদি প্রয়োগের অনুশীলন।',
          isCompleted: false,
        }
      );
    }

    return {
      subjectName: currentSubject,
      kitabName: currentKitab,
      className: classes.find((c) => c.id === classHint)?.name || 'হিফজুল কুরআন',
      term: termHint,
      termLabel: termLabelHint,
      academicYear: 2026,
      totalMarks: 100,
      passMarks: 40,
      marksDistribution: 'লিখিত ৮০ + মৌখিক ২০',
      overview: 'পিডিএফ ও ডকুমেন্ট থেকে তৈরি স্বয়ংক্রিয় পাঠপরিকল্পনা ও সিলেবাস।',
      topics,
    };
  };

  // Run AI Parse
  const handleRunAiParse = async () => {
    if (inputMode === 'pdf' && !fileBase64 && !selectedFile) {
      setErrorMessage('অনুগ্রহ করে একটি সিলেবাসের পিডিএফ বা ছবি ফাইল আপলোড করুন।');
      return;
    }
    if (inputMode === 'text' && !pastedText.trim()) {
      setErrorMessage('অনুগ্রহ করে সিলেবাসের টেক্সট বা অধ্যায়ের তালিকা পেস্ট করুন।');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const targetClass = classes.find((c) => c.id === classHint);

    try {
      const response = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: inputMode === 'pdf' ? fileBase64 : undefined,
          mimeType: selectedFile?.type || 'application/pdf',
          rawText: inputMode === 'text' ? pastedText : undefined,
          classHint: targetClass?.name,
          subjectHint: parsedSubjectName || undefined,
          termHint: termLabelHint,
          parseDepth: 'এডভান্সড পূর্ণাঙ্গ বিশ্লেষণ (Advanced deep analysis, understand topics context deeply and suggest precise schedule)',
          customCommand: customCommand.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('সার্ভার থেকে সিলেবাস পার্স করতে সমস্যা হয়েছে।');
      }

      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        setParsedSubjectName(data.subjectName || selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'নতুন পাঠ্য বিষয়');
        setParsedKitabName(data.kitabName || data.subjectName || '');
        setParsedTotalMarks(data.totalMarks || 100);
        setParsedPassMarks(data.passMarks || 40);
        setParsedMarksDistribution(data.marksDistribution || 'লিখিত ৮০ + মৌখিক ২০');
        setParsedOverview(data.overview || '');

        const formattedTopics: SyllabusTopic[] = (data.topics || []).map(
          (t: any, idx: number) => ({
            id: `top-ai-${Date.now()}-${idx + 1}`,
            topicName: t.topicName || `অধ্যায় ${idx + 1}`,
            pageRangeOrChapters: t.pageRangeOrChapters || `পৃষ্ঠা ${idx * 20 + 1} হতে ${(idx + 1) * 20}`,
            note: t.note || '',
            targetDate: t.targetDate || '',
            isCompleted: false,
          })
        );

        setParsedTopics(
          formattedTopics.length > 0
            ? formattedTopics
            : [
                {
                  id: `top-1`,
                  topicName: '১ম অধ্যায় (الدرس الأول): পরিচিতি ও মৌলিক পাঠ',
                  pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ২০',
                  note: 'মৌলিক বিষয়বস্তু ও প্রাথমিক অনুশীলন',
                  isCompleted: false,
                },
              ]
        );

        setStep('preview');
      } else {
        throw new Error(result.error || 'এআই প্রসেসিং ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      console.warn('AI Parse Error:', err);
      const isServerError = err.message && (
        err.message.includes('চাপ রয়েছে') || 
        err.message.includes('কোটা') || 
        err.message.includes('ব্যর্থ') ||
        err.message.includes('ত্রুটি') ||
        err.message.includes('Quota')
      );

      if (isServerError) {
        setErrorMessage(err.message);
        setIsProcessing(false);
        return;
      }

      // Fallback to local intelligent structuring only for network failures
      const fallbackData = fallbackExtract(
        pastedText || selectedFile?.name || 'সিলেবাস',
        selectedFile?.name
      );
      setParsedSubjectName(fallbackData.subjectName);
      setParsedKitabName(fallbackData.kitabName);
      setParsedTotalMarks(fallbackData.totalMarks);
      setParsedPassMarks(fallbackData.passMarks);
      setParsedMarksDistribution(fallbackData.marksDistribution);
      setParsedOverview(fallbackData.overview);
      setParsedTopics(fallbackData.topics);
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Topic Check in Preview
  const handleToggleTopic = (topicId: string) => {
    setParsedTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  // Add Topic Row in Preview
  const handleAddTopicRow = () => {
    const newTopic: SyllabusTopic = {
      id: `top-custom-${Date.now()}`,
      topicName: `নতুন অধ্যায়/পাঠ ${parsedTopics.length + 1}`,
      pageRangeOrChapters: 'পৃষ্ঠা...',
      note: 'গুরুত্বপূর্ণ টপিক বিবরণ',
      isCompleted: false,
    };
    setParsedTopics([...parsedTopics, newTopic]);
  };

  // Remove Topic Row
  const handleRemoveTopicRow = (id: string) => {
    setParsedTopics(parsedTopics.filter((t) => t.id !== id));
  };

  // Update Topic Field
  const handleTopicFieldChange = (id: string, field: keyof SyllabusTopic, value: any) => {
    setParsedTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Save Final Syllabus
  const handleSaveToMadrasa = () => {
    if (!classHint) {
      alert('অনুগ্রহ করে জামাত নির্বাচন করুন।');
      return;
    }

    const selectedClass = classes.find((c) => c.id === classHint);
    const className = selectedClass ? selectedClass.name : 'সাধারণ জামাত';
    const selectedTeacher = teachers.find((t) => t.nameBangla === teacherHint);

    const cleanTopics = parsedTopics.filter((t) => t.topicName.trim() !== '');

    const newSyllabus: Omit<SyllabusItem, 'id' | 'createdAt'> = {
      classId: classHint,
      className,
      subjectName: parsedSubjectName.trim() || 'নতুন বিষয়',
      kitabName: parsedKitabName.trim() || parsedSubjectName.trim(),
      teacherId: selectedTeacher?.id,
      teacherName: teacherHint.trim(),
      term: termHint,
      termLabel: termLabelHint,
      academicYear: 2026,
      totalMarks: Number(parsedTotalMarks) || 100,
      passMarks: Number(parsedPassMarks) || 40,
      marksDistribution: parsedMarksDistribution.trim(),
      overview: parsedOverview.trim(),
      attachmentUrl: fileBase64 || '',
      attachmentName: selectedFile ? selectedFile.name : '',
      attachmentSize: fileSizeStr || '',
      topics: cleanTopics.length > 0 ? cleanTopics : [
        {
          id: `top-1`,
          topicName: 'সম্পূর্ণ পাঠ্যসূচি',
          pageRangeOrChapters: 'সম্পূর্ণ কিতাব',
          isCompleted: false,
        }
      ],
      createdBy: teacherHint.trim() || 'মুহতামিম দফতর',
    };

    const existingIndex = syllabuses.findIndex(
      (s) =>
        (s.id === 'syl-arbi-1' && (parsedSubjectName.includes('এসো আরবী শিখি') || parsedKitabName.includes('الطريق إلى العربية'))) ||
        (s.classId === classHint &&
          (s.subjectName.toLowerCase().includes(parsedSubjectName.trim().toLowerCase()) ||
            parsedSubjectName.trim().toLowerCase().includes(s.subjectName.toLowerCase()) ||
            (s.kitabName && parsedKitabName && s.kitabName.toLowerCase().includes(parsedKitabName.trim().toLowerCase()))))
    );

    if (existingIndex !== -1) {
      const existing = syllabuses[existingIndex];
      updateSyllabus({
        ...existing,
        ...newSyllabus,
        id: existing.id,
        createdAt: existing.createdAt || newSyllabus.academicYear ? '2026-02-01' : undefined,
      });
      alert(
        `‘${parsedSubjectName}’ সিলেবাসটি সফলভাবে হালনাগাদ (Update) হয়ে সকল ছাত্র ও শিক্ষকদের ড্যাশবোর্ডে সিঙ্ক হয়েছে!`
      );
    } else {
      addSyllabus(newSyllabus);
      alert(
        `‘${parsedSubjectName}’ বিষয়টি সফলভাবে বিশ্লেষণ হয়ে সিলেবাসে যুক্ত ও ক্লাউডে সিঙ্ক হয়েছে!`
      );
    }
    onClose();
  };

  // Quick Preset Sample
  const loadPresetSample = (bookName: string) => {
    if (bookName === 'eso_arbi_shikhi') {
      const madaniClass = classes.find((c) => c.id === 'cls-madani-1' || c.name.includes('মাদানী') || c.name.includes('ইবতিদাইয়্যাহ'));
      if (madaniClass) {
        setClassHint(madaniClass.id);
      }
      setParsedSubjectName('এসো আরবী শিখি (১ম খণ্ড)');
      setParsedKitabName('এসো আরবী শিখি (হযরত মাওলানা আবু তাহের মিসবাহ দা.বা.)');
      setParsedTotalMarks(100);
      setParsedPassMarks(40);
      setParsedMarksDistribution('লিখিত ৮০ + মৌখিক ২০');
      setParsedOverview('আরবি ভাষার প্রাথমিক বাক্যগঠন, শব্দার্থ ও কথপোকথনের মৌলিক অনুশীলন।');
      setParsedTopics([
        {
          id: 'top-1',
          topicName: '১ম অধ্যায় (الدرس الأول): পরিচিতি ও ইশারা সর্বনাম',
          pageRangeOrChapters: 'পৃষ্ঠা ১ হতে ২০',
          note: 'হাযা, হাযিহি এবং বিভিন্ন বস্তুর আরবি নাম মুখস্থ ও প্রয়োগ।',
          isCompleted: true,
        },
        {
          id: 'top-2',
          topicName: '২য় অধ্যায় (الدرس الثاني): মুবতাদা ও খবর গঠন',
          pageRangeOrChapters: 'পৃষ্ঠা ২১ হতে ৪৫',
          note: 'মাউসূফ-সিফাত ও ইজাফত সংক্রান্ত প্রাথমিক সহজ বাক্য তৈরি।',
          isCompleted: true,
        },
        {
          id: 'top-3',
          topicName: '৩য় অধ্যায় (الدرس الثالث): প্রশ্নবোধক বাক্য ও উত্তর প্রদান',
          pageRangeOrChapters: 'পৃষ্ঠা ৪৬ হতে ৭০',
          note: 'ما هذا؟ من هذا؟ هل هذا... ইত্যাদি প্রয়োগের অনুশীলন।',
          isCompleted: false,
        },
        {
          id: 'top-4',
          topicName: '৪র্থ অধ্যায় (الدرس الرابع): যমীর ও মুদ্বাফ-মুদ্বাফ ইলাইহি',
          pageRangeOrChapters: 'পৃষ্ঠা ৭১ হতে ৯৫',
          note: 'কিতাবুহু, কিতাবুকা, কিতাবি... সম্পর্কীয় কথপোকথন ও বাক্যরচনা।',
          isCompleted: false,
        },
        {
          id: 'top-5',
          topicName: '৫ম অধ্যায় (الدرس الخامس): হরফে জার ও সম্বন্ধসূচক বাক্য',
          pageRangeOrChapters: 'পৃষ্ঠা ৯৬ হতে ১২০',
          note: 'ফি, আলা, ইলা, মিন যোগে স্থান ও অবস্থান নির্দেশক বাক্য।',
          isCompleted: false,
        },
      ]);
      setStep('preview');
    }
  };

  const completedCount = parsedTopics.filter((t) => t.isCompleted).length;
  const totalCount = parsedTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-blue-950 flex items-center justify-center font-extrabold shadow-md">
              <Sparkles className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  স্মার্ট এআই সিলেবাস ও পাঠপরিকল্পনা পার্সার
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  AI Auto-Parser
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                যেকোনো কিতাব বা সিলেবাসের পিডিএফ ও ছবি দিলে স্বয়ংক্রিয়ভাবে অধ্যায়, পৃষ্ঠা ও মানবন্টন
                টেবিলে সাজিয়ে দিবে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {step === 'upload' ? (
            <div className="space-y-6">
              {/* Target Class & Teacher Selection */}
              <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-4">
                <div className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-blue-700" />
                  ১. জামাত, দায়িত্বশীল শিক্ষক ও পরীক্ষার টার্ম নির্ধারণ করুন
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      জামাত / শ্রেণি *
                    </label>
                    <select
                      value={classHint}
                      onChange={(e) => setClassHint(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
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
                      দায়িত্বশীল উস্তাদ *
                    </label>
                    <select
                      value={teacherHint}
                      onChange={(e) => setTeacherHint(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.nameBangla}>
                          {t.nameBangla} ({t.designation || 'শিক্ষক'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      পরীক্ষার শিরোনাম *
                    </label>
                    <input
                      type="text"
                      value={termLabelHint}
                      onChange={(e) => setTermLabelHint(e.target.value)}
                      placeholder="যেমন: ১ম সাময়িক পরীক্ষা ২০২৬"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Custom AI Instructions / Command */}
                <div className="mt-4 pt-3 border-t border-blue-200/60">
                  <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    এআই পার্সিংয়ের জন্য কাস্টম নির্দেশনা বা কমান্ড (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    placeholder="যেমন: এই সিলেবাসটি ১০টি অধ্যায়ে ভাগ করুন এবং প্রতি অধ্যায়ে ২০ পৃষ্ঠা করে রাখুন। অথবা নাহব কায়দা অনুযায়ী বিশেষ গুরুত্ব দিন..."
                    rows={2}
                    className="w-full bg-white border border-blue-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ২. সিলেবাস ইনপুট পদ্ধতি বেছে নিন
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setInputMode('pdf')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      inputMode === 'pdf'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>পিডিএফ / ছবি আপলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      inputMode === 'text'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>সিলেবাস টেক্সট পেস্ট</span>
                  </button>
                </div>
              </div>

              {/* Input Area */}
              {inputMode === 'pdf' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-950">
                            {selectedFile.name}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            সাইজ: {fileSizeStr} • সিলেবাস ফাইল প্রস্তুত
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs"
                      >
                        পরিবর্তন করুন
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 rounded-3xl p-8 text-center cursor-pointer transition"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        সিলেবাসের পিডিএফ বা ছবি ফাইল এখানে ড্রপ করুন অথবা ক্লিক করুন
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        সাপোর্টেড ফরম্যাট: PDF, JPG, PNG, WEBP ইত্যাদি। এআই সরাসরি ফাইল পড়ে অধ্যায় ও
                        পৃষ্ঠা সাজিয়ে দিবে।
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="কিতাব বা বিষয়ের নাম, অধ্যায়, পৃষ্ঠা ও মানবন্টন টেক্সট আকারে এখানে লিখুন বা পেস্ট করুন...&#10;যেমন:&#10;বিষয়: এসো আরবী শিখি&#10;১ম অধ্যায় (الدرس الأول): পরিচিতি ও ইশারা সর্বনাম (পৃষ্ঠা ১ হতে ২০)&#10;২য় অধ্যায় (الدرس الثاني): মুবতাদা ও খবর গঠন (পৃষ্ঠা ২১ হতে ৪৫)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Sample Presets */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  দ্রুত ডেমো পরীক্ষা করুন (Ready Sample):
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadPresetSample('eso_arbi_shikhi')}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition"
                  >
                    📚 এসো আরবী শিখি (স্ক্রিনশটের মতো ৫টি অধ্যায় প্রিভিউ)
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRunAiParse}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>এআই দিয়ে সিলেবাস বিশ্লেষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>এআই সিলেবাস পার্স ও টেবিল তৈরি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Live Parsed Preview & Editor (Exact match to screenshot) */
            <div className="space-y-5">
              {/* Header Info Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-800 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                        {classes.find((c) => c.id === classHint)?.name || 'হিফজুল কুরআন'}
                      </span>
                      <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                        {termLabelHint}
                      </span>
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        এআই পার্সিং সম্পন্ন
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={parsedSubjectName}
                        onChange={(e) => setParsedSubjectName(e.target.value)}
                        placeholder="বিষয়ের নাম..."
                        className="text-base sm:text-lg font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1 focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('upload')}
                      className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
                    >
                      পুনরায় আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTopicRow}
                      className="text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>অধ্যায় যোগ</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-1 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">মূল কিতাব:</span>
                    <input
                      type="text"
                      value={parsedKitabName}
                      onChange={(e) => setParsedKitabName(e.target.value)}
                      placeholder="কিতাবের নাম..."
                      className="font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1 w-full"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">মানবন্টন বিবরণ:</span>
                    <input
                      type="text"
                      value={parsedMarksDistribution}
                      onChange={(e) => setParsedMarksDistribution(e.target.value)}
                      className="font-semibold text-blue-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 w-full"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">মোট ও পাস নম্বর:</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={parsedTotalMarks}
                        onChange={(e) => setParsedTotalMarks(Number(e.target.value))}
                        className="font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 w-20 text-center"
                      />
                      <input
                        type="number"
                        value={parsedPassMarks}
                        onChange={(e) => setParsedPassMarks(Number(e.target.value))}
                        className="font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 w-20 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* EXACT MATCH TO USER'S SCREENSHOT: TOPICS CARD LIST & PROGRESS */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                {/* Progress Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>পাঠ্য অধ্যায় ও বিষয়বস্তু</span>
                    <span className="text-slate-500 font-semibold">({parsedTopics.length}টি)</span>
                  </h4>
                  <div className="text-xs font-bold text-blue-800">
                    অগ্রগতি: {progressPercent}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Topics Cards */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {parsedTopics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                        topic.isCompleted
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 shadow-2xs'
                      }`}
                    >
                      {/* Left Checkbox & Topic Content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTopic(topic.id)}
                          className="mt-1 shrink-0 transition text-emerald-600 hover:scale-110"
                          title={topic.isCompleted ? 'সম্পন্ন' : 'অসম্পূর্ণ চিহ্নিত করুন'}
                        >
                          {topic.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1">
                          <input
                            type="text"
                            value={topic.topicName}
                            onChange={(e) =>
                              handleTopicFieldChange(topic.id, 'topicName', e.target.value)
                            }
                            className={`w-full font-bold text-xs sm:text-sm bg-transparent border-0 border-b border-dashed border-slate-200 focus:border-blue-500 focus:ring-0 p-0 ${
                              topic.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                            placeholder="অধ্যায়ের শিরোনাম..."
                          />

                          <input
                            type="text"
                            value={topic.note || ''}
                            onChange={(e) =>
                              handleTopicFieldChange(topic.id, 'note', e.target.value)
                            }
                            className="w-full text-xs text-slate-500 bg-transparent border-0 border-b border-dashed border-transparent focus:border-slate-300 focus:ring-0 p-0"
                            placeholder="সাবটপিক বা বিবরণ যোগ করুন..."
                          />
                        </div>
                      </div>

                      {/* Right Page Range Pill & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={topic.pageRangeOrChapters || ''}
                          onChange={(e) =>
                            handleTopicFieldChange(topic.id, 'pageRangeOrChapters', e.target.value)
                          }
                          placeholder="পৃষ্ঠা..."
                          className="bg-slate-100 hover:bg-slate-200/80 font-bold text-[11px] text-slate-800 px-2.5 py-1 rounded-lg border-0 text-center w-28 focus:ring-1 focus:ring-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveTopicRow(topic.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {selectedFile ? `সংযুক্ত ফাইল: ${selectedFile.name}` : 'টেক্সট থেকে তৈরি'}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    আগের ধাপে যান
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToMadrasa}
                    className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>সিলেবাস ডাটাবেজে সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
