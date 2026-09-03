import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { UserRole } from '../../types';
import { X, GraduationCap, BookOpen, ShieldCheck, Key, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, defaultTab = 'student' }) => {
  const { loginStudent, loginTeacher, loginAdmin, teachers } = useMadrasa();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>(
    defaultTab === 'admin' ? 'admin' : defaultTab === 'teacher' ? 'teacher' : 'student'
  );

  // Student inputs (Student ID & Password)
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher inputs (Teacher Name/ID & Password/Phone)
  const [teacherName, setTeacherName] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Admin inputs
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Errors / alerts
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = loginStudent(studentId, studentPassword);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = loginTeacher(teacherName, teacherPassword);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = loginAdmin(adminPassword);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Islamic Pattern Style */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-teal-800 text-white p-6 relative">
          <button
            id="close-login-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-['Amiri'] text-blue-200 text-sm mb-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <h2 className="text-2xl font-bold">পোর্টাল লগইন</h2>
            <p className="text-xs text-blue-100 mt-1">দারুল আমানাহ আল ইসলামিয়া</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-blue-950/40 p-1 rounded-xl mt-5 gap-1">
            <button
              id="tab-student-login"
              onClick={() => {
                setActiveTab('student');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              ছাত্র / অভিভাবক
            </button>
            <button
              id="tab-teacher-login"
              onClick={() => {
                setActiveTab('teacher');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              শিক্ষক / উস্তাদ
            </button>
            <button
              id="tab-admin-login"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              অ্যাডমিন
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Student / Guardian Login */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ছাত্র আইডি নম্বর (Student ID) *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    id="student-id-input"
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="উদাঃ DA-2026-101"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ছাত্র পাসওয়ার্ড (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    id="student-password-input"
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-student-login"
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5" />
                  ছাত্র ড্যাশবোর্ডে প্রবেশ করুন
                </button>
              </div>
            </form>
          )}

          {/* Teacher / Ustad Login */}
          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              {/* Teacher Selection or Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  শিক্ষক / উস্তাদের নাম বা আইডি *
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <select
                      id="teacher-name-select"
                      value={teachers.some(t => t.nameBangla === teacherName) ? teacherName : ''}
                      onChange={(e) => {
                        const selName = e.target.value;
                        if (selName) {
                          setTeacherName(selName);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="">-- তালিকা থেকে উস্তাদের নাম নির্বাচন করুন --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.nameBangla}>
                          {t.nameBangla} ({t.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    id="teacher-name-input"
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="অথবা উস্তাদের নাম সরাসরি লিখুন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Teacher Password / Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড (Password / মোবাইল নম্বর) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    id="teacher-password-input"
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড বা মোবাইল নম্বর দিন"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-teacher-login"
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-5 h-5" />
                  শিক্ষক ড্যাশবোর্ডে প্রবেশ করুন
                </button>
              </div>
            </form>
          )}

          {/* Admin Login */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  অ্যাডমিন পাসওয়ার্ড (Admin Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    id="admin-password-input"
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-admin-login"
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  অ্যাডমিন কন্ট্রোল সেন্টারে প্রবেশ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

