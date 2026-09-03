import { Language } from '../types';

export const translations = {
  // Navigation & General
  home: { bn: 'হোম', en: 'Home', ar: 'الرئيسية' },
  about: { bn: 'পরিচিতি', en: 'About Us', ar: 'عن المدرسة' },
  departments: { bn: 'বিভাগসমূহ', en: 'Departments', ar: 'الأقسام والبرامج' },
  routine: { bn: 'ক্লাস রুটিন', en: 'Class Routine', ar: 'جدول الحصص' },
  topStudents: { bn: 'মেধাবী শিক্ষার্থী', en: 'Top Students', ar: 'الطلاب المتفوقون' },
  admission: { bn: 'ভর্তি তথ্য', en: 'Admission', ar: 'القبول والتسجيل' },
  results: { bn: 'ফলাফল', en: 'Results', ar: 'النتائج الامتحانية' },
  notices: { bn: 'নোটিশ বোর্ড', en: 'Notice Board', ar: 'لوحة الإعلانات' },
  gallery: { bn: 'গ্যালারি', en: 'Gallery', ar: 'معرض الصور' },
  contact: { bn: 'যোগাযোগ', en: 'Contact', ar: 'اتصل بنا' },
  complaintsBox: { bn: 'অভিযোগ ও পরামর্শ বক্স', en: 'Complaints & Suggestions', ar: 'صندوق الشكاوى والمقترحات' },

  // Portals & Roles
  publicPortal: { bn: 'সাধারণ দর্শক পোর্টাল', en: 'Public Portal', ar: 'البوابة العامة' },
  studentPortal: { bn: 'ছাত্র-অভিভাবক পোর্টাল', en: 'Student & Guardian Portal', ar: 'بوابة الطالب وولي الأمر' },
  teacherPortal: { bn: 'শিক্ষক পোর্টাল', en: 'Teacher Portal', ar: 'بوابة المعلمين' },
  adminPortal: { bn: 'অ্যাডমিন প্যানেল', en: 'Admin Panel', ar: 'لوحة الإدارة' },
  login: { bn: 'লগইন', en: 'Login', ar: 'تسجيل الدخول' },
  logout: { bn: 'লগআউট', en: 'Logout', ar: 'تسجيل الخروج' },

  // Attendance & Routine
  attendance: { bn: 'হাজিরা ও উপস্থিতি', en: 'Attendance Management', ar: 'إدارة الحضور والغياب' },
  hourlyAttendance: { bn: 'ঘন্টা ভিত্তিক হাজিরা', en: 'Period-wise Hourly Attendance', ar: 'تسجيل الحضور حسب الحصص' },
  period: { bn: 'ঘন্টা / পিরিয়ড', en: 'Period / Hour', ar: 'الحصة' },
  addPeriod: { bn: 'নতুন ঘন্টা যুক্ত করুন', en: 'Add Period', ar: 'إضافة حصة جديدة' },
  attendanceHistory1Year: { bn: '১ বছরের পূর্ণাঙ্গ হাজিরা রেকর্ড', en: '1-Year Full Attendance Archive', ar: 'سجل الحضور السنوي الكامل' },
  monthlyPercentage: { bn: 'মাসিক উপস্থিতির হার', en: 'Monthly Attendance %', ar: 'نسبة الحضور الشهرية' },
  present: { bn: 'উপস্থিত', en: 'Present', ar: 'حاضر' },
  absent: { bn: 'অনুপস্থিত', en: 'Absent', ar: 'غائب' },
  late: { bn: 'দেরিতে', en: 'Late', ar: 'متأخر' },
  leave: { bn: 'ছুটি', en: 'Leave', ar: 'إجازة' },
  smsAlert: { bn: 'অভিভাবক SMS অ্যালার্ট', en: 'Guardian SMS Alert', ar: 'إشعار رسائل SMS لولي الأمر' },
  smsSentNotification: { bn: 'অনুপস্থিতির কারণে অভিভাবকের কাছে SMS পাঠানো হয়েছে', en: 'SMS sent to guardian for absence', ar: 'تم إرسال رسالة نصية لولي الأمر بسبب الغياب' },

  // Theme & Settings
  darkMode: { bn: 'ডার্ক মোড', en: 'Dark Mode', ar: 'الوضع الداكن' },
  lightMode: { bn: 'লাইট মোড', en: 'Light Mode', ar: 'الوضع الفاتح' },
  language: { bn: 'ভাষা', en: 'Language', ar: 'اللغة' },

  // Homepage Sections
  topAchieversTitle: { bn: 'প্রতি ক্লাসের শীর্ষ মেধাবী শিক্ষার্থী (টপ রেজাল্ট)', en: 'Top Scoring Students by Class (Top Results)', ar: 'أوائل الطلاب المتفوقين في كل صف' },
  topAchieversSubtitle: { bn: 'পরীক্ষার প্রাপ্ত নম্বর ও ফলাফলের ভিত্তিতে স্বয়ংক্রিয়ভাবে নির্বাচিত সেরা ছাত্রবৃন্দ', en: 'Automatically calculated top achievers based on latest exam results & marks', ar: 'نخبة الطلاب المتفوقين المحسوبة تلقائياً بناءً على أعلى درجات الامتحانات' },
  classRoutineTitle: { bn: 'ক্লাস ও ঘণ্টা ভিত্তিক সময়সূচি (রুটিন)', en: 'Class & Period Timetable Schedule', ar: 'الجدول الدراسي اليومي وتوزيع الحصص' },
  prayerTimesTitle: { bn: 'আজকের নামাজের সময়সূচি', en: 'Today\'s Prayer Times', ar: 'مواقيت الصلاة اليوم' },
  emergencyNotice: { bn: 'জরুরি নোটিশ', en: 'Emergency Notice', ar: 'إشعار عاجل' },
};

export function getTranslation(key: keyof typeof translations, lang: Language): string {
  const item = translations[key];
  if (!item) return key;
  return item[lang] || item.bn || key;
}
