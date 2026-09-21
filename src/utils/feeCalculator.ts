import { FeePayment, Student, MonthCategory, Teacher, FinancialTransaction, TeacherSalaryScale } from '../types';
import { getHijriDate } from './hijriDate';

/**
 * মাদরাসা শিক্ষাবর্ষ অনুযায়ী হিজরি মাস কাঠামো (১৪৪৭ জিলকদ থেকে ১৪৪৮ রমজান)
 * বাংলাদেশের কওমি ও আলিয়া মাদরাসায় ১৪৪৭ হিজরির জিলকদে ভর্তি শুরু হয়ে ১৪৪৮ হিজরির রমজান পর্যন্ত শিক্ষাবর্ষ পরিচালিত হয়।
 */
export interface SessionMonthInfo {
  index: number;
  month: string; // e.g. "জিলকদ"
  hijriYear: number; // 1447 or 1448
  yearLabel: string; // "১৪৪৭ হিজরি" or "১৪৪৮ হিজরি"
  fullName: string; // "জিলকদ ১৪৪৭ হিজরি"
  displayMonth: string; // "জিলকদ ১৪৪৭"
  badgeNote?: string; // "ভর্তি শুরু", "নতুন বর্ষ", "চলতি মাস", "সেশন সমাপনী"
  isAdmissionStart?: boolean;
  isCurrentMonth?: boolean;
}

export const MADRASA_1447_1448_MONTHS: SessionMonthInfo[] = [
  {
    index: 0,
    month: 'জিলকদ',
    hijriYear: 1447,
    yearLabel: '১৪৪৭ হিজরি',
    fullName: 'জিলকদ ১৪৪৭ হিজরি',
    displayMonth: 'জিলকদ ১৪৪৭',
    badgeNote: 'ভর্তি শুরু ও সেশন আরম্ভ',
    isAdmissionStart: true,
  },
  {
    index: 1,
    month: 'জিলহজ্ব',
    hijriYear: 1447,
    yearLabel: '১৪৪৭ হিজরি',
    fullName: 'জিলহজ্ব ১৪৪৭ হিজরি',
    displayMonth: 'জিলহজ্ব ১৪৪৭',
  },
  {
    index: 2,
    month: 'মুহাররম',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'মুহাররম ১৪৪৮ হিজরি',
    displayMonth: 'মুহাররম ১৪৪৮',
    badgeNote: 'নতুন হিজরি বর্ষ ১৪৪৮',
  },
  {
    index: 3,
    month: 'সফর',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'সফর ১৪৪৮ হিজরি',
    displayMonth: 'সফর ১৪৪৮',
  },
  {
    index: 4,
    month: 'রবিউল আউয়াল',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'রবিউল আউয়াল ১৪৪৮ হিজরি',
    displayMonth: 'রবিউল আউয়াল ১৪৪৮',
    badgeNote: 'চলতি বর্তমান মাস',
    isCurrentMonth: true,
  },
  {
    index: 5,
    month: 'রবিউস সানী',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'রবিউস সানী ১৪৪৮ হিজরি',
    displayMonth: 'রবিউস সানী ১৪৪৮',
  },
  {
    index: 6,
    month: 'জমাদিউল আউয়াল',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'জমাদিউল আউয়াল ১৪৪৮ হিজরি',
    displayMonth: 'জমাদিউল আউয়াল ১৪৪৮',
  },
  {
    index: 7,
    month: 'জমাদিউস সানী',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'জমাদিউস সানী ১৪৪৮ হিজরি',
    displayMonth: 'জমাদিউস সানী ১৪৪৮',
  },
  {
    index: 8,
    month: 'রজব',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'রজব ১৪৪৮ হিজরি',
    displayMonth: 'রজব ১৪৪৮',
  },
  {
    index: 9,
    month: 'শাবান',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'শাবান ১৪৪৮ হিজরি',
    displayMonth: 'শাবান ১৪৪৮',
  },
  {
    index: 10,
    month: 'রমজান',
    hijriYear: 1448,
    yearLabel: '১৪৪৮ হিজরি',
    fullName: 'রমজান ১৪৪৮ হিজরি',
    displayMonth: 'রমজান ১৪৪৮',
    badgeNote: 'সেশন সমাপনী ও পরীক্ষা',
  },
];

export const MADRASA_HIJRI_MONTHS = MADRASA_1447_1448_MONTHS.map((m) => m.month);

/**
 * শিক্ষক বা উস্তাদের নির্দিষ্ট মাসের মূল হাদিয়া/বেতন গণনা (মাসভিত্তিক ইনক্রিমেন্ট ও বেতন স্কেল সাপোর্ট)
 * যেমন: জিলকদ ১৪৪৭-এ ৯,০০০ টাকা এবং মুহাররম ১৪৪৮ থেকে ১০,০০০ টাকা হলে যথোপযুক্ত স্কেল নির্ধারণ
 */
export const getTeacherBaseSalaryForMonth = (
  teacher?: Teacher | null,
  targetMonthDisplay?: string,
  paidTransaction?: FinancialTransaction | null
): number => {
  if (!teacher) return 18000;

  // ১. যদি ইতোমধ্যে উক্ত মাসের জন্য পেইড ট্রানজেকশন থাকে, তবে সেটির সংরক্ষিত মূল বেতন বা পরিমাণ প্রাধান্য পাবে
  if (paidTransaction) {
    if (paidTransaction.baseSalary && paidTransaction.baseSalary > 0) {
      return paidTransaction.baseSalary;
    }
    if (paidTransaction.amount && paidTransaction.amount > 0) {
      return paidTransaction.amount;
    }
  }

  const defaultSalary = teacher.salary || 18000;

  if (!targetMonthDisplay) {
    return defaultSalary;
  }

  // ২. যদি শিক্ষকের বেতন স্কেল হিস্ট্রি (salaryHistory) সংরক্ষিত থাকে
  if (teacher.salaryHistory && teacher.salaryHistory.length > 0) {
    const targetIdx = MADRASA_1447_1448_MONTHS.findIndex(
      (m) =>
        m.displayMonth === targetMonthDisplay ||
        targetMonthDisplay.includes(m.displayMonth) ||
        targetMonthDisplay.includes(m.fullName) ||
        m.fullName.includes(targetMonthDisplay)
    );

    if (targetIdx !== -1) {
      // স্কেলগুলোকে সেশন মাসের ইনডেক্স অনুযায়ী ক্রমানুসারে সাজাই
      const mappedScales = teacher.salaryHistory
        .map((sh) => {
          const mIdx = MADRASA_1447_1448_MONTHS.findIndex(
            (m) =>
              m.displayMonth === sh.effectiveFromMonth ||
              sh.effectiveFromMonth.includes(m.displayMonth) ||
              sh.effectiveFromMonth.includes(m.fullName) ||
              m.fullName.includes(sh.effectiveFromMonth)
          );
          return {
            ...sh,
            monthIndex: mIdx !== -1 ? mIdx : 0,
          };
        })
        .sort((a, b) => b.monthIndex - a.monthIndex); // descending (latest month first)

      // টার্গেট মাসের সমান বা আগের সর্বশেষ কার্যকর স্কেল খুঁজি
      const matchedRule = mappedScales.find((sh) => targetIdx >= sh.monthIndex);
      if (matchedRule && matchedRule.amount > 0) {
        return matchedRule.amount;
      }

      // যদি টার্গেট মাস সব স্কেলের শুরুর পূর্ববর্তী হয়, তবে প্রথম স্কেলের অংক প্রযোজ্য হবে
      const earliestRule = [...mappedScales].sort((a, b) => a.monthIndex - b.monthIndex)[0];
      if (earliestRule && earliestRule.amount > 0) {
        return earliestRule.amount;
      }
    }
  }

  return defaultSalary;
};

/**
 * সাধারণ হিজরি পঞ্জিকা ক্রম (মুহাররম থেকে জিলহজ্ব)
 */
export const CALENDAR_HIJRI_MONTHS = [
  'মুহাররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানী',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানী',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ্ব',
] as const;

// মাদরাসা শিক্ষা কার্যক্রমের জন্য ডিফল্ট হিজরি মাস ক্রম (জিলকদ ১৪৪৭ - রমজান ১৪৪৮)
export const HIJRI_MONTHS = MADRASA_HIJRI_MONTHS;

export const ENGLISH_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
] as const;

// Default alias for backwards compatibility
export const ACADEMIC_MONTHS = ENGLISH_MONTHS;

export type HijriMonthName = string;
export type EnglishMonthName = typeof ENGLISH_MONTHS[number];
export type MonthName = typeof ACADEMIC_MONTHS[number];

export const CURRENT_HIJRI_SESSION_LABEL = '১৪৪৭-১৪৪৮ হিজরি শিক্ষাবর্ষ (জিলকদ ১৪৪৭ – রমজান ১৪৪৮)';
export const CURRENT_HIJRI_SESSION_SHORT = '১৪৪৭-১৪৪৮ হিজরি';
export const CURRENT_HIJRI_YEAR = '১৪৪৭-১৪৪৮ হিজরি';
export const CURRENT_ENGLISH_YEAR = '২০২৬';

export interface AcademicSessionOption {
  id: string; // e.g. "1447-1448" or "2026"
  numericYear: number;
  label: string;
  shortLabel: string;
  isCurrent?: boolean;
}

export const AVAILABLE_HIJRI_SESSIONS: AcademicSessionOption[] = [
  {
    id: '1447-1448',
    numericYear: 1448,
    label: '১৪৪৭-১৪৪৮ হিজরি শিক্ষাবর্ষ (জিলকদ ১৪৪৭ – রমজান ১৪৪৮) [বর্তমান]',
    shortLabel: '১৪৪৭-১৪৪৮ হিজরি',
    isCurrent: true,
  },
  {
    id: '1446-1447',
    numericYear: 1447,
    label: '১৪৪৬-১৪৪৭ হিজরি শিক্ষাবর্ষ',
    shortLabel: '১৪৪৬-১৪৪৭ হিজরি',
    isCurrent: false,
  },
  {
    id: '1448-1449',
    numericYear: 1449,
    label: '১৪৪৮-১৪৪৯ হিজরি শিক্ষাবর্ষ (আসন্ন)',
    shortLabel: '১৪৪৮-১৪৪৯ হিজরি',
    isCurrent: false,
  },
];

export const AVAILABLE_HIJRI_YEARS = [1448, 1447, 1449];
export const AVAILABLE_ENGLISH_YEARS = [2026, 2025, 2027, 2028];

export interface MonthFeeStatus {
  month: string; // e.g. "জিলকদ" or "জানুয়ারি"
  displayMonth?: string; // e.g. "জিলকদ ১৪৪৭" or "জানুয়ারি ২০২৬"
  badgeNote?: string; // e.g. "ভর্তি শুরু", "নতুন বর্ষ", "চলতি মাস"
  hijriYear?: number; // 1447 or 1448
  monthWithYear: string; // e.g. "জিলকদ ১৪৪৭ হিজরি" or "জানুয়ারি ২০২৬"
  category: MonthCategory; // 'hijri' | 'english'
  status: 'paid' | 'pending' | 'due' | 'upcoming' | 'before_admission';
  statusText?: string; // e.g. "পরিশোধিত ✓", "বকেয়া বাকি ✗", "ভর্তির পূর্ববর্তী (প্রদেয় নয়)"
  amount: number;
  waivedAmount?: number; // মওকুফকৃত / বিশেষ ছাড়কৃত টাকা (যা কোনোভাবেই বকেয়া নয়)
  isWaived?: boolean; // বিশেষ ছাড় বা মওকুফ প্রযোজ্য হয়েছে কিনা
  waiverReason?: string; // মওকুফের কারণ
  payment?: FeePayment;
  isAdmissionMonth?: boolean;
}

export interface StudentFeeSummary {
  studentId: string;
  calendarType: MonthCategory;
  year: number;
  yearLabel: string;
  monthlyFee: number;
  totalPaid: number;
  totalWaived: number; // মোট ছাড় ও মওকুফকৃত অর্থ (বকেয়ামুক্ত)
  totalPending: number;
  totalDue: number; // প্রকৃত অবশিষ্ট বকেয়া (মওকুফকৃত টাকা বাদে)
  paidMonthsCount: number;
  waivedMonthsCount: number;
  dueMonthsCount: number;
  pendingMonthsCount: number;
  beforeAdmissionMonthsCount: number;
  dueMonths: string[];
  pendingMonths: string[];
  paidMonths: string[];
  waivedMonths: string[];
  monthsStatus: MonthFeeStatus[];
  hasDue: boolean;
  admissionInfo: {
    monthIndex: number;
    monthName: string;
    year: number;
    yearLabel: string;
    isMidYear: boolean;
    displayNote: string;
  };
}

/**
 * Mapping of various common Bengali spellings of Hijri months
 */
export const HIJRI_MONTH_ALIASES: Record<string, HijriMonthName> = {
  'মুহাররম': 'মুহাররম',
  'মহররম': 'মুহাররম',
  'মুহররম': 'মুহাররম',
  'সফর': 'সফর',
  'রবিউল আউয়াল': 'রবিউল আউয়াল',
  'রবিউল আউয়াল': 'রবিউল আউয়াল',
  'রবিউল আওয়াল': 'রবিউল আউয়াল',
  'রবিউস সানী': 'রবিউস সানী',
  'রবিউস সানি': 'রবিউস সানী',
  'রবিউল আখের': 'রবিউস সানী',
  'জমাদিউল আউয়াল': 'জমাদিউল আউয়াল',
  'জমাদিউল আউয়াল': 'জমাদিউল আউয়াল',
  'জুমাদাল উলা': 'জমাদিউল আউয়াল',
  'জমাদিউস সানী': 'জমাদিউস সানী',
  'জমাদিউস সানি': 'জমাদিউস সানী',
  'জুমাদাস সানিয়া': 'জমাদিউস সানী',
  'জুমাদুস সানি': 'জমাদিউস সানী',
  'রজব': 'রজব',
  'শাবান': 'শাবান',
  "শা'বান": 'শাবান',
  'শা’বান': 'শাবান',
  'রমজান': 'রমজান',
  'রমাদান': 'রমজান',
  'শাওয়াল': 'শাওয়াল',
  'শাওয়াল': 'শাওয়াল',
  'জিলকদ': 'জিলকদ',
  'জিলক্বদ': 'জিলকদ',
  'যিলকদ': 'জিলকদ',
  'যিলক্বদ': 'জিলকদ',
  'জুলকাদাহ': 'জিলকদ',
  'জুল ক্বদা': 'জিলকদ',
  'জিলহজ্ব': 'জিলহজ্ব',
  'জিলহজ্জ': 'জিলহজ্ব',
  'জিলহজ': 'জিলহজ্ব',
  'যিলহজ্ব': 'জিলহজ্ব',
  'যিলহজ্জ': 'জিলহজ্ব',
  'জুলহিজ্জা': 'জিলহজ্ব',
};

/**
 * Detects whether a month string refers to a Hijri/Arabic month or English month
 */
export function detectMonthCategory(monthStr: string): MonthCategory {
  if (!monthStr) return 'hijri';
  for (const key of Object.keys(HIJRI_MONTH_ALIASES)) {
    if (monthStr.includes(key)) {
      return 'hijri';
    }
  }
  for (const m of ENGLISH_MONTHS) {
    if (monthStr.includes(m)) {
      return 'english';
    }
  }
  return 'hijri';
}

/**
 * Normalizes month strings for comparison across both Arabic & English calendars
 */
export function normalizeMonth(monthStr: string): string {
  if (!monthStr) return '';
  const trimmed = monthStr.trim();

  // Check Hijri aliases first
  for (const [alias, canonical] of Object.entries(HIJRI_MONTH_ALIASES)) {
    if (trimmed.includes(alias)) {
      return canonical;
    }
  }

  // Check English months
  for (const m of ENGLISH_MONTHS) {
    if (trimmed.includes(m)) {
      return m;
    }
  }

  return trimmed;
}

/**
 * Returns current month index in the English calendar (0 = জানুয়ারি ... 11 = ডিসেম্বর)
 */
export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

/**
 * Returns current Hijri month index in madrasa academic calendar (1447 Zilqad to 1448 Ramadan)
 * Dynamically resolves based on the current Hijri date with safe fallback
 */
export function getCurrentHijriMonthIndex(): number {
  try {
    const hj = getHijriDate(new Date());
    const norm = normalizeMonth(hj.monthNameBn);
    // Look for exact match with hijriYear
    const foundIdx = MADRASA_1447_1448_MONTHS.findIndex(
      (m) => m.month === norm && (hj.year ? m.hijriYear === hj.year : true)
    );
    if (foundIdx !== -1) return foundIdx;
    // Fallback: match by month name only
    const fallbackIdx = MADRASA_1447_1448_MONTHS.findIndex((m) => m.month === norm);
    if (fallbackIdx !== -1) return fallbackIdx;
  } catch (_) {}
  return 4; // রবিউল আউয়াল ১৪৪৮ fallback
}

/**
 * Parses and determines student's admission month and year for accurate proration
 */
export function parseStudentAdmission(
  student: Pick<Student, 'id'> & {
    admissionDate?: string;
    admissionHijriMonth?: string;
    admissionHijriYear?: number;
    admissionEnglishMonth?: string;
    admissionEnglishYear?: number;
  },
  calendarType: MonthCategory = 'hijri'
): {
  monthIndex: number;
  monthName: string;
  year: number;
  yearLabel: string;
  isMidYear: boolean;
  displayNote: string;
} {
  if (calendarType === 'hijri') {
    let monthName = 'জিলকদ';
    let monthIndex = 0; // Default: start of session (Zilqad 1447)
    let year = student.admissionHijriYear || 1447;

    // 1. Direct admissionHijriMonth field
    if (student.admissionHijriMonth) {
      const norm = normalizeMonth(student.admissionHijriMonth);
      const foundIdx = MADRASA_1447_1448_MONTHS.findIndex((m) => m.month === norm);
      if (foundIdx !== -1) {
        monthName = norm;
        monthIndex = foundIdx;
        year = MADRASA_1447_1448_MONTHS[foundIdx].hijriYear;
      }
    } else if (student.admissionDate) {
      // 2. Search for Hijri month in admissionDate text
      const raw = student.admissionDate;
      for (const [alias, canonical] of Object.entries(HIJRI_MONTH_ALIASES)) {
        if (raw.includes(alias)) {
          const foundIdx = MADRASA_1447_1448_MONTHS.findIndex((m) => m.month === canonical);
          if (foundIdx !== -1) {
            monthName = canonical;
            monthIndex = foundIdx;
            year = MADRASA_1447_1448_MONTHS[foundIdx].hijriYear;
            break;
          }
        }
      }

      // Check if Hijri year (e.g. 1447 or 1448 or ১৪৪৭ or ১৪৪৮) is in string
      const matchedHijriYear = raw.match(/14[4-5]\d|১৪[৪-৫][০-৯]/);
      if (matchedHijriYear) {
        const engDigits = matchedHijriYear[0]
          .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
        const parsedYear = parseInt(engDigits, 10);
        if (!isNaN(parsedYear)) year = parsedYear;
      }
    }

    const isMidYear = monthIndex > 0;
    const sessionMonthObj = MADRASA_1447_1448_MONTHS[monthIndex] || MADRASA_1447_1448_MONTHS[0];
    const yearLabel = `${sessionMonthObj.hijriYear} হিজরি`;
    const displayNote = isMidYear
      ? `এই শিক্ষার্থী ১৪৪৭-১৪৪৮ হিজরি শিক্ষাবর্ষের মাঝামাঝি "${sessionMonthObj.displayMonth}" মাসে ভর্তি হয়েছেন। সুতরাং ভর্তির পূর্ববর্তী মাসসমূহের বেতন মওকুফ/প্রদেয় নয়।`
      : `১৪৪৭-১৪৪৮ হিজরি শিক্ষাবর্ষের প্রারম্ভ (জিলকদ ১৪৪৭) থেকে নিয়মিত অধ্যয়নরত।`;

    return {
      monthIndex,
      monthName,
      year: sessionMonthObj.hijriYear,
      yearLabel,
      isMidYear,
      displayNote,
    };
  } else {
    // English calendar
    let monthIndex = 0;
    let year = student.admissionEnglishYear || 2026;

    if (student.admissionEnglishMonth) {
      const idx = ENGLISH_MONTHS.indexOf(student.admissionEnglishMonth as any);
      if (idx !== -1) monthIndex = idx;
    } else if (student.admissionDate) {
      const admDate = new Date(student.admissionDate);
      if (!isNaN(admDate.getTime())) {
        monthIndex = admDate.getMonth();
        year = admDate.getFullYear();
      }
    }

    const monthName = ENGLISH_MONTHS[monthIndex];
    const isMidYear = monthIndex > 0;
    const yearLabel = `${year}`;
    const displayNote = isMidYear
      ? `এই শিক্ষার্থী ${year} সালের "${monthName}" মাসে ভর্তি হয়েছেন। ভর্তির আগের মাসসমূহে কোনো ফি প্রযোজ্য নয়।`
      : `${year} শিক্ষাবর্ষের শুরু থেকে অধ্যয়নরত।`;

    return {
      monthIndex,
      monthName,
      year,
      yearLabel,
      isMidYear,
      displayNote,
    };
  }
}

/**
 * Calculates complete fee status and dues for a given student for either Arabic or English calendar,
 * taking into account mid-year admission (e.g. admitted in Zilqad 1447 or Muharram 1448).
 */
export function calculateStudentFeeSummary(
  student: Pick<Student, 'id' | 'monthlyFee' | 'admissionFee'> & {
    admissionDate?: string;
    admissionHijriMonth?: string;
    admissionHijriYear?: number;
    admissionEnglishMonth?: string;
    admissionEnglishYear?: number;
  },
  payments: FeePayment[],
  targetMonthIndex?: number,
  calendarType: MonthCategory = 'hijri',
  targetYear?: number | string
): StudentFeeSummary {
  const monthlyRate = student.monthlyFee || 4000;
  const studentPayments = payments.filter((p) => p.studentId === student.id);

  const isHijri = calendarType === 'hijri';

  // Parse target year / session
  let resolvedYear = isHijri ? 1448 : 2026;
  if (targetYear !== undefined) {
    if (typeof targetYear === 'number') {
      resolvedYear = targetYear;
    } else {
      const digits = targetYear.replace(/[^\d০-৯]/g, '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
      const p = parseInt(digits, 10);
      if (!isNaN(p) && p > 1000) resolvedYear = p;
    }
  }

  const yearLabel = isHijri ? CURRENT_HIJRI_SESSION_LABEL : `${resolvedYear}`;

  // Current active month in academic calendar
  const resolvedTargetIndex =
    targetMonthIndex !== undefined
      ? targetMonthIndex
      : isHijri
      ? getCurrentHijriMonthIndex()
      : getCurrentMonthIndex();

  // Parse student admission details
  const admission = parseStudentAdmission(student, calendarType);

  // Determine enrollment boundaries for the selected session year
  let effectiveAdmissionMonthIndex = 0;
  let isEntireYearBeforeAdmission = false;

  if (isHijri) {
    // For the 1447-1448 session (1447 Zilqad to 1448 Ramadan):
    // If student was admitted before 1447 (e.g. 1446, 2024, etc.):
    // they are a continuing student, effective index = 0.
    // If student was admitted during this session (1447 Zilqad or later in 1448):
    effectiveAdmissionMonthIndex = admission.monthIndex;
  } else {
    if (resolvedYear < admission.year) {
      isEntireYearBeforeAdmission = true;
      effectiveAdmissionMonthIndex = 12;
    } else if (resolvedYear > admission.year) {
      effectiveAdmissionMonthIndex = 0;
    } else {
      effectiveAdmissionMonthIndex = admission.monthIndex;
    }
  }

  // Filter payments for this student
  const approvedPayments = studentPayments.filter((p) => p.status === 'approved');
  const pendingPayments = studentPayments.filter((p) => p.status === 'pending');

  const paidMonthMap = new Map<string, FeePayment>();
  approvedPayments.forEach((p) => {
    const norm = normalizeMonth(p.month);
    paidMonthMap.set(norm, p);
  });

  const pendingMonthMap = new Map<string, FeePayment>();
  pendingPayments.forEach((p) => {
    const norm = normalizeMonth(p.month);
    pendingMonthMap.set(norm, p);
  });

  const monthsStatus: MonthFeeStatus[] = [];
  const dueMonths: string[] = [];
  const pendingMonths: string[] = [];
  const paidMonths: string[] = [];
  const waivedMonths: string[] = [];
  let beforeAdmissionMonthsCount = 0;

  let totalPaid = 0;
  let totalWaived = 0;
  let totalPending = 0;
  let totalDue = 0;

  // The threshold up to which an unpaid month is considered DUE.
  const isDueThreshold = Math.max(resolvedTargetIndex, effectiveAdmissionMonthIndex);

  if (isHijri) {
    // Iterate over the 1447 Zilqad to 1448 Ramadan session months
    MADRASA_1447_1448_MONTHS.forEach((sessionMonth, idx) => {
      const monthKey = sessionMonth.month; // e.g. "জিলকদ"
      const approved = paidMonthMap.get(monthKey);
      const pending = pendingMonthMap.get(monthKey);
      const isAdmissionMonth = idx === admission.monthIndex;

      if (approved) {
        const paidAmt = approved.amount || 0;
        let waivedAmt = approved.waivedAmount ?? approved.discount ?? 0;
        if (waivedAmt === 0 && approved.isFullSettledWithWaiver && approved.originalFee) {
          waivedAmt = Math.max(0, approved.originalFee - paidAmt);
        } else if (waivedAmt === 0 && paidAmt < monthlyRate && (approved.waiverReason || approved.notes?.includes('মওকুফ') || approved.remarks?.includes('মওকুফ'))) {
          waivedAmt = Math.max(0, monthlyRate - paidAmt);
        }

        const isWaived = waivedAmt > 0;
        const statusText = isWaived
          ? `পরিশোধিত (৳${waivedAmt.toLocaleString('en-IN')} মওকুফসহ সম্পন্ন ✓)`
          : 'পরিশোধিত ✓';

        monthsStatus.push({
          month: sessionMonth.month,
          displayMonth: sessionMonth.displayMonth,
          badgeNote: sessionMonth.badgeNote,
          hijriYear: sessionMonth.hijriYear,
          monthWithYear: sessionMonth.fullName,
          category: 'hijri',
          status: 'paid',
          statusText,
          amount: paidAmt,
          waivedAmount: waivedAmt,
          isWaived,
          waiverReason: approved.waiverReason,
          payment: approved,
          isAdmissionMonth,
        });
        paidMonths.push(sessionMonth.displayMonth);
        if (isWaived) {
          waivedMonths.push(sessionMonth.displayMonth);
          totalWaived += waivedAmt;
        }
        totalPaid += paidAmt;
      } else if (pending) {
        monthsStatus.push({
          month: sessionMonth.month,
          displayMonth: sessionMonth.displayMonth,
          badgeNote: sessionMonth.badgeNote,
          hijriYear: sessionMonth.hijriYear,
          monthWithYear: sessionMonth.fullName,
          category: 'hijri',
          status: 'pending',
          statusText: 'যাচাইাধীন ⏳',
          amount: pending.amount || monthlyRate,
          payment: pending,
          isAdmissionMonth,
        });
        pendingMonths.push(sessionMonth.displayMonth);
        totalPending += pending.amount || monthlyRate;
      } else if (isEntireYearBeforeAdmission || idx < effectiveAdmissionMonthIndex) {
        monthsStatus.push({
          month: sessionMonth.month,
          displayMonth: sessionMonth.displayMonth,
          badgeNote: sessionMonth.badgeNote,
          hijriYear: sessionMonth.hijriYear,
          monthWithYear: sessionMonth.fullName,
          category: 'hijri',
          status: 'before_admission',
          statusText: 'ভর্তির পূর্ববর্তী (প্রদেয় নয়)',
          amount: monthlyRate,
        });
        beforeAdmissionMonthsCount++;
      } else if (idx <= isDueThreshold) {
        monthsStatus.push({
          month: sessionMonth.month,
          displayMonth: sessionMonth.displayMonth,
          badgeNote: sessionMonth.badgeNote,
          hijriYear: sessionMonth.hijriYear,
          monthWithYear: sessionMonth.fullName,
          category: 'hijri',
          status: 'due',
          statusText: isAdmissionMonth ? 'ভর্তি মাসের ফি বাকি ✗' : 'বকেয়া বাকি ✗',
          amount: monthlyRate,
          isAdmissionMonth,
        });
        dueMonths.push(sessionMonth.displayMonth);
        totalDue += monthlyRate;
      } else {
        monthsStatus.push({
          month: sessionMonth.month,
          displayMonth: sessionMonth.displayMonth,
          badgeNote: sessionMonth.badgeNote,
          hijriYear: sessionMonth.hijriYear,
          monthWithYear: sessionMonth.fullName,
          category: 'hijri',
          status: 'upcoming',
          statusText: 'আসন্ন মাস (অগ্রিম প্রদেয়)',
          amount: monthlyRate,
        });
      }
    });
  } else {
    // English calendar (12 months)
    ENGLISH_MONTHS.forEach((month, idx) => {
      const approved = paidMonthMap.get(month);
      const pending = pendingMonthMap.get(month);
      const isAdmissionMonth = resolvedYear === admission.year && idx === admission.monthIndex;

      if (approved) {
        const paidAmt = approved.amount || 0;
        let waivedAmt = approved.waivedAmount ?? approved.discount ?? 0;
        if (waivedAmt === 0 && approved.isFullSettledWithWaiver && approved.originalFee) {
          waivedAmt = Math.max(0, approved.originalFee - paidAmt);
        } else if (waivedAmt === 0 && paidAmt < monthlyRate && (approved.waiverReason || approved.notes?.includes('মওকুফ') || approved.remarks?.includes('মওকুফ'))) {
          waivedAmt = Math.max(0, monthlyRate - paidAmt);
        }

        const isWaived = waivedAmt > 0;
        const statusText = isWaived
          ? `পরিশোধিত (৳${waivedAmt.toLocaleString('en-IN')} মওকুফসহ সম্পন্ন ✓)`
          : 'পরিশোধিত ✓';

        monthsStatus.push({
          month,
          displayMonth: `${month} ${resolvedYear}`,
          monthWithYear: `${month} ${resolvedYear}`,
          category: 'english',
          status: 'paid',
          statusText,
          amount: paidAmt,
          waivedAmount: waivedAmt,
          isWaived,
          waiverReason: approved.waiverReason,
          payment: approved,
          isAdmissionMonth,
        });
        paidMonths.push(month);
        if (isWaived) {
          waivedMonths.push(month);
          totalWaived += waivedAmt;
        }
        totalPaid += paidAmt;
      } else if (pending) {
        monthsStatus.push({
          month,
          displayMonth: `${month} ${resolvedYear}`,
          monthWithYear: `${month} ${resolvedYear}`,
          category: 'english',
          status: 'pending',
          statusText: 'যাচাইাধীন ⏳',
          amount: pending.amount || monthlyRate,
          payment: pending,
          isAdmissionMonth,
        });
        pendingMonths.push(month);
        totalPending += pending.amount || monthlyRate;
      } else if (isEntireYearBeforeAdmission || idx < effectiveAdmissionMonthIndex) {
        monthsStatus.push({
          month,
          displayMonth: `${month} ${resolvedYear}`,
          monthWithYear: `${month} ${resolvedYear}`,
          category: 'english',
          status: 'before_admission',
          statusText: 'ভর্তির পূর্ববর্তী (প্রদেয় নয়)',
          amount: monthlyRate,
        });
        beforeAdmissionMonthsCount++;
      } else if (idx <= isDueThreshold) {
        monthsStatus.push({
          month,
          displayMonth: `${month} ${resolvedYear}`,
          monthWithYear: `${month} ${resolvedYear}`,
          category: 'english',
          status: 'due',
          statusText: isAdmissionMonth ? 'ভর্তি মাসের ফি বাকি ✗' : 'বকেয়া বাকি ✗',
          amount: monthlyRate,
          isAdmissionMonth,
        });
        dueMonths.push(month);
        totalDue += monthlyRate;
      } else {
        monthsStatus.push({
          month,
          displayMonth: `${month} ${resolvedYear}`,
          monthWithYear: `${month} ${resolvedYear}`,
          category: 'english',
          status: 'upcoming',
          statusText: 'আসন্ন মাস (অগ্রিম প্রদেয়)',
          amount: monthlyRate,
        });
      }
    });
  }

  return {
    studentId: student.id,
    calendarType,
    year: resolvedYear,
    yearLabel,
    monthlyFee: monthlyRate,
    totalPaid,
    totalWaived,
    totalPending,
    totalDue,
    paidMonthsCount: paidMonths.length,
    waivedMonthsCount: waivedMonths.length,
    dueMonthsCount: dueMonths.length,
    pendingMonthsCount: pendingMonths.length,
    beforeAdmissionMonthsCount,
    dueMonths,
    pendingMonths,
    paidMonths,
    waivedMonths,
    monthsStatus,
    hasDue: totalDue > 0,
    admissionInfo: {
      monthIndex: admission.monthIndex,
      monthName: admission.monthName,
      year: admission.year,
      yearLabel: admission.yearLabel,
      isMidYear: admission.isMidYear,
      displayNote: admission.displayNote,
    },
  };
}
