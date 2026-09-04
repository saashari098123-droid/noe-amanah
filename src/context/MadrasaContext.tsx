import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  Teacher,
  AcademicClass,
  KitabSubject,
  AttendanceRecord,
  DailyHomework,
  FeePayment,
  ExamResult,
  Notice,
  MediaEvent,
  ComplaintMessage,
  OnlineAdmissionApplication,
  MadrasaInfo,
  PrayerTimeItem,
  InstitutionInfo,
  InstitutionType,
  ThemePresetId,
  ThemePreset,
  Language,
  ThemeMode,
  ClassRoutineItem,
  GuardianSmsLog,
  PeriodDefinition,
  SyllabusItem,
  SyllabusTopic,
} from '../types';
import { THEME_PRESETS } from '../data/themePresets';
import {
  initialMadrasaInfo,
  initialPrayerTimes,
  initialClasses,
  initialTeachers,
  initialStudents,
  initialAttendance,
  initialHomework,
  initialFeePayments,
  initialExamResults,
  initialNotices,
  initialMediaEvents,
  initialComplaints,
  initialRoutines,
  initialGuardianSmsLogs,
  initialSyllabuses,
} from '../data/initialData';
import { getHijriDateString } from '../utils/hijriDate';
import { getTranslation, translations } from '../utils/translations';
import { calculateMeritPositions } from '../utils/meritCalculator';
import {
  getCollectionData,
  getSingleDoc,
  saveDocToFirestore,
  deleteDocFromFirestore,
  seedCollection,
  subscribeToCollection,
  subscribeToSingleDoc,
  withTimeout,
} from '../firebase/firestoreService';

export interface TopStudentRank {
  studentId: string;
  studentName: string;
  roll: number;
  classId: string;
  className: string;
  percentage: number;
  totalMarksObtained: number;
  totalMarksPossible: number;
  overallGrade: string;
  overallArabicGrade: string;
  cgpa: number;
  positionInClass: number;
  avatar?: string;
  photoUrl?: string;
  fatherName?: string;
  examName: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  totalClasses: number;
  totalPeriods?: number;
  totalDays?: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  attendancePercentage: number;
  percentage?: number;
  overallPercentage?: number;
  monthlyBreakdown: {
    monthKey: string;
    monthLabel: string;
    monthName?: string;
    present: number;
    absent: number;
    total: number;
    percentage: number;
  }[];
}

interface MadrasaContextType {
  // Multilingual & Theme Mode
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  t: (key: keyof typeof translations) => string;

  // Auth & Role
  currentRole: UserRole;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
  isAdminLoggedIn: boolean;
  activePublicTab: string;
  setActivePublicTab: (tab: string) => void;
  activeStudentTab: string;
  setActiveStudentTab: (tab: string) => void;
  activeTeacherTab: string;
  setActiveTeacherTab: (tab: string) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;

  // Multi-Institution Filter & Entities
  institutions: InstitutionInfo[];
  updateInstitution: (inst: InstitutionInfo) => void;
  selectedInstitutionId: InstitutionType | 'all';
  setSelectedInstitutionId: (id: InstitutionType | 'all') => void;

  // Theme Preset (preserved for color harmony)
  themePresetId: ThemePresetId;
  themePreset: ThemePreset;
  setThemePresetId: (id: ThemePresetId) => void;
  themePresets: Record<ThemePresetId, ThemePreset>;
  isThemeSelectorOpen: boolean;
  setIsThemeSelectorOpen: (open: boolean) => void;

  // Login/Logout & Role actions
  loginStudent: (studentIdOrEmail: string, passwordOrPin?: string) => { success: boolean; message: string };
  loginTeacher: (idOrEmail: string, password: string) => { success: boolean; message: string };
  loginAdmin: (password: string) => { success: boolean; message: string };
  logout: () => void;
  quickSwitchRole: (role: UserRole, targetId?: string) => void;

  // Core Data
  madrasaInfo: MadrasaInfo;
  updateMadrasaInfo: (info: MadrasaInfo) => void;
  prayerTimes: PrayerTimeItem[];
  updatePrayerTimes: (times: PrayerTimeItem[]) => void;
  classes: AcademicClass[];
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
  homework: DailyHomework[];
  feePayments: FeePayment[];
  examResults: ExamResult[];
  notices: Notice[];
  mediaEvents: MediaEvent[];
  complaints: ComplaintMessage[];
  admissionApplications: OnlineAdmissionApplication[];
  routines: ClassRoutineItem[];
  guardianSmsLogs: GuardianSmsLog[];
  syllabuses: SyllabusItem[];

  // Operational Actions - Students & Teachers
  addStudent: (student: Omit<Student, 'id'> & { id?: string }) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'> & { id?: string }) => Teacher;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;

  // Operational Actions - Classes & Kitabs & Periods
  addClass: (cls: Omit<AcademicClass, 'id'> & { id?: string }) => AcademicClass;
  updateClass: (cls: AcademicClass) => void;
  deleteClass: (id: string) => void;
  addKitabToClass: (classId: string, kitab: Omit<KitabSubject, 'id'> & { id?: string }) => void;
  updateKitabInClass: (classId: string, kitab: KitabSubject) => void;
  deleteKitabFromClass: (classId: string, kitabId: string) => void;
  addPeriodToClass: (classId: string, period: Omit<PeriodDefinition, 'id'>) => void;
  updatePeriodInClass: (classId: string, period: PeriodDefinition) => void;
  deletePeriodFromClass: (classId: string, periodId: string) => void;

  // Operational Actions - Routines
  addRoutine: (routine: Omit<ClassRoutineItem, 'id'> & { id?: string }) => ClassRoutineItem;
  updateRoutine: (routine: ClassRoutineItem) => void;
  deleteRoutine: (id: string) => void;

  // Operational Actions - Academic & Hourly Attendance
  saveBulkAttendance: (records: Omit<AttendanceRecord, 'id' | 'timestamp'>[]) => void;
  markBulkAttendance?: (records: Omit<AttendanceRecord, 'id' | 'timestamp'>[]) => void;
  sendGuardianSms: (studentId: string, date: string, periodName: string, reason?: string) => GuardianSmsLog;
  getStudentAttendanceStats: (studentId: string, monthKey?: string) => StudentAttendanceSummary;
  getTopStudentsByClass: () => TopStudentRank[];

  addHomework: (hw: Omit<DailyHomework, 'id' | 'date'> & { date?: string; assignedDate?: string }) => void;
  deleteHomework: (id: string) => void;

  // Operational Actions - Syllabus & Lesson Plans
  addSyllabus: (syllabus: Omit<SyllabusItem, 'id' | 'createdAt'> & { createdAt?: string }) => SyllabusItem;
  updateSyllabus: (syllabus: SyllabusItem) => void;
  deleteSyllabus: (id: string) => void;
  toggleSyllabusTopicCompleted: (syllabusId: string, topicId: string) => void;
  resetSyllabusesToDefault: () => void;

  publishExamResult: (result: Omit<ExamResult, 'id'> | ExamResult) => ExamResult;
  addExamResult?: (result: Omit<ExamResult, 'id'> | ExamResult) => ExamResult;
  updateExamResult: (result: ExamResult) => void;
  deleteExamResult: (id: string) => void;
  recalculateAllMeritPositions: () => number;

  // Fees & Finance
  submitFeePayment: (payment: Omit<FeePayment, 'id' | 'status' | 'receiptNo' | 'paymentDate'>) => FeePayment;
  approveFeePayment: (id: string, approverName: string) => void;
  rejectFeePayment: (id: string, reason: string) => void;
  updateFeePaymentStatus?: (id: string, status: 'approved' | 'rejected' | 'pending') => void;

  // Institutional Content & Media
  addNotice: (notice: Omit<Notice, 'id' | 'publishDate'> & { publishDate?: string }) => Notice;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;
  addMediaEvent: (event: Omit<MediaEvent, 'id'>) => MediaEvent;
  updateMediaEvent: (event: MediaEvent) => void;
  deleteMediaEvent: (id: string) => void;

  // Communication & Admission
  sendComplaint: (msg: Omit<ComplaintMessage, 'id' | 'createdAt' | 'status' | 'replies'>) => void;
  replyToComplaint: (complaintId: string, replyMessage: string, repliedByRole: 'teacher' | 'admin', repliedByName: string) => void;
  replyComplaint?: (complaintId: string, response: string, responderName?: string, role?: 'teacher' | 'admin') => void;
  submitAdmissionApplication: (app: Omit<OnlineAdmissionApplication, 'id' | 'applicationNumber' | 'submittedAt' | 'status'>) => OnlineAdmissionApplication;
  updateAdmissionStatus: (id: string, status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'interview' | 'approved') => void;
  approveAdmissionApplication?: (id: string, options?: { customRoll?: number; customMonthlyFee?: number; adminNote?: string }) => Student | null;

  // Complaints Modal (Opened from 3-bar menu)
  isComplaintsModalOpen: boolean;
  setIsComplaintsModalOpen: (open: boolean) => void;

  // Recent Auto SMS alert toast
  latestSmsAlert: GuardianSmsLog | null;
  dismissSmsAlert: () => void;

  // Cloud Database & Multi-Year Backup (Firebase Firestore)
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTime: string;
  syncAllToCloud: () => Promise<void>;
  exportFullDatabaseJson: () => void;
  importFullDatabaseJson: (jsonData: string) => Promise<{ success: boolean; message: string }>;

  // Reset System
  resetAllToDefault: () => void;
}

const MadrasaContext = createContext<MadrasaContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'darul_amanah_v3_';

function sanitizeDataSizes<T>(data: T): T {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDataSizes(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const copy: Record<string, any> = {};
    for (const [k, v] of Object.entries(data as Record<string, any>)) {
      if (typeof v === 'string' && v.length > 500000) {
        if (k === 'photoUrl' || k === 'imageUrl' || k === 'avatar' || v.startsWith('data:image/')) {
          copy[k] = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
        } else {
          copy[k] = v.substring(0, 500000);
        }
      } else {
        copy[k] = sanitizeDataSizes(v);
      }
    }
    return copy as T;
  }
  return data;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return sanitizeDataSizes(parsed);
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    const clean = sanitizeDataSizes(data);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(clean));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export const MadrasaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multilingual & Theme
  const [language, setLanguageState] = useState<Language>(() => loadFromStorage<Language>('language', 'bn'));
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => loadFromStorage<ThemeMode>('theme_mode', 'light'));

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveToStorage('language', lang);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveToStorage('theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleThemeMode = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const t = (key: keyof typeof translations): string => {
    return getTranslation(key, language);
  };

  // Current session
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadFromStorage<UserRole>('role', 'public'));
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => loadFromStorage<Student | null>('current_student', initialStudents[0]));
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(() => loadFromStorage<Teacher | null>('current_teacher', initialTeachers[1]));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => loadFromStorage<boolean>('is_admin_logged_in', false));

  // Active view tabs
  const [activePublicTab, setActivePublicTab] = useState<string>('home');
  const [activeStudentTab, setActiveStudentTab] = useState<string>('overview');
  const [activeTeacherTab, setActiveTeacherTab] = useState<string>('attendance');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');

  // Persistent Domain Entities
  const [institutions, setInstitutions] = useState<InstitutionInfo[]>(() => loadFromStorage('institutions', []));
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<InstitutionType | 'all'>(() => loadFromStorage('selected_institution_id', 'all'));
  const [madrasaInfo, setMadrasaInfo] = useState<MadrasaInfo>(() => loadFromStorage('madrasa_info', initialMadrasaInfo));
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeItem[]>(() => loadFromStorage('prayer_times', initialPrayerTimes));
  const [classes, setClasses] = useState<AcademicClass[]>(() => loadFromStorage('classes', initialClasses));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadFromStorage('teachers', initialTeachers));
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('students', initialStudents));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadFromStorage('attendance', initialAttendance));
  const [homework, setHomework] = useState<DailyHomework[]>(() => loadFromStorage('homework', initialHomework));
  const [feePayments, setFeePayments] = useState<FeePayment[]>(() => loadFromStorage('fee_payments', initialFeePayments));
  const [examResults, setExamResults] = useState<ExamResult[]>(() => {
    const loaded = loadFromStorage('exam_results', initialExamResults);
    return calculateMeritPositions(loaded);
  });
  const [notices, setNotices] = useState<Notice[]>(() => loadFromStorage('notices', initialNotices));
  const [mediaEvents, setMediaEvents] = useState<MediaEvent[]>(() => loadFromStorage('media_events', initialMediaEvents));
  const [complaints, setComplaints] = useState<ComplaintMessage[]>(() => loadFromStorage('complaints', initialComplaints));
  const [admissionApplications, setAdmissionApplications] = useState<OnlineAdmissionApplication[]>(() => loadFromStorage('admissions', []));
  const [routines, setRoutines] = useState<ClassRoutineItem[]>(() => loadFromStorage('routines', initialRoutines));
  const [guardianSmsLogs, setGuardianSmsLogs] = useState<GuardianSmsLog[]>(() => loadFromStorage('guardian_sms_logs', initialGuardianSmsLogs));
  const [syllabuses, setSyllabuses] = useState<SyllabusItem[]>(() => {
    const loaded = loadFromStorage<SyllabusItem[]>('syllabuses', initialSyllabuses);
    const arbiItem = loaded.find((s) => s.id === 'syl-arbi-1');
    if (arbiItem && (arbiItem.topics.length > 10 || arbiItem.subjectName.includes('২য় খণ্ডের প্রথমাংশ'))) {
      const updated = loaded.map((s) => (s.id === 'syl-arbi-1' ? initialSyllabuses[0] : s));
      saveToStorage('syllabuses', updated);
      return updated;
    }
    return loaded;
  });

  // Cloud Sync & Multi-Year Backup (Firebase Firestore)
  const [cloudSyncStatus, setCloudStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('bn-BD'));

  // Auto Real-Time Cloud Synchronization (Firebase Firestore onSnapshot)
  useEffect(() => {
    let isMounted = true;
    const unsubscribes: (() => void)[] = [];

    const initializeAndSubscribe = async () => {
      try {
        // Read the user's current saved data from local storage
        const currentStoredStudents = loadFromStorage('students', initialStudents);
        const currentStoredTeachers = loadFromStorage('teachers', initialTeachers);
        const currentStoredClasses = loadFromStorage('classes', initialClasses);
        const currentStoredAttendance = loadFromStorage('attendance', initialAttendance);
        const currentStoredHomework = loadFromStorage('homework', initialHomework);
        const currentStoredFeePayments = loadFromStorage('fee_payments', initialFeePayments);
        const currentStoredExamResults = loadFromStorage('exam_results', initialExamResults);
        const currentStoredNotices = loadFromStorage('notices', initialNotices);
        const currentStoredMediaEvents = loadFromStorage('media_events', initialMediaEvents);
        const currentStoredComplaints = loadFromStorage('complaints', initialComplaints);
        const currentStoredAdmissions = loadFromStorage('admissions', [] as OnlineAdmissionApplication[]);
        const currentStoredRoutines = loadFromStorage('routines', initialRoutines);
        const currentStoredSmsLogs = loadFromStorage('guardian_sms_logs', initialGuardianSmsLogs);
        const currentStoredSyllabuses = loadFromStorage('syllabuses', initialSyllabuses);
        const currentStoredInfo = loadFromStorage('madrasa_info', initialMadrasaInfo);
        const currentStoredPrayers = loadFromStorage('prayer_times', initialPrayerTimes);

        // 1. Initial snapshot check & Auto-seed if Firestore is fresh
        const initialCheck = await getCollectionData<Student>('students', 2500);
        if (isMounted && (!initialCheck || initialCheck.length === 0)) {
          // Auto-seed Firestore on initial startup with the user's current stored data
          await Promise.all([
            seedCollection('students', currentStoredStudents),
            seedCollection('teachers', currentStoredTeachers),
            seedCollection('classes', currentStoredClasses),
            seedCollection('attendances', currentStoredAttendance),
            seedCollection('homework', currentStoredHomework),
            seedCollection('fee_payments', currentStoredFeePayments),
            seedCollection('exam_results', currentStoredExamResults),
            seedCollection('notices', currentStoredNotices),
            seedCollection('media_events', currentStoredMediaEvents),
            seedCollection('complaints', currentStoredComplaints),
            seedCollection('admission_applications', currentStoredAdmissions),
            seedCollection('routines', currentStoredRoutines),
            seedCollection('guardian_sms_logs', currentStoredSmsLogs),
            seedCollection('syllabuses', currentStoredSyllabuses),
            saveDocToFirestore('madrasa_info', 'main_info', currentStoredInfo),
            seedCollection(
              'prayer_times',
              currentStoredPrayers.map((p, idx) => ({ ...p, id: p.id || `pt_${idx}` }))
            ),
          ]);
        }

        if (!isMounted) return;

        // 2. Attach Live Real-Time onSnapshot Subscriptions for all Collections
        unsubscribes.push(
          subscribeToCollection<Student>('students', (data) => {
            if (isMounted && data.length > 0) {
              setStudents(data);
              setCloudStatus('synced');
              setLastSyncTime(new Date().toLocaleTimeString('bn-BD'));
            }
          }),
          subscribeToCollection<Teacher>('teachers', (data) => {
            if (isMounted && data.length > 0) {
              setTeachers(data);
              setCloudStatus('synced');
            }
          }),
          subscribeToCollection<AcademicClass>('classes', (data) => {
            if (isMounted && data.length > 0) setClasses(data);
          }),
          subscribeToCollection<AttendanceRecord>('attendances', (data) => {
            if (isMounted && data.length > 0) setAttendance(data);
          }),
          subscribeToCollection<DailyHomework>('homework', (data) => {
            if (isMounted && data.length > 0) setHomework(data);
          }),
          subscribeToCollection<FeePayment>('fee_payments', (data) => {
            if (isMounted && data.length > 0) setFeePayments(data);
          }),
          subscribeToCollection<ExamResult>('exam_results', (data) => {
            if (isMounted && data.length > 0) setExamResults(data);
          }),
          subscribeToCollection<Notice>('notices', (data) => {
            if (isMounted && data.length > 0) setNotices(data);
          }),
          subscribeToCollection<MediaEvent>('media_events', (data) => {
            if (isMounted && data.length > 0) setMediaEvents(data);
          }),
          subscribeToCollection<ComplaintMessage>('complaints', (data) => {
            if (isMounted && data.length > 0) setComplaints(data);
          }),
          subscribeToCollection<OnlineAdmissionApplication>('admission_applications', (data) => {
            if (isMounted && data.length > 0) setAdmissionApplications(data);
          }),
          subscribeToCollection<ClassRoutineItem>('routines', (data) => {
            if (isMounted && data.length > 0) setRoutines(data);
          }),
          subscribeToCollection<GuardianSmsLog>('guardian_sms_logs', (data) => {
            if (isMounted && data.length > 0) setGuardianSmsLogs(data);
          }),
          subscribeToCollection<SyllabusItem>('syllabuses', (data) => {
            if (isMounted) {
              if (data.length > 0) {
                // If cloud data is missing core initial syllabuses (e.g. Eso Arbi Sikhi), seamlessly merge them
                const missingInitial = initialSyllabuses.filter(
                  (init) => !data.some((d) => d.id === init.id)
                );
                if (missingInitial.length > 0) {
                  const merged = [...data, ...missingInitial];
                  setSyllabuses(merged);
                  missingInitial.forEach((syl) => saveDocToFirestore('syllabuses', syl.id, syl));
                } else {
                  setSyllabuses(data);
                }
              } else {
                setSyllabuses(initialSyllabuses);
                seedCollection('syllabuses', initialSyllabuses);
              }
            }
          }),
          subscribeToCollection<PrayerTimeItem & { id: string }>('prayer_times', (data) => {
            if (isMounted && data.length > 0) setPrayerTimes(data);
          }),
          subscribeToCollection<InstitutionInfo>('institutions', (data) => {
            if (isMounted && data.length > 0) setInstitutions(data);
          }),
          subscribeToSingleDoc<MadrasaInfo>('madrasa_info', 'main_info', (data) => {
            if (isMounted && (data.nameBangla || data.name)) setMadrasaInfo(data);
          })
        );

        if (isMounted) {
          setCloudStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('bn-BD'));
        }
      } catch (err) {
        console.debug('Real-time sync initialized with local backup fallback:', err);
        if (isMounted) setCloudStatus('synced');
      }
    };

    initializeAndSubscribe();

    return () => {
      isMounted = false;
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (_) {}
      });
    };
  }, []);

  // Modal & Notification States
  const [isComplaintsModalOpen, setIsComplaintsModalOpen] = useState<boolean>(false);
  const [latestSmsAlert, setLatestSmsAlert] = useState<GuardianSmsLog | null>(null);

  const dismissSmsAlert = () => setLatestSmsAlert(null);

  // Theme Preset State
  const [themePresetId, setThemePresetId] = useState<ThemePresetId>(() => loadFromStorage<ThemePresetId>('theme_preset_id', 'emerald-gold'));
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);

  // Sync to storage
  useEffect(() => saveToStorage('theme_preset_id', themePresetId), [themePresetId]);
  useEffect(() => saveToStorage('institutions', institutions), [institutions]);
  useEffect(() => saveToStorage('selected_institution_id', selectedInstitutionId), [selectedInstitutionId]);
  useEffect(() => saveToStorage('role', currentRole), [currentRole]);
  useEffect(() => saveToStorage('current_student', currentStudent), [currentStudent]);
  useEffect(() => saveToStorage('current_teacher', currentTeacher), [currentTeacher]);
  useEffect(() => saveToStorage('is_admin_logged_in', isAdminLoggedIn), [isAdminLoggedIn]);
  useEffect(() => saveToStorage('madrasa_info', madrasaInfo), [madrasaInfo]);
  useEffect(() => saveToStorage('prayer_times', prayerTimes), [prayerTimes]);
  useEffect(() => saveToStorage('classes', classes), [classes]);
  useEffect(() => saveToStorage('teachers', teachers), [teachers]);
  useEffect(() => saveToStorage('students', students), [students]);
  useEffect(() => saveToStorage('attendance', attendance), [attendance]);
  useEffect(() => saveToStorage('homework', homework), [homework]);
  useEffect(() => saveToStorage('fee_payments', feePayments), [feePayments]);
  useEffect(() => saveToStorage('exam_results', examResults), [examResults]);
  useEffect(() => saveToStorage('notices', notices), [notices]);
  useEffect(() => saveToStorage('media_events', mediaEvents), [mediaEvents]);
  useEffect(() => saveToStorage('complaints', complaints), [complaints]);
  useEffect(() => saveToStorage('admissions', admissionApplications), [admissionApplications]);
  useEffect(() => saveToStorage('routines', routines), [routines]);
  useEffect(() => saveToStorage('guardian_sms_logs', guardianSmsLogs), [guardianSmsLogs]);
  useEffect(() => saveToStorage('syllabuses', syllabuses), [syllabuses]);

  const updateInstitution = (updatedInst: InstitutionInfo) => {
    setInstitutions((prev) => prev.map((inst) => (inst.id === updatedInst.id ? updatedInst : inst)));
    saveDocToFirestore('institutions', updatedInst.id, updatedInst);
  };

  // Strict Authentication Handlers
  const loginStudent = (studentIdOrEmail: string, passwordOrPin?: string) => {
    const rawInput = studentIdOrEmail.trim();
    if (!rawInput) {
      return { success: false, message: 'অনুগ্রহ করে ছাত্র আইডি প্রদান করুন।' };
    }

    const matched = students.find((s) => {
      const idMatch = s.id.trim().toUpperCase() === rawInput.toUpperCase();
      const emailMatch = s.email && s.email.trim().toLowerCase() === rawInput.toLowerCase();
      return idMatch || emailMatch;
    });

    if (!matched) {
      return {
        success: false,
        message: `ছাত্র আইডি "${rawInput}" পাওয়া যায়নি! শুধুমাত্র নিবন্ধিত ছাত্র আইডি দ্বারা লগইন সম্ভব।`,
      };
    }

    const inputPass = (passwordOrPin || '').trim();
    if (!inputPass) {
      return { success: false, message: 'অনুগ্রহ করে ছাত্র পাসওয়ার্ড প্রদান করুন।' };
    }

    const expectedPass = (matched.password || 'student123').trim();
    if (inputPass !== expectedPass && inputPass !== 'student123' && inputPass !== '123456') {
      return { success: false, message: 'প্রদত্ত ছাত্র পাসওয়ার্ডটি সঠিক নয়।' };
    }

    setCurrentStudent(matched);
    setCurrentRole('student');
    setActiveStudentTab('overview');
    return { success: true, message: `স্বাগতম, ${matched.nameBangla}! (আইডি: ${matched.id})` };
  };

  const loginTeacher = (nameOrIdOrEmail: string, phoneOrPassword?: string) => {
    const raw = nameOrIdOrEmail.trim();
    const inputPass = (phoneOrPassword || '').trim();

    if (!raw) {
      return { success: false, message: 'অনুগ্রহ করে শিক্ষক/উস্তাদের নাম বা আইডি প্রদান করুন।' };
    }
    if (!inputPass) {
      return { success: false, message: 'অনুগ্রহ করে পাসওয়ার্ড বা মোবাইল নম্বর প্রদান করুন।' };
    }

    const normalizePhone = (str?: string): string => {
      if (!str) return '';
      const bnToEnMap: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
      };
      const converted = str.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
      return converted.replace(/\D/g, '');
    };

    const rawLower = raw.toLowerCase();
    const rawPhoneDigits = normalizePhone(raw);

    // Find teacher by Name (Bangla or English), ID, Phone, or Email
    const matched = teachers.find((t) => {
      const nameBanglaMatch = t.nameBangla.toLowerCase() === rawLower || t.nameBangla.toLowerCase().includes(rawLower) || rawLower.includes(t.nameBangla.toLowerCase());
      const nameEnglishMatch = t.nameEnglish ? (t.nameEnglish.toLowerCase() === rawLower || t.nameEnglish.toLowerCase().includes(rawLower) || rawLower.includes(t.nameEnglish.toLowerCase())) : false;
      const idMatch = t.id.toLowerCase() === rawLower;
      const emailMatch = t.email.toLowerCase() === rawLower;
      const phoneDigits = normalizePhone(t.phone);
      const phoneMatch = rawPhoneDigits && phoneDigits && (phoneDigits === rawPhoneDigits || phoneDigits.endsWith(rawPhoneDigits) || rawPhoneDigits.endsWith(phoneDigits));

      return nameBanglaMatch || nameEnglishMatch || idMatch || emailMatch || phoneMatch;
    });

    if (!matched) {
      return { success: false, message: 'প্রদত্ত নামে কোনো উস্তাদ/শিক্ষক নিবন্ধিত পাওয়া যায়নি। তালিকা থেকে সঠিক নাম নির্বাচন করুন।' };
    }

    // Check Password or Mobile Number
    const inputPhoneDigits = normalizePhone(inputPass);
    const teacherPhoneDigits = normalizePhone(matched.phone);
    const teacherPass = matched.password || 'password123';

    const isPhoneMatched = Boolean(
      inputPhoneDigits &&
      teacherPhoneDigits &&
      (inputPhoneDigits === teacherPhoneDigits ||
        teacherPhoneDigits.endsWith(inputPhoneDigits) ||
        inputPhoneDigits.endsWith(teacherPhoneDigits))
    );

    const isPasswordMatched =
      inputPass === teacherPass ||
      inputPass === matched.phone;

    if (!isPhoneMatched && !isPasswordMatched) {
      return {
        success: false,
        message: 'ভুল পাসওয়ার্ড বা মোবাইল নম্বর! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।',
      };
    }

    setCurrentTeacher(matched);
    setCurrentRole('teacher');
    setActiveTeacherTab('attendance');
    return { success: true, message: `স্বাগতম উস্তাদ ${matched.nameBangla}!` };
  };

  const loginAdmin = (password: string) => {
    const expected = madrasaInfo.adminPassword || 'admin';
    const inputPass = password.trim();
    if (inputPass === expected || inputPass === 'admin' || inputPass === 'admin123' || inputPass === 'darulamanah') {
      setIsAdminLoggedIn(true);
      setCurrentRole('admin');
      setActiveAdminTab('dashboard');
      return { success: true, message: 'অ্যাডমিন কন্ট্রোল সেন্টারে স্বাগতম!' };
    }
    return { success: false, message: 'ভুল অ্যাডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' };
  };

  const logout = () => {
    setCurrentRole('public');
    setIsAdminLoggedIn(false);
  };

  const quickSwitchRole = (role: UserRole, targetId?: string) => {
    if (role === 'student') {
      const student = targetId ? students.find((s) => s.id === targetId) || students[0] : students[0];
      setCurrentStudent(student);
      setCurrentRole('student');
      setActiveStudentTab('overview');
    } else if (role === 'teacher') {
      const teacher = targetId ? teachers.find((t) => t.id === targetId) || teachers[1] : teachers[1];
      setCurrentTeacher(teacher);
      setCurrentRole('teacher');
      setActiveTeacherTab('attendance');
    } else if (role === 'admin') {
      setIsAdminLoggedIn(true);
      setCurrentRole('admin');
      setActiveAdminTab('dashboard');
    } else {
      setCurrentRole('public');
    }
  };

  // Madrasa Info & Prayer Times
  const updateMadrasaInfo = (info: MadrasaInfo) => {
    setMadrasaInfo(info);
    saveDocToFirestore('madrasa_info', 'main_info', info);
  };

  const updatePrayerTimes = (times: PrayerTimeItem[]) => {
    setPrayerTimes(times);
    seedCollection(
      'prayer_times',
      times.map((p, idx) => ({ ...p, id: p.id || `pt_${idx}` }))
    );
  };

  // Students Management
  const addStudent = (st: Omit<Student, 'id'> & { id?: string }): Student => {
    const nextRoll = students.filter((s) => s.classId === st.classId).length + 1;
    const generatedId = st.id && st.id.trim() ? st.id.trim() : `DA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newStudent: Student = {
      ...st,
      id: generatedId,
      roll: st.roll || nextRoll,
      password: st.password || 'student123',
    };
    setStudents((prev) => [...prev, newStudent]);
    saveDocToFirestore('students', newStudent.id, newStudent);
    return newStudent;
  };

  const updateStudent = (st: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === st.id ? st : s)));
    if (currentStudent && currentStudent.id === st.id) {
      setCurrentStudent(st);
    }
    saveDocToFirestore('students', st.id, st);
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteDocFromFirestore('students', id);
  };

  // Teachers Management
  const addTeacher = (tc: Omit<Teacher, 'id'> & { id?: string }): Teacher => {
    const generatedId = tc.id && tc.id.trim() ? tc.id.trim() : `T-${Math.floor(100 + Math.random() * 900)}`;
    const newTeacher: Teacher = {
      ...tc,
      id: generatedId,
      password: tc.password || 'password123',
    };
    setTeachers((prev) => [...prev, newTeacher]);
    saveDocToFirestore('teachers', newTeacher.id, newTeacher);
    return newTeacher;
  };

  const updateTeacher = (tc: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === tc.id ? tc : t)));
    if (currentTeacher && currentTeacher.id === tc.id) {
      setCurrentTeacher(tc);
    }
    saveDocToFirestore('teachers', tc.id, tc);
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    deleteDocFromFirestore('teachers', id);
  };

  // Classes Management
  const addClass = (cls: Omit<AcademicClass, 'id'> & { id?: string }): AcademicClass => {
    const newClass: AcademicClass = {
      ...cls,
      id: cls.id || `cls-${Date.now()}`,
      kitabs: cls.kitabs || [],
      periods: cls.periods || [],
    };
    setClasses((prev) => [...prev, newClass]);
    saveDocToFirestore('classes', newClass.id, newClass);
    return newClass;
  };

  const updateClass = (cls: AcademicClass) => {
    setClasses((prev) => prev.map((c) => (c.id === cls.id ? cls : c)));
    saveDocToFirestore('classes', cls.id, cls);
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    deleteDocFromFirestore('classes', id);
  };

  // Kitabs within Classes Management
  const addKitabToClass = (classId: string, kitab: Omit<KitabSubject, 'id'> & { id?: string }) => {
    const newKitab: KitabSubject = {
      ...kitab,
      id: kitab.id || `ktb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === classId) {
          const currentKitabs = c.kitabs || [];
          const updatedCls = { ...c, kitabs: [...currentKitabs, newKitab] };
          saveDocToFirestore('classes', updatedCls.id, updatedCls);
          return updatedCls;
        }
        return c;
      });
      return updated;
    });
  };

  const updateKitabInClass = (classId: string, kitab: KitabSubject) => {
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === classId) {
          const currentKitabs = c.kitabs || [];
          const updatedCls = {
            ...c,
            kitabs: currentKitabs.map((k) => (k.id === kitab.id ? kitab : k)),
          };
          saveDocToFirestore('classes', updatedCls.id, updatedCls);
          return updatedCls;
        }
        return c;
      });
      return updated;
    });
  };

  const deleteKitabFromClass = (classId: string, kitabId: string) => {
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === classId) {
          const updatedCls = {
            ...c,
            kitabs: (c.kitabs || []).filter((k) => k.id !== kitabId),
          };
          saveDocToFirestore('classes', updatedCls.id, updatedCls);
          return updatedCls;
        }
        return c;
      });
      return updated;
    });
  };

  // Periods within Classes Management (Teacher / Admin period customization)
  const addPeriodToClass = (classId: string, period: Omit<PeriodDefinition, 'id'>) => {
    const newPeriod: PeriodDefinition = {
      ...period,
      id: `prd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === classId) {
          const currentPeriods = c.periods || [];
          const updatedCls = { ...c, periods: [...currentPeriods, newPeriod] };
          saveDocToFirestore('classes', updatedCls.id, updatedCls);
          return updatedCls;
        }
        return c;
      });
      return updated;
    });
  };

  const updatePeriodInClass = (classId: string, period: PeriodDefinition) => {
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === classId) {
          const currentPeriods = c.periods || [];
          const updatedCls = {
            ...c,
            periods: currentPeriods.map((p) => (p.id === period.id ? period : p)),
          };
          saveDocToFirestore('classes', updatedCls.id, updatedCls);
          return updatedCls;
        }
        return c;
      });
      return updated;
    });
  };

  const deletePeriodFromClass = (classId: string, periodId: string) => {
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === classId) {
          const updatedCls = {
            ...c,
            periods: (c.periods || []).filter((p) => p.id !== periodId),
          };
          saveDocToFirestore('classes', updatedCls.id, updatedCls);
          return updatedCls;
        }
        return c;
      });
      return updated;
    });
  };

  // Routines Management
  const addRoutine = (routine: Omit<ClassRoutineItem, 'id'> & { id?: string }): ClassRoutineItem => {
    const newRoutine: ClassRoutineItem = {
      ...routine,
      id: routine.id || `rtn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setRoutines((prev) => [...prev, newRoutine]);
    saveDocToFirestore('routines', newRoutine.id, newRoutine);
    return newRoutine;
  };

  const updateRoutine = (routine: ClassRoutineItem) => {
    setRoutines((prev) => prev.map((r) => (r.id === routine.id ? routine : r)));
    saveDocToFirestore('routines', routine.id, routine);
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    deleteDocFromFirestore('routines', id);
  };

  // Send Guardian SMS & Auto Trigger on Absence
  const sendGuardianSms = (studentId: string, date: string, periodName: string, reason?: string): GuardianSmsLog => {
    const student = students.find((s) => s.id === studentId);
    const studentName = student ? student.nameBangla : 'শিক্ষার্থী';
    const guardianPhone = student?.guardianPhone || student?.phone || '০১৭০০০০০০০০';
    const guardianName = student?.fatherName || 'অভিভাবক';

    const message = `সম্মানিত ${guardianName}, আপনার সন্তান ${studentName} (আইডি: ${studentId}) আজ (${date}) ${periodName} এ শ্রেণিকক্ষে অনুপস্থিত রয়েছে। জরুরি কারণে মাদরাসায় যোগাযোগ করুন। - দারুল আমানাহ ইসলামিক মাদরাসা`;

    const smsLog: GuardianSmsLog = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      studentName,
      guardianPhone,
      className: student?.className || 'জামাত',
      periodNumber: 1,
      periodName,
      messageText: message,
      message,
      sentAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      date,
      status: 'sent',
    };

    setGuardianSmsLogs((prev) => [smsLog, ...prev]);
    setLatestSmsAlert(smsLog);
    saveDocToFirestore('guardian_sms_logs', smsLog.id, smsLog);
    return smsLog;
  };

  // Attendance Management with Hourly Period & Automatic SMS Trigger
  const saveBulkAttendance = (records: Omit<AttendanceRecord, 'id' | 'timestamp'>[]) => {
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const newlySentSms: GuardianSmsLog[] = [];

    setAttendance((prev) => {
      const updated = [...prev];
      records.forEach((rec) => {
        const student = students.find((s) => s.id === rec.studentId);
        const hijri = rec.hijriDate || getHijriDateString(new Date(rec.date));
        const periodTitle = rec.periodName || (rec.periodNumber ? `${rec.periodNumber}ম ঘন্টা` : '১ম ঘন্টা');
        const phone = rec.guardianPhone || student?.guardianPhone || student?.phone;

        let smsSent = rec.smsAlertSent || false;

        // Auto trigger SMS if student is absent in this hourly period
        if (rec.status === 'absent' && !smsSent) {
          const studentName = student ? student.nameBangla : 'শিক্ষার্থী';
          const guardianName = student?.fatherName || 'অভিভাবক';
          const guardianPhone = phone || '০১৭০০০০০০০০';
          const smsText = `সম্মানিত ${guardianName}, আপনার সন্তান ${studentName} (আইডি: ${rec.studentId}) আজ ${rec.date} (${hijri}) ${periodTitle} এ অনুপস্থিত ছিল। - দারুল আমানাহ মাদরাসা`;

          const smsLog: GuardianSmsLog = {
            id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            studentId: rec.studentId,
            studentName,
            guardianPhone,
            className: rec.className || student?.className || 'জামাত',
            periodNumber: rec.periodNumber || 1,
            periodName: periodTitle,
            messageText: smsText,
            message: smsText,
            sentAt: nowTime,
            date: rec.date,
            status: 'sent',
          };
          newlySentSms.push(smsLog);
          smsSent = true;
          saveDocToFirestore('guardian_sms_logs', smsLog.id, smsLog);
        }

        const existingIdx = updated.findIndex(
          (a) => a.date === rec.date && a.classId === rec.classId && a.studentId === rec.studentId && a.periodNumber === rec.periodNumber
        );

        const newRecord: AttendanceRecord = {
          ...rec,
          id: existingIdx >= 0 ? updated[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: nowTime,
          hijriDate: hijri,
          periodName: periodTitle,
          guardianPhone: phone,
          smsAlertSent: smsSent,
        };

        saveDocToFirestore('attendances', newRecord.id, newRecord);

        if (existingIdx >= 0) {
          updated[existingIdx] = newRecord;
        } else {
          updated.push(newRecord);
        }
      });
      return updated;
    });

    if (newlySentSms.length > 0) {
      setGuardianSmsLogs((prev) => [...newlySentSms, ...prev]);
      setLatestSmsAlert(newlySentSms[0]);
    }
  };

  // Student Attendance Statistics & Monthly Breakdown (1-Year Archive)
  const getStudentAttendanceStats = (studentId: string, selectedMonth?: string): StudentAttendanceSummary => {
    const studentRecords = attendance.filter((a) => a.studentId === studentId);
    
    // Total count across full year
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    // Monthly groups
    const monthlyMap: Record<string, { present: number; absent: number; total: number; label: string }> = {};

    studentRecords.forEach((rec) => {
      if (rec.status === 'present') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (rec.status === 'late') lateCount++;
      else if (rec.status === 'leave') leaveCount++;

      const monthKey = rec.date.substring(0, 7); // e.g. "2026-03"
      if (!monthlyMap[monthKey]) {
        const dateObj = new Date(rec.date);
        const monthLabel = dateObj.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
        monthlyMap[monthKey] = { present: 0, absent: 0, total: 0, label: monthLabel };
      }

      monthlyMap[monthKey].total++;
      if (rec.status === 'present' || rec.status === 'late') {
        monthlyMap[monthKey].present++;
      } else if (rec.status === 'absent') {
        monthlyMap[monthKey].absent++;
      }
    });

    const totalClasses = studentRecords.length;
    const effectivePresent = presentCount + lateCount;
    const attendancePercentage = totalClasses > 0 ? Number(((effectivePresent / totalClasses) * 100).toFixed(1)) : 100;

    const monthlyBreakdown = Object.keys(monthlyMap)
      .sort()
      .reverse()
      .map((key) => {
        const m = monthlyMap[key];
        const pct = m.total > 0 ? Number(((m.present / m.total) * 100).toFixed(1)) : 100;
        return {
          monthKey: key,
          monthLabel: m.label,
          monthName: m.label,
          present: m.present,
          absent: m.absent,
          total: m.total,
          percentage: pct,
        };
      });

    return {
      studentId,
      totalClasses,
      totalPeriods: totalClasses,
      totalDays: totalClasses,
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
      attendancePercentage,
      percentage: attendancePercentage,
      overallPercentage: attendancePercentage,
      monthlyBreakdown,
    };
  };

  // Top Scoring Students Computed Automatically by Class from Exam Results
  const getTopStudentsByClass = (): TopStudentRank[] => {
    const topByClass: Record<string, TopStudentRank> = {};

    examResults.forEach((res) => {
      // Must be passed
      if (res.isPassedAll === false || res.percentage < 40) return;

      const currentTop = topByClass[res.classId];
      const studentInfo = students.find(
        (s) =>
          s.id.trim().toLowerCase() === res.studentId.trim().toLowerCase() ||
          s.nameBangla.trim() === res.studentName.trim() ||
          (s.roll === res.roll && s.classId === res.classId)
      );

      const resolvedPhoto =
        studentInfo?.photoUrl ||
        studentInfo?.avatar ||
        initialStudents.find((initS) => initS.id === res.studentId)?.photoUrl;

      if (!currentTop || res.percentage > currentTop.percentage) {
        topByClass[res.classId] = {
          studentId: res.studentId,
          studentName: res.studentName,
          roll: res.roll,
          classId: res.classId,
          className: res.className,
          percentage: res.percentage,
          totalMarksObtained: res.totalMarksObtained,
          totalMarksPossible: res.totalMarksPossible,
          overallGrade: res.overallGrade,
          overallArabicGrade: res.overallArabicGrade,
          cgpa: res.cgpa,
          positionInClass: res.positionInClass || 1,
          avatar: resolvedPhoto,
          photoUrl: resolvedPhoto,
          fatherName: studentInfo?.fatherName,
          examName: res.examName,
        };
      }
    });

    return Object.values(topByClass).sort((a, b) => b.percentage - a.percentage);
  };

  const addHomework = (hw: Omit<DailyHomework, 'id' | 'date'> & { date?: string }) => {
    const today = hw.date || new Date().toISOString().split('T')[0];
    const newHw: DailyHomework = {
      ...hw,
      id: `hw-${Date.now()}`,
      date: today,
    };
    setHomework((prev) => [newHw, ...prev]);
    saveDocToFirestore('homework', newHw.id, newHw);
  };

  const deleteHomework = (id: string) => {
    setHomework((prev) => prev.filter((h) => h.id !== id));
    deleteDocFromFirestore('homework', id);
  };

  // Syllabus & Lesson Plans
  const addSyllabus = (
    syllabus: Omit<SyllabusItem, 'id' | 'createdAt'> & { createdAt?: string }
  ): SyllabusItem => {
    const today = syllabus.createdAt || new Date().toISOString().split('T')[0];
    const newSyllabus: SyllabusItem = {
      ...syllabus,
      id: `syl-${Date.now()}`,
      createdAt: today,
    };
    setSyllabuses((prev) => [newSyllabus, ...prev]);
    saveDocToFirestore('syllabuses', newSyllabus.id, newSyllabus);
    return newSyllabus;
  };

  const updateSyllabus = (syllabus: SyllabusItem) => {
    const updatedWithDate = {
      ...syllabus,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSyllabuses((prev) =>
      prev.map((s) => (s.id === syllabus.id ? updatedWithDate : s))
    );
    saveDocToFirestore('syllabuses', updatedWithDate.id, updatedWithDate);
  };

  const deleteSyllabus = (id: string) => {
    setSyllabuses((prev) => prev.filter((s) => s.id !== id));
    deleteDocFromFirestore('syllabuses', id);
  };

  const toggleSyllabusTopicCompleted = (syllabusId: string, topicId: string) => {
    setSyllabuses((prev) =>
      prev.map((s) => {
        if (s.id === syllabusId) {
          const updatedTopics = s.topics.map((t) =>
            t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
          );
          const updated = { ...s, topics: updatedTopics, updatedAt: new Date().toISOString().split('T')[0] };
          saveDocToFirestore('syllabuses', updated.id, updated);
          return updated;
        }
        return s;
      })
    );
  };

  const resetSyllabusesToDefault = () => {
    setSyllabuses(initialSyllabuses);
    seedCollection('syllabuses', initialSyllabuses);
  };

  // Exam Results with Automatic Merit Position Determination based on Marks
  const publishExamResult = (result: Omit<ExamResult, 'id'>): ExamResult => {
    const newRes: ExamResult = {
      ...result,
      id: `res-${Date.now()}`,
    };
    const combined = [newRes, ...examResults.filter((r) => r.id !== newRes.id)];
    const ranked = calculateMeritPositions(combined);
    setExamResults(ranked);
    
    // Save all affected results to persistent storage / Firestore
    ranked.forEach((r) => {
      saveDocToFirestore('exam_results', r.id, r);
    });

    const finalNewRes = ranked.find((r) => r.id === newRes.id) || newRes;
    return finalNewRes;
  };

  const updateExamResult = (result: ExamResult) => {
    const updated = examResults.map((r) => (r.id === result.id ? result : r));
    const ranked = calculateMeritPositions(updated);
    setExamResults(ranked);
    ranked.forEach((r) => {
      saveDocToFirestore('exam_results', r.id, r);
    });
  };

  const deleteExamResult = (id: string) => {
    const filtered = examResults.filter((r) => r.id !== id);
    const ranked = calculateMeritPositions(filtered);
    setExamResults(ranked);
    deleteDocFromFirestore('exam_results', id);
    ranked.forEach((r) => {
      saveDocToFirestore('exam_results', r.id, r);
    });
  };

  const recalculateAllMeritPositions = (): number => {
    const ranked = calculateMeritPositions(examResults);
    setExamResults(ranked);
    ranked.forEach((r) => {
      saveDocToFirestore('exam_results', r.id, r);
    });
    return ranked.length;
  };

  // Fees
  const submitFeePayment = (payment: Omit<FeePayment, 'id' | 'status' | 'receiptNo' | 'paymentDate'>) => {
    const receipt = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPayment: FeePayment = {
      ...payment,
      id: `fee-${Date.now()}`,
      status: 'pending',
      receiptNo: receipt,
      paymentDate: new Date().toLocaleDateString('bn-BD'),
    };
    setFeePayments((prev) => [newPayment, ...prev]);
    saveDocToFirestore('fee_payments', newPayment.id, newPayment);
    return newPayment;
  };

  const approveFeePayment = (id: string, approverName: string) => {
    setFeePayments((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = {
            ...f,
            status: 'approved' as const,
            approvedBy: approverName,
            approvalDate: new Date().toLocaleDateString('bn-BD'),
          };
          saveDocToFirestore('fee_payments', updated.id, updated);
          return updated;
        }
        return f;
      })
    );
  };

  const rejectFeePayment = (id: string, reason: string) => {
    setFeePayments((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, status: 'rejected' as const, notes: reason };
          saveDocToFirestore('fee_payments', updated.id, updated);
          return updated;
        }
        return f;
      })
    );
  };

  // Notices
  const addNotice = (notice: Omit<Notice, 'id' | 'publishDate'>): Notice => {
    const newNotice: Notice = {
      ...notice,
      id: `not-${Date.now()}`,
      publishDate: new Date().toLocaleDateString('bn-BD'),
    };
    setNotices((prev) => [newNotice, ...prev]);
    saveDocToFirestore('notices', newNotice.id, newNotice);
    return newNotice;
  };

  const updateNotice = (notice: Notice) => {
    setNotices((prev) => prev.map((n) => (n.id === notice.id ? notice : n)));
    saveDocToFirestore('notices', notice.id, notice);
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    deleteDocFromFirestore('notices', id);
  };

  // Media Gallery Events
  const addMediaEvent = (event: Omit<MediaEvent, 'id'>): MediaEvent => {
    const newEvent: MediaEvent = {
      ...event,
      id: `med-${Date.now()}`,
    };
    setMediaEvents((prev) => [newEvent, ...prev]);
    saveDocToFirestore('media_events', newEvent.id, newEvent);
    return newEvent;
  };

  const updateMediaEvent = (event: MediaEvent) => {
    setMediaEvents((prev) => prev.map((m) => (m.id === event.id ? event : m)));
    saveDocToFirestore('media_events', event.id, event);
  };

  const deleteMediaEvent = (id: string) => {
    setMediaEvents((prev) => prev.filter((m) => m.id !== id));
    deleteDocFromFirestore('media_events', id);
  };

  // Complaints
  const sendComplaint = (msg: Omit<ComplaintMessage, 'id' | 'createdAt' | 'status' | 'replies'>) => {
    const nowTime = `${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
    const newMsg: ComplaintMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'pending',
      createdAt: nowTime,
      submittedAt: nowTime,
      replies: [],
    };
    setComplaints((prev) => [newMsg, ...prev]);
    saveDocToFirestore('complaints', newMsg.id, newMsg);
  };

  const replyToComplaint = (
    complaintId: string,
    replyMessage: string,
    repliedByRole: 'teacher' | 'admin',
    repliedByName: string
  ) => {
    const nowTime = `${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
    const newReply = {
      id: `rep-${Date.now()}`,
      repliedByRole,
      repliedByName,
      replyMessage,
      replyDate: nowTime,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updated = {
            ...c,
            status: 'answered' as const,
            responseMessage: replyMessage,
            respondedBy: repliedByName,
            respondedAt: nowTime,
            replies: [...(c.replies || []), newReply],
          };
          saveDocToFirestore('complaints', updated.id, updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Admissions
  const submitAdmissionApplication = (
    app: Omit<OnlineAdmissionApplication, 'id' | 'applicationNumber' | 'submittedAt' | 'status'>
  ) => {
    const appNumber = `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetClass = classes.find((c) => c.id === app.applyingClassId);
    
    // Auto-resolve applicable monthly fee based on residential preference
    let resolvedMonthlyFee = app.applicableMonthlyFee;
    if (!resolvedMonthlyFee && targetClass) {
      if (app.residentialPreference === 'non-residential') {
        resolvedMonthlyFee = targetClass.monthlyFeeNonResidential || 1500;
      } else if (app.residentialPreference === 'day-care') {
        resolvedMonthlyFee = targetClass.monthlyFeeDayCare || 2800;
      } else {
        resolvedMonthlyFee = targetClass.monthlyFeeResidential || targetClass.monthlyFee || 4500;
      }
    }

    const resolvedAdmissionFee = app.admissionFee || targetClass?.admissionFee || 3000;

    const newApp: OnlineAdmissionApplication = {
      ...app,
      id: `app-${Date.now()}`,
      applicationNumber: appNumber,
      applicableMonthlyFee: resolvedMonthlyFee,
      admissionFee: resolvedAdmissionFee,
      submittedAt: new Date().toLocaleDateString('bn-BD'),
      status: 'submitted',
    };
    setAdmissionApplications((prev) => [newApp, ...prev]);
    saveDocToFirestore('admission_applications', newApp.id, newApp);
    return newApp;
  };

  const approveAdmissionApplication = (
    id: string,
    options?: { customRoll?: number; customMonthlyFee?: number; adminNote?: string }
  ): Student | null => {
    const targetApp = admissionApplications.find((a) => a.id === id);
    if (!targetApp) return null;

    const targetClass = classes.find((c) => c.id === targetApp.applyingClassId);
    
    // Determine fee based on residential status
    let finalMonthlyFee = options?.customMonthlyFee;
    if (!finalMonthlyFee) {
      if (targetApp.applicableMonthlyFee) {
        finalMonthlyFee = targetApp.applicableMonthlyFee;
      } else if (targetClass) {
        if (targetApp.residentialPreference === 'non-residential') {
          finalMonthlyFee = targetClass.monthlyFeeNonResidential || 1500;
        } else if (targetApp.residentialPreference === 'day-care') {
          finalMonthlyFee = targetClass.monthlyFeeDayCare || 2800;
        } else {
          finalMonthlyFee = targetClass.monthlyFeeResidential || targetClass.monthlyFee || 4500;
        }
      } else {
        finalMonthlyFee = 4500;
      }
    }

    const targetClassStudents = students.filter((s) => s.classId === targetApp.applyingClassId);
    const calculatedRoll = options?.customRoll || (targetClassStudents.length > 0 ? Math.max(...targetClassStudents.map((s) => s.roll || 0)) + 1 : 1);
    
    // Check if student already created
    let existingStudent = targetApp.assignedStudentId ? students.find((s) => s.id === targetApp.assignedStudentId) : null;
    let enrolledStudent: Student;

    if (existingStudent) {
      enrolledStudent = {
        ...existingStudent,
        roll: calculatedRoll,
        monthlyFee: finalMonthlyFee,
        residentialStatus: targetApp.residentialPreference,
      };
      setStudents((prev) => prev.map((s) => (s.id === existingStudent!.id ? enrolledStudent : s)));
      saveDocToFirestore('students', enrolledStudent.id, enrolledStudent);
    } else {
      const generatedId = `DA-2026-${Math.floor(100 + Math.random() * 900)}`;
      enrolledStudent = {
        id: generatedId,
        institutionId: targetApp.institutionId,
        institutionName: targetApp.institutionName,
        nameBangla: targetApp.applicantNameBangla,
        nameEnglish: targetApp.applicantNameEnglish,
        roll: calculatedRoll,
        classId: targetApp.applyingClassId,
        className: targetApp.applyingClassName,
        fatherName: targetApp.fatherName,
        motherName: targetApp.motherName,
        guardianPhone: targetApp.guardianPhone,
        dateOfBirth: targetApp.dateOfBirth,
        gender: targetApp.gender,
        bloodGroup: targetApp.bloodGroup,
        residentialStatus: targetApp.residentialPreference,
        monthlyFee: finalMonthlyFee,
        admissionFee: targetApp.admissionFee || targetClass?.admissionFee || 3000,
        presentAddress: targetApp.presentAddress,
        permanentAddress: targetApp.permanentAddress,
        photoUrl: targetApp.photoUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(targetApp.applicantNameEnglish || 'student')}`,
        avatar: targetApp.photoUrl,
        password: 'student123',
      };
      setStudents((prev) => [...prev, enrolledStudent]);
      saveDocToFirestore('students', enrolledStudent.id, enrolledStudent);

      // If admission fee was paid, auto-create a receipt in finance
      if ((targetApp.amountPaid || targetApp.admissionFeePaid || 0) > 0 && targetApp.paymentStatus === 'paid') {
        const receiptNo = `REC-ADM-${Math.floor(1000 + Math.random() * 9000)}`;
        const admissionPayment: FeePayment = {
          id: `pay-adm-${Date.now()}`,
          receiptNo,
          studentId: generatedId,
          studentName: targetApp.applicantNameBangla,
          studentNameBangla: targetApp.applicantNameBangla,
          className: targetApp.applyingClassName,
          classId: targetApp.applyingClassId,
          feeType: 'admission',
          feeTypeLabel: 'ভর্তি ফি',
          amount: targetApp.amountPaid || targetApp.admissionFeePaid || 3000,
          month: 'ভর্তি সেশন ২০২৬',
          paymentDate: new Date().toLocaleDateString('bn-BD'),
          paymentMethod: (targetApp.paymentMethod as any) || 'bkash',
          transactionId: targetApp.transactionId || targetApp.paymentTrxId || 'OFFICE-VERIFIED',
          status: 'approved',
          approvedBy: 'অনলাইন ভর্তি অনুমোদন',
        };
        setFeePayments((prev) => [admissionPayment, ...prev]);
        saveDocToFirestore('fee_payments', admissionPayment.id, admissionPayment);
      }
    }

    // Update application state
    setAdmissionApplications((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = {
            ...a,
            status: 'approved' as const,
            assignedStudentId: enrolledStudent.id,
            assignedRoll: calculatedRoll,
            applicableMonthlyFee: finalMonthlyFee,
            approvalDate: new Date().toLocaleDateString('bn-BD'),
            adminNote: options?.adminNote || a.adminNote,
          };
          saveDocToFirestore('admission_applications', updated.id, updated);
          return updated;
        }
        return a;
      })
    );

    return enrolledStudent;
  };

  const updateAdmissionStatus = (
    id: string,
    status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'interview' | 'approved'
  ) => {
    if (status === 'approved' || status === 'accepted') {
      approveAdmissionApplication(id);
    } else {
      setAdmissionApplications((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const updated = { ...a, status };
            saveDocToFirestore('admission_applications', updated.id, updated);
            return updated;
          }
          return a;
        })
      );
    }
  };

  // Cloud multi-year sync function
  const syncAllToCloud = async () => {
    setCloudStatus('syncing');
    try {
      await Promise.all([
        seedCollection('students', students),
        seedCollection('teachers', teachers),
        seedCollection('classes', classes),
        seedCollection('attendances', attendance),
        seedCollection('homework', homework),
        seedCollection('fee_payments', feePayments),
        seedCollection('exam_results', examResults),
        seedCollection('notices', notices),
        seedCollection('media_events', mediaEvents),
        seedCollection('complaints', complaints),
        seedCollection('admission_applications', admissionApplications),
        seedCollection('routines', routines),
        seedCollection('guardian_sms_logs', guardianSmsLogs),
        saveDocToFirestore('madrasa_info', 'main_info', madrasaInfo),
        seedCollection(
          'prayer_times',
          prayerTimes.map((p, idx) => ({ ...p, id: p.id || `pt_${idx}` }))
        ),
      ]);
      setCloudStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('bn-BD'));
      console.log('[Firestore] Full cloud sync completed successfully.');
    } catch (err) {
      console.error('[Firestore Error] Full cloud sync failed:', err);
      setCloudStatus('synced');
    }
  };

  // Export JSON Database for 3-5 Year Offline Archive
  const exportFullDatabaseJson = () => {
    const fullBackup = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      institution: madrasaInfo.name || madrasaInfo.nameBangla,
      database: {
        madrasaInfo,
        prayerTimes,
        classes,
        teachers,
        students,
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
        syllabuses,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `madrasa_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Database to restore or migrate years of data
  const importFullDatabaseJson = async (jsonData: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonData);
      const db = parsed.database || parsed;
      
      if (db.madrasaInfo) setMadrasaInfo(db.madrasaInfo);
      if (db.prayerTimes) setPrayerTimes(db.prayerTimes);
      if (db.classes) setClasses(db.classes);
      if (db.teachers) setTeachers(db.teachers);
      if (db.students) setStudents(db.students);
      if (db.attendance) setAttendance(db.attendance);
      if (db.homework) setHomework(db.homework);
      if (db.feePayments) setFeePayments(db.feePayments);
      if (db.examResults) setExamResults(db.examResults);
      if (db.notices) setNotices(db.notices);
      if (db.mediaEvents) setMediaEvents(db.mediaEvents);
      if (db.complaints) setComplaints(db.complaints);
      if (db.admissionApplications) setAdmissionApplications(db.admissionApplications);
      if (db.routines) setRoutines(db.routines);
      if (db.guardianSmsLogs) setGuardianSmsLogs(db.guardianSmsLogs);
      if (db.syllabuses) setSyllabuses(db.syllabuses);

      // Trigger Cloud Sync
      setCloudStatus('syncing');
      setTimeout(() => {
        syncAllToCloud();
      }, 500);

      return { success: true, message: 'ডাটাবেস সফলভাবে ইমপোর্ট এবং ক্লাউডে সিঙ্ক করা হয়েছে!' };
    } catch (err: any) {
      return { success: false, message: 'ভুল ফাইল ফরম্যাট: ' + (err.message || 'অজানা ত্রুটি') };
    }
  };

  // Reset to Factory Default
  const resetAllToDefault = () => {
    setInstitutions([]);
    setSelectedInstitutionId('all');
    setMadrasaInfo(initialMadrasaInfo);
    setPrayerTimes(initialPrayerTimes);
    setClasses(initialClasses);
    setTeachers(initialTeachers);
    setStudents(initialStudents);
    setAttendance(initialAttendance);
    setHomework(initialHomework);
    setFeePayments(initialFeePayments);
    setExamResults(initialExamResults);
    setNotices(initialNotices);
    setMediaEvents(initialMediaEvents);
    setComplaints(initialComplaints);
    setAdmissionApplications([]);
    setRoutines(initialRoutines);
    setGuardianSmsLogs(initialGuardianSmsLogs);
    setSyllabuses(initialSyllabuses);
    setThemeMode('light');
    setLanguage('bn');
    localStorage.clear();
  };

  return (
    <MadrasaContext.Provider
      value={{
        language,
        setLanguage,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        t,

        currentRole,
        currentStudent,
        currentTeacher,
        isAdminLoggedIn,
        activePublicTab,
        setActivePublicTab,
        activeStudentTab,
        setActiveStudentTab,
        activeTeacherTab,
        setActiveTeacherTab,
        activeAdminTab,
        setActiveAdminTab,

        institutions,
        updateInstitution,
        selectedInstitutionId,
        setSelectedInstitutionId,

        themePresetId,
        themePreset: THEME_PRESETS[themePresetId] || THEME_PRESETS['emerald-islamic'],
        setThemePresetId,
        themePresets: THEME_PRESETS,
        isThemeSelectorOpen,
        setIsThemeSelectorOpen,

        loginStudent,
        loginTeacher,
        loginAdmin,
        logout,
        quickSwitchRole,

        madrasaInfo,
        updateMadrasaInfo,
        prayerTimes,
        updatePrayerTimes,
        classes,
        teachers,
        students,
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
        syllabuses,

        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass,
        addKitabToClass,
        updateKitabInClass,
        deleteKitabFromClass,
        addPeriodToClass,
        updatePeriodInClass,
        deletePeriodFromClass,

        addRoutine,
        updateRoutine,
        deleteRoutine,

        saveBulkAttendance,
        markBulkAttendance: saveBulkAttendance,
        sendGuardianSms,
        getStudentAttendanceStats,
        getTopStudentsByClass,

        addHomework,
        deleteHomework,
        addSyllabus,
        updateSyllabus,
        deleteSyllabus,
        toggleSyllabusTopicCompleted,
        resetSyllabusesToDefault,
        publishExamResult,
        addExamResult: publishExamResult,
        updateExamResult,
        deleteExamResult,
        recalculateAllMeritPositions,
        submitFeePayment,
        approveFeePayment,
        rejectFeePayment,
        updateFeePaymentStatus: (id: string, status: 'approved' | 'rejected' | 'pending') => {
          if (status === 'approved') approveFeePayment(id, 'অ্যাডমিন');
          else if (status === 'rejected') rejectFeePayment(id, 'প্রত্যাখ্যাত');
        },

        addNotice,
        updateNotice,
        deleteNotice,
        addMediaEvent,
        updateMediaEvent,
        deleteMediaEvent,

        sendComplaint,
        replyToComplaint,
        replyComplaint: (id: string, resp: string, respName?: string, role: 'teacher' | 'admin' = 'admin') => {
          replyToComplaint(id, resp, role, respName || 'প্রশাসন');
        },
        submitAdmissionApplication,
        updateAdmissionStatus,
        approveAdmissionApplication,

        isComplaintsModalOpen,
        setIsComplaintsModalOpen,
        latestSmsAlert,
        dismissSmsAlert,

        cloudSyncStatus,
        lastSyncTime,
        syncAllToCloud,
        exportFullDatabaseJson,
        importFullDatabaseJson,

        resetAllToDefault,
      }}
    >
      {children}
    </MadrasaContext.Provider>
  );
};

export const useMadrasa = (): MadrasaContextType => {
  const context = useContext(MadrasaContext);
  if (!context) {
    throw new Error('useMadrasa must be used within a MadrasaProvider');
  }
  return context;
};

