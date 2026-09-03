import { FeePayment, Student } from '../types';

export const ACADEMIC_MONTHS = [
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

export type MonthName = typeof ACADEMIC_MONTHS[number];

export interface MonthFeeStatus {
  month: string; // e.g. "জানুয়ারি"
  monthWithYear: string; // e.g. "জানুয়ারি ২০২৬"
  status: 'paid' | 'pending' | 'due' | 'upcoming';
  amount: number;
  payment?: FeePayment;
}

export interface StudentFeeSummary {
  studentId: string;
  monthlyFee: number;
  totalPaid: number;
  totalPending: number;
  totalDue: number;
  paidMonthsCount: number;
  dueMonthsCount: number;
  pendingMonthsCount: number;
  dueMonths: string[];
  pendingMonths: string[];
  paidMonths: string[];
  monthsStatus: MonthFeeStatus[];
  hasDue: boolean;
}

/**
 * Normalizes month strings for comparison (e.g. "জানুয়ারি ২০২৬" -> "জানুয়ারি")
 */
export function normalizeMonth(monthStr: string): string {
  if (!monthStr) return '';
  for (const m of ACADEMIC_MONTHS) {
    if (monthStr.includes(m)) {
      return m;
    }
  }
  return monthStr.trim();
}

/**
 * Returns current month index in 2026 (0 = জানুয়ারি, 8 = সেপ্টেম্বর)
 */
export function getCurrentMonthIndex(): number {
  // Current session is September 2026 (index 8)
  return 8;
}

/**
 * Calculates complete fee status and dues for a given student
 */
export function calculateStudentFeeSummary(
  student: Pick<Student, 'id' | 'monthlyFee' | 'admissionFee'>,
  payments: FeePayment[],
  targetMonthIndex: number = getCurrentMonthIndex()
): StudentFeeSummary {
  const monthlyRate = student.monthlyFee || 4000;
  const studentPayments = payments.filter((p) => p.studentId === student.id);

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

  let totalPaid = 0;
  let totalPending = 0;
  let totalDue = 0;

  ACADEMIC_MONTHS.forEach((month, idx) => {
    const approved = paidMonthMap.get(month);
    const pending = pendingMonthMap.get(month);

    if (approved) {
      monthsStatus.push({
        month,
        monthWithYear: `${month} ২০২৬`,
        status: 'paid',
        amount: approved.amount || monthlyRate,
        payment: approved,
      });
      paidMonths.push(month);
      totalPaid += approved.amount || monthlyRate;
    } else if (pending) {
      monthsStatus.push({
        month,
        monthWithYear: `${month} ২০২৬`,
        status: 'pending',
        amount: pending.amount || monthlyRate,
        payment: pending,
      });
      pendingMonths.push(month);
      totalPending += pending.amount || monthlyRate;
    } else if (idx <= targetMonthIndex) {
      // Month has arrived and is unpaid
      monthsStatus.push({
        month,
        monthWithYear: `${month} ২০২৬`,
        status: 'due',
        amount: monthlyRate,
      });
      dueMonths.push(month);
      totalDue += monthlyRate;
    } else {
      // Future month
      monthsStatus.push({
        month,
        monthWithYear: `${month} ২০২৬`,
        status: 'upcoming',
        amount: monthlyRate,
      });
    }
  });

  return {
    studentId: student.id,
    monthlyFee: monthlyRate,
    totalPaid,
    totalPending,
    totalDue,
    paidMonthsCount: paidMonths.length,
    dueMonthsCount: dueMonths.length,
    pendingMonthsCount: pendingMonths.length,
    dueMonths,
    pendingMonths,
    paidMonths,
    monthsStatus,
    hasDue: totalDue > 0,
  };
}
