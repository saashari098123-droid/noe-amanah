import { ExamResult } from '../types';

/**
 * Converts any number to Bangla digits
 */
export const toBanglaDigits = (num: number | string): string => {
  const banglaDigits: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
};

/**
 * Converts numeric rank (1, 2, 3...) into proper Bangla ordinal string
 * e.g. 1 -> ১ম, 2 -> ২য়, 3 -> ৩য়, 4 -> ৪র্থ, 5 -> ৫ম, 6 -> ৬ষ্ঠ, 11 -> ১১তম
 */
export const getOrdinalBangla = (rank: number): string => {
  if (!rank || rank <= 0) return '-';

  const ordinals: Record<number, string> = {
    1: '১ম',
    2: '২য়',
    3: '৩য়',
    4: '৪র্থ',
    5: '৫ম',
    6: '৬ষ্ঠ',
    7: '৭ম',
    8: '৮ম',
    9: '৯ম',
    10: '১০ম',
  };

  if (ordinals[rank]) {
    return ordinals[rank];
  }

  return `${toBanglaDigits(rank)}তম`;
};

/**
 * Automatically calculates and assigns positionInClass (মেধাস্থান)
 * for all exam results based on:
 * 1. Total Marks Obtained (totalMarksObtained descending)
 * 2. Percentage (percentage descending)
 * 3. CGPA (cgpa descending)
 * 4. Roll number (roll ascending as tie-breaker)
 * 
 * Grouped separately by (classId + examName or examType).
 */
export const calculateMeritPositions = (
  results: ExamResult[],
  respectManual: boolean = true
): ExamResult[] => {
  if (!results || results.length === 0) return [];

  // Group by composite key: classId + '___' + (examName || examType)
  const grouped: Record<string, ExamResult[]> = {};

  results.forEach((res) => {
    const key = `${res.classId}___${(res.examName || res.examType || 'exam').trim().toLowerCase()}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(res);
  });

  const rankedResults: ExamResult[] = [];

  Object.values(grouped).forEach((group) => {
    // Sort in place within this class and exam:
    // Highest marks first. If passedAll is defined, passed students rank ahead.
    const sorted = [...group].sort((a, b) => {
      // 1. Pass status precedence (passed students precede failed students)
      const aPassed = a.isPassedAll !== false && a.percentage >= 33;
      const bPassed = b.isPassedAll !== false && b.percentage >= 33;
      if (aPassed && !bPassed) return -1;
      if (!aPassed && bPassed) return 1;

      // 2. Total Marks Obtained (descending)
      const marksDiff = (b.totalMarksObtained || 0) - (a.totalMarksObtained || 0);
      if (marksDiff !== 0) return marksDiff;

      // 3. Percentage (descending)
      const pctDiff = (b.percentage || 0) - (a.percentage || 0);
      if (pctDiff !== 0) return pctDiff;

      // 4. CGPA (descending)
      const gpaDiff = (b.cgpa || 0) - (a.cgpa || 0);
      if (gpaDiff !== 0) return gpaDiff;

      // 5. Tie-breaker: Student roll (ascending)
      return (a.roll || 0) - (b.roll || 0);
    });

    // Assign sequential 1-based ranks
    sorted.forEach((item, index) => {
      rankedResults.push({
        ...item,
        positionInClass:
          respectManual && item.isManualPosition && item.positionInClass
            ? item.positionInClass
            : index + 1,
      });
    });
  });

  return rankedResults;
};

/**
 * Previews what rank a student would get given a new or updated total marks,
 * compared with existing classmates for the same class and exam.
 */
export const previewMeritPosition = (
  classId: string,
  examName: string,
  studentId: string,
  newMarks: number,
  allResults: ExamResult[]
): {
  predictedRank: number;
  totalCandidates: number;
  ordinalBangla: string;
  isFirst: boolean;
  isTopThree: boolean;
  betterThanCount: number;
} => {
  const normExam = (examName || '').trim().toLowerCase();
  // Filter other students in the same class and exam
  const classmates = allResults.filter(
    (r) =>
      r.classId === classId &&
      (r.examName || '').trim().toLowerCase() === normExam &&
      r.studentId !== studentId
  );

  // Count how many peers have higher marks
  const higherCount = classmates.filter((r) => (r.totalMarksObtained || 0) > newMarks).length;
  const predictedRank = higherCount + 1;
  const totalCandidates = classmates.length + 1;
  const betterThanCount = classmates.filter((r) => (r.totalMarksObtained || 0) < newMarks).length;

  return {
    predictedRank,
    totalCandidates,
    ordinalBangla: getOrdinalBangla(predictedRank),
    isFirst: predictedRank === 1,
    isTopThree: predictedRank <= 3,
    betterThanCount,
  };
};
