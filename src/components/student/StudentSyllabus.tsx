import React, { useState, useMemo } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SyllabusItem } from '../../types';
import { printHtmlElement } from '../../utils/printHelper';
import {
  BookMarked,
  Printer,
  Search,
  BookOpen,
  FileText,
  ExternalLink,
  Download,
  Eye,
  UserCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';

export const StudentSyllabus: React.FC = () => {
  const { currentStudent, syllabuses, teachers, classes, madrasaInfo } = useMadrasa();
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(
    currentStudent?.classId || 'cls-madani-1'
  );
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingPdfItem, setViewingPdfItem] = useState<SyllabusItem | null>(null);

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

    return teachers[0]?.nameBangla || 'বিষয় শিক্ষক';
  };

  const classSyllabuses = useMemo(() => {
    return syllabuses.filter((item) => {
      // Filter by selected class (if not 'all')
      if (selectedClassFilter !== 'all') {
        const targetClass = classes.find((c) => c.id === selectedClassFilter);
        const matchesId = item.classId === selectedClassFilter;
        const matchesName = targetClass && (item.className === targetClass.name || item.className.includes(targetClass.name));
        if (!matchesId && !matchesName) {
          return false;
        }
      }
      if (selectedTerm !== 'all' && item.term !== selectedTerm) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSub = item.subjectName.toLowerCase().includes(q);
        const matchKit = (item.kitabName || '').toLowerCase().includes(q);
        const matchTeacher = getTeacherDisplayName(item).toLowerCase().includes(q);
        const matchTopic = item.topics.some(
          (t) =>
            t.topicName.toLowerCase().includes(q) ||
            (t.pageRangeOrChapters || '').toLowerCase().includes(q)
        );
        if (!matchSub && !matchKit && !matchTopic && !matchTeacher) return false;
      }
      return true;
    });
  }, [syllabuses, selectedClassFilter, classes, selectedTerm, searchQuery, teachers]);

  const handlePrint = () => {
    printHtmlElement('student-printable-syllabus-sheet', {
      title: `${madrasaInfo.nameBangla} - ${currentStudent?.nameBangla} - সিলেবাস`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-900 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-blue-700" />
                আমার পাঠ্যক্রম ও পরীক্ষার সিলেবাস
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full">
                জামাত: {currentStudent?.className || 'হিফজুল কুরআন'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2">
              বিষয়ভিত্তিক সিলেবাস ও পরীক্ষার প্রস্তুতি
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              আপনার জামাতের সকল বিষয়ের কিতাব, শিক্ষক, অধ্যায়, পৃষ্ঠা, মানবন্টন ও পিডিএফ সিলেবাস
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>আমার সিলেবাস প্রিন্ট করুন</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">জামাত / শ্রেণি</label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সকল জামাতের সিলেবাস</option>
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
              <option value="all">সকল পরীক্ষা ও পাঠপরিকল্পনা</option>
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
                placeholder="বিষয়, শিক্ষক বা অধ্যায় খুঁজুন..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Cards */}
      {classSyllabuses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">সিলেবাস পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1">
            আপনার জামাতের জন্য এখনও কোনো সিলেবাস এন্ট্রি করা হয়নি।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classSyllabuses.map((item) => {
            const teacherName = getTeacherDisplayName(item);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-block mb-1">
                        {item.termLabel}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">{item.subjectName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                        {item.kitabName && item.kitabName !== item.subjectName && (
                          <span>
                            পাঠ্যবই: <strong className="text-blue-900">{item.kitabName}</strong>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200/60">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          উস্তাদ: {teacherName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {item.totalMarks || 100} নম্বর
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        পাস: {item.passMarks || 40}
                      </div>
                    </div>
                  </div>

                  {item.marksDistribution && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-3 text-slate-700">
                      <strong>মানবন্টন:</strong> {item.marksDistribution}
                    </div>
                  )}

                  {item.overview && (
                    <div className="text-xs bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50 mb-3 text-slate-600">
                      <strong>শিক্ষকের পরামর্শ:</strong> {item.overview}
                    </div>
                  )}

                  <div className="space-y-2 mt-3">
                    {(() => {
                      const completedCount = item.topics.filter((t) => t.isCompleted).length;
                      const progress = item.topics.length > 0 ? Math.round((completedCount / item.topics.length) * 100) : 0;
                      return (
                        <>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>পাঠ্য অধ্যায় ও বিষয়বস্তু ({item.topics.length}টি)</span>
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              অগ্রগতি: {progress}%
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                            <div
                              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {item.topics.map((topic, idx) => (
                        <div
                          key={topic.id || idx}
                          className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-2.5 border transition ${
                            topic.isCompleted
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 shrink-0">
                              {topic.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
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
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border border-slate-200 whitespace-nowrap">
                              {topic.pageRangeOrChapters}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {item.attachmentUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {item.attachmentName || 'পিডিএফ সিলেবাস'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setViewingPdfItem(item)}
                        className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>দেখুন</span>
                      </button>
                      <a
                        href={item.attachmentUrl}
                        download={
                          item.attachmentName || `${item.subjectName}_syllabus.pdf`
                        }
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ডাউনলোড</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive PDF Viewer Modal */}
      {viewingPdfItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
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

      {/* Printable Sheet */}
      <div id="student-printable-syllabus-sheet" className="hidden">
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
              শিক্ষার্থীর সিলেবাস ও পাঠ্যসূচি ২০২৬
            </div>
          </div>

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
              <strong>শিক্ষার্থী:</strong> {currentStudent?.nameBangla} (রোল: {currentStudent?.roll})
            </div>
            <div>
              <strong>জামাত:</strong> {currentStudent?.className}
            </div>
            <div>
              <strong>প্রিন্ট তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}
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
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>বিষয় ও কিতাব</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>শিক্ষক</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>পরীক্ষা</th>
                <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>পাঠ্য অধ্যায় ও পৃষ্ঠা</th>
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
              {classSyllabuses.map((item, idx) => (
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
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{item.kitabName}</div>
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
