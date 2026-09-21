export type UserRole = 'public' | 'student' | 'teacher' | 'admin';
export type Language = 'bn' | 'en' | 'ar';
export type ThemeMode = 'light' | 'dark';

export type InstitutionType = 'madrasa_main' | 'general_school' | 'boys_madrasa' | 'girls_madrasa' | string;

export interface InstitutionInfo {
  id: InstitutionType;
  nameBangla: string;
  nameEnglish: string;
  shortName: string;
  tagline: string;
  badge: string;
  description: string;
  grades: string;
  gender: 'co-ed' | 'boys' | 'girls';
  admissionFee: number;
  monthlyFee: number;
  features: string[];
  headName: string;
  headDesignation: string;
  phone?: string;
  photoUrl?: string;
}

export interface Student {
  id: string; // e.g. "DA-2026-101"
  password?: string; // Student password set by admin (default or custom)
  email?: string;
  phone?: string;
  avatar?: string;
  nameBangla: string;
  nameEnglish?: string;
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;
  institutionId?: InstitutionType;
  institutionName?: string;
  className: string;
  classId: string;
  roll: number;
  year?: number;
  photoUrl?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  admissionDate?: string;
  admissionHijriMonth?: string; // e.g. "জিলক্বদ", "মুহাররম"
  admissionHijriYear?: number; // e.g. 1448
  admissionEnglishMonth?: string; // e.g. "মে"
  admissionEnglishYear?: number; // e.g. 2026
  gender?: 'male' | 'female';
  monthlyFee?: number;
  monthlyDiscount?: number; // স্থায়ী মাসিক ছাড় / বিশেষ মওকুফ (টাকা)
  waiverReason?: string; // মওকুফের কারণ (যেমন: "এতিম ও অসচ্ছল কোটা", "মেধাবী বৃত্তি")
  admissionFee?: number;
  residentialStatus?: 'residential' | 'non-residential' | 'day-care'; // আবাসিক / অনাবাসিক / ডে-কেয়ার
  presentAddress?: string;
  permanentAddress?: string;
}

export interface TeacherSalaryScale {
  id: string;
  effectiveFromMonth: string; // e.g. "জিলকদ ১৪৪৭" or "মুহাররম ১৪৪৮"
  amount: number; // মাসিক নির্ধারিত হাদিয়া (টাকা)
  note?: string; // e.g. "নতুন সেশন ইনক্রিমেন্ট", "প্রাথমিক স্কেল"
  updatedAt?: string;
}

export interface Teacher {
  id: string; // e.g. "T-101"
  email: string;
  password?: string; // plain text for admin management
  nameBangla: string;
  nameEnglish?: string;
  designation: string; // e.g. "মুহাদ্দিস ও প্রধান শিক্ষক", "উস্তাদুল আসাতাজা"
  qualification?: string; // e.g. "দাওরায়ে হাদিস (মুমতাজ), তাকমীল ফি উলুমিল হাদিস"
  phone?: string;
  photoUrl?: string;
  salary?: number; // বর্তমান মাসিক নির্ধারিত হাদিয়া/বেতন (৳)
  salaryHistory?: TeacherSalaryScale[]; // মাসভিত্তিক বেতন স্কেল ও ইনক্রিমেন্ট ইতিহাস
  assignedClasses?: string[];
  assignedSubjects?: string[];
  joiningDate?: string;
  bio?: string;
}

export interface KitabSubject {
  id: string;
  name: string; // e.g. "এসো আরবি শিখি", "নাহবেমীর", "মিশকাতুল মাসাবীহ", "সহিহ বুখারি"
  subjectType: 'madani_arabic' | 'nahu_sarf' | 'hadith' | 'fiqh' | 'tafsir' | 'quran_hifz' | 'general' | 'adab' | string;
  subjectTypeLabel?: string;
  fullMarks: number; // e.g. 100
  passMarks: number; // e.g. 40
  oralMarks?: number; // e.g. 20
  writtenMarks?: number; // e.g. 80
  assignedTeacherId?: string;
  assignedTeacherName?: string;
}

export interface PeriodDefinition {
  id?: string;
  periodNumber: number; // 1, 2, 3, 4, 5, 6
  nameBangla?: string; // "১ম ঘন্টা", "২য় ঘন্টা"
  nameArabic?: string; // "الحصة الأولى"
  nameEnglish?: string; // "1st Period"
  periodName?: string;
  subjectName: string; // "বাংলা", "আরবি ব্যাকরণ (নাহু)", "হাদিস শরিফ", "গণিত"
  startTime: string; // "08:00 AM"
  endTime: string; // "08:45 AM"
  teacherId?: string;
  teacherName?: string;
  roomNo?: string;
}

export interface ClassRoutineItem {
  id: string;
  classId: string;
  className: string;
  dayOfWeek?: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | string;
  dayBangla?: string;
  dayArabic?: string;
  periodNumber: number;
  periodName: string; // e.g. "১ম ঘন্টা", "২য় ঘন্টা"
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  roomNo?: string;
}

export interface GuardianSmsLog {
  id: string;
  studentId: string;
  studentName: string;
  guardianPhone: string;
  className: string;
  periodNumber: number;
  periodName: string;
  subjectName?: string;
  date: string; // "YYYY-MM-DD"
  hijriDate?: string;
  messageText: string;
  message?: string;
  sentAt: string;
  status: 'sent' | 'delivered';
}

export interface AcademicClass {
  id: string;
  institutionId?: InstitutionType;
  institutionName?: string;
  name: string; // e.g. "ইবতিদায়িয়্যাহ ১ম বর্ষ (মাদানী নেসাব)", "হিফজুল কুরআন বিভাগ"
  nameBangla?: string;
  arabicName?: string; // e.g. "السنة الأولى الابتدائية"
  code: string;
  department: 'madani_nisab' | 'noorani' | 'hifz' | 'kitab' | 'ifta' | 'general' | string;
  departmentLabel?: string;
  yearlyFee: number;
  monthlyFee: number; // base / residential fallback
  monthlyFeeNonResidential?: number; // অনাবাসিক মাসিক বেতন
  monthlyFeeDayCare?: number; // ডে-কেয়ার মাসিক বেতন
  monthlyFeeResidential?: number; // আবাসিক মাসিক বেতন
  admissionFee?: number; // ভর্তি ফি (ডিফল্ট ৩০০০)
  description?: string;
  kitabs?: KitabSubject[]; // Kitabs / Subjects assigned to this class
  periods: PeriodDefinition[];
}

export interface AttendanceRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  hijriDate?: string;
  classId: string;
  className?: string;
  periodNumber?: number; // 1, 2, 3, 4, 5, 6
  periodName?: string; // "১ম ঘন্টা", "২য় ঘন্টা"
  subjectName?: string;
  studentId: string;
  studentName?: string;
  guardianPhone?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  smsAlertSent?: boolean;
  smsAlertText?: string;
  recordedByTeacherId?: string;
  recordedBy?: string;
  timestamp?: string;
}

export interface DailyHomework {
  id: string;
  date: string; // "YYYY-MM-DD"
  assignedDate?: string;
  classId: string;
  className: string;
  periodNumber: number;
  subjectName: string;
  teacherName: string;
  teacherId: string;
  title: string;
  description: string;
  pageNumbers?: string;
  dueDate: string;
  importantNotes?: string;
}

export type MonthCategory = 'hijri' | 'english';

export interface FeePayment {
  id: string;
  institutionId?: InstitutionType;
  institutionName?: string;
  studentId: string;
  studentName: string;
  studentNameBangla?: string;
  className: string;
  classId?: string;
  roll?: number;
  year?: number;
  feeType?: 'monthly_tuition' | 'admission' | 'exam' | 'boarding' | 'books' | 'session' | 'other' | string;
  feeTypeName?: string;
  feeTypeLabel?: string;
  month: string; // e.g. "মুহাররম ১৪৪৮" বা "মার্চ ২০২৬"
  monthCategory?: MonthCategory; // 'hijri' (আরবি মাস) | 'english' (ইংরেজি মাস)
  hijriMonth?: string;
  englishMonth?: string;
  amount: number;
  originalFee?: number; // মূল নির্ধারিত ফি (যেমন: ৪০০০ টাকা)
  discount?: number; // বিশেষ ছাড় / রিয়াত
  waivedAmount?: number; // মওকুফকৃত টাকা (যেমন: ১০০০ টাকা)
  isFullSettledWithWaiver?: boolean; // মওকুফসহ পূর্ণ নিষ্পত্তি (আর কোনো বকেয়া নেই)
  waiverReason?: string; // মওকুফের কারণ (যেমন: "আর্থিক অসচ্ছলতা", "মুহতামিম সাহেবের বিশেষ ছাড়")
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash' | string;
  transactionId: string;
  senderPhone?: string;
  paymentDate: string;
  paidAt?: string;
  status: 'approved' | 'pending' | 'rejected';
  receiptNo: string;
  receiptNumber?: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  remarks?: string;
}

export interface SubjectMarks {
  subjectName: string;
  subjectId?: string;
  fullMarks: number;
  passMarks?: number;
  writtenMarks?: number;
  oralMarks?: number;
  obtainedMarks: number;
  grade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F' | string;
  arabicGrade: 'মুমতাজ' | 'জায়্যিদ জিদ্দান' | 'জায়্যিদ' | 'মাকবুল' | 'রাসিব' | string;
  isPassed?: boolean;
  gpa: number;
  remarks?: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  roll: number;
  classId: string;
  className: string;
  year?: number;
  examType: 'first_term' | 'mid_term' | 'final_term' | 'hifz_evaluation' | string;
  examName: string; // "১ম সাময়িক পরীক্ষা ২০২৬"
  publishDate: string;
  subjects: SubjectMarks[];
  totalMarksObtained: number;
  totalMarksPossible: number;
  percentage: number;
  overallGrade: string;
  overallArabicGrade: string;
  isPassedAll?: boolean;
  failedSubjectsCount?: number;
  cgpa: number;
  positionInClass: number;
  isManualPosition?: boolean;
  generalRemarks: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'general' | 'admission' | 'exam' | 'holiday' | 'mahfil' | 'emergency' | 'academic' | 'event' | string;
  categoryLabel?: string;
  content: string;
  publishDate: string;
  isUrgent?: boolean;
  publishedBy?: string;
  publisherRole?: string;
  attachmentUrl?: string;
}

export interface MediaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'mahfil' | 'hifz' | 'competition' | 'social' | 'sports' | 'campus' | string;
  type: 'photo' | 'video';
  thumbnailUrl: string;
  mediaUrl: string; // photo url (base64/link) or video embed/youtube
  location?: string;
  albumName?: string;
}

export interface ComplaintMessage {
  id: string;
  senderRole: 'guardian' | 'student' | 'teacher' | 'admin' | string;
  senderId: string;
  senderName: string;
  senderContact?: string;
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  recipientType: 'teacher' | 'admin' | 'guardian' | string;
  recipientId?: string; // teacherId or admin
  recipientName: string;
  category: 'academics' | 'discipline' | 'boarding_food' | 'teacher_feedback' | 'suggestion' | 'fees' | 'other' | string;
  categoryLabel: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'answered';
  createdAt: string;
  submittedAt?: string;
  replies?: ComplaintReply[];
  responseMessage?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface ComplaintReply {
  id: string;
  repliedByRole: 'teacher' | 'admin';
  repliedByName: string;
  replyMessage: string;
  replyDate: string;
}

export interface OnlineAdmissionApplication {
  id: string;
  applicationNumber: string;
  institutionId?: InstitutionType;
  institutionName?: string;
  applicantNameBangla: string;
  applicantNameEnglish: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodGroup: string;
  applyingClassId: string;
  applyingClassName: string;
  residentialPreference: 'residential' | 'non-residential' | 'day-care';
  applicableMonthlyFee?: number; // আবাসন অনুযায়ী নির্ধারিত মাসিক বেতন
  admissionFee?: number; // ভর্তি ফি
  previousMadrasaOrSchool?: string;
  presentAddress: string;
  permanentAddress: string;
  shiftPreference?: 'morning' | 'day';
  versionPreference?: 'bangla' | 'english';
  paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash' | 'office' | string;
  paymentTrxId?: string;
  transactionId?: string;
  senderNumber?: string;
  admissionFeePaid?: number;
  amountPaid?: number;
  paymentStatus?: 'paid' | 'unpaid' | 'pending';
  submittedAt: string;
  photoUrl?: string;
  status: 'submitted' | 'under_review' | 'interview' | 'accepted' | 'approved' | 'rejected';
  assignedStudentId?: string; // অনুমোদনের পর বরাদ্দকৃত ছাত্র আইডি
  assignedRoll?: number; // অনুমোদনের পর নির্ধারিত শ্রেণি রোল
  approvalDate?: string;
  adminNote?: string;
}

export type ClassRoutine = ClassRoutineItem;
export type Homework = DailyHomework;
export type Complaint = ComplaintMessage;

export interface SyllabusTopic {
  id: string;
  topicName: string;
  pageRangeOrChapters?: string;
  targetDate?: string;
  isCompleted?: boolean;
  note?: string;
}

export interface SyllabusItem {
  id: string;
  classId: string;
  className: string;
  subjectName: string;
  kitabName?: string;
  term: 'first_term' | 'mid_term' | 'final_term' | 'annual' | string;
  termLabel: string;
  academicYear: number;
  totalMarks?: number;
  passMarks?: number;
  topics: SyllabusTopic[];
  overview?: string;
  marksDistribution?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: string;
  teacherId?: string;
  teacherName?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyAttendanceStat {
  monthKey: string;
  monthLabel: string;
  monthName?: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface StudentAttendanceSummary {
  studentId: string;
  totalClasses?: number;
  totalDays?: number;
  totalPeriods?: number;
  presentCount: number;
  absentCount: number;
  lateCount?: number;
  leaveCount: number;
  attendancePercentage?: number;
  percentage?: number;
  overallPercentage?: number;
  monthlyBreakdown: MonthlyAttendanceStat[];
}

export interface MadrasaInfo {
  name?: string;
  nameBangla: string;
  nameArabic: string;
  nameEnglish: string;
  establishedYear: number;
  eiinNumber: string;
  codeNumber: string;
  mottoBangla: string;
  mottoArabic: string;
  address: string;
  addressBangla?: string;
  directions?: string;
  phone: string;
  alternatePhone: string;
  hotlinePhone?: string;
  email: string;
  principalName: string;
  principalDesignation: string;
  principalMessage: string;
  principalPhotoUrl: string;
  logoUrl?: string;
  campusPhotoUrl?: string;
  aboutHistory?: string;
  aboutMission?: string;
  aboutMadaniNisab?: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  rocketNumber: string;
  bankAccountDetails: string;
  adminPassword?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
}

export interface PrayerTimeItem {
  id?: string;
  nameBangla: string;
  nameArabic: string;
  adhanTime: string;
  iqamahTime: string;
}

export type ThemePresetId = 'royal-blue' | 'clean-minimal' | 'emerald-gold' | 'oxford-crimson' | 'midnight-teal';

export interface ThemePreset {
  id: ThemePresetId;
  nameBangla: string;
  nameEnglish: string;
  tagline: string;
  primaryColorHex: string;
  accentColorHex: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  navBg: string;
  navActive: string;
  navInactive: string;
  heroBg: string;
  heroTextGradient: string;
  heroAccentBadge: string;
  ctaPrimaryBtn: string;
  ctaSecondaryBtn: string;
  cardHighlightBorder: string;
  badgeBg: string;
  footerBg: string;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'student_tuition'
  | 'admission_fee'
  | 'exam_fee'
  | 'donation_general'
  | 'zakat_fitra'
  | 'lillah_boarding'
  | 'building_development'
  | 'mahfil_collection'
  | 'book_sale'
  | 'qurbani_skin'
  | 'other_income';

export type ExpenseCategory =
  | 'teacher_salary'
  | 'staff_salary'
  | 'boarding_food'
  | 'utility_bills'
  | 'maintenance_repairs'
  | 'office_stationery'
  | 'exam_printing'
  | 'mahfil_events'
  | 'treatment_medical'
  | 'books_library'
  | 'transport'
  | 'other_expense';

export type FinancialCategory = IncomeCategory | ExpenseCategory | string;

export type PaymentAccountMethod = 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'cheque' | 'check' | string;

export interface FinancialTransaction {
  id: string;
  voucherNumber: string; // e.g. "V-2026-001"
  type: TransactionType;
  category: FinancialCategory;
  categoryLabel: string;
  title: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  hijriDate?: string;
  paymentMethod: PaymentAccountMethod;
  bankAccountOrNumber?: string;
  partyName?: string; // Payer or Payee name (e.g. "মাওলানা আব্দুল করিম", "হাজী আবুল হোসেন (দান)")
  partyPhone?: string;
  description?: string;
  recordedBy: string; // "হিসাবরক্ষক", "মুহতামিম"
  referenceId?: string; // e.g. feePayment.id or teacher.id
  isAutoGenerated?: boolean;
  notes?: string;
  createdAt: string;
  salaryMonth?: string; // e.g. "রবিউল আউয়াল ১৪৪৮"
  baseSalary?: number; // মূল হাদিয়া/বেতন
  allowanceAmount?: number; // বোনাস / ভাতা
  deductionAmount?: number; // কর্তন
}

