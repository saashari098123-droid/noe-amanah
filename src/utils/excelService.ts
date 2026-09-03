import * as XLSX from 'xlsx';
import { Student, Teacher, AcademicClass, ExamResult, FeePayment, Notice } from '../types';

/**
 * Download a file in the browser
 */
function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1. Generate & Download Sample Student Template for Excel
 */
export function downloadStudentTemplateExcel() {
  const sampleData = [
    {
      'Student ID (আইডি)': 'DA-2026-101',
      'Name in Bangla (বাংলায় নাম)*': 'আব্দুল্লাহ বিন উমর',
      'Name in English (ইংরেজি নাম)': 'Abdullah Bin Umar',
      'Class Code (শ্রেণি কোড)*': 'cls-madani-1',
      'Class Name (শ্রেণি নাম)': '১ম বর্ষ (উলা)',
      'Roll No (রোল নং)*': 1,
      'Year (সাল)': 2026,
      "Father's Name (পিতার নাম)": 'উমর ফারুক',
      "Mother's Name (মাতার নাম)": 'আয়েশা খাতুন',
      'Guardian Phone (অভিভাবকের ফোন)': '01711223344',
      'Residential Status (residential/day-care/non-residential)': 'residential',
      'Monthly Fee (মাসিক বেতন)': 4000,
      'Blood Group (রক্তের গ্রুপ)': 'O+',
      'Address (ঠিকানা)': 'ঢাকা, বাংলাদেশ',
      'Login Password (পাসওয়ার্ড)': 'student123',
    },
    {
      'Student ID (আইডি)': 'DA-2026-102',
      'Name in Bangla (বাংলায় নাম)*': 'মুহাম্মদ আবু বকর',
      'Name in English (ইংরেজি নাম)': 'Muhammad Abu Bakr',
      'Class Code (শ্রেণি কোড)*': 'cls-hifz-1',
      'Class Name (শ্রেণি নাম)': 'হিফজুল কুরআন বিভাগ',
      'Roll No (রোল নং)*': 2,
      'Year (সাল)': 2026,
      "Father's Name (পিতার নাম)": 'আব্দুর রহমান',
      "Mother's Name (মাতার নাম)": 'ফাতেমা বেগম',
      'Guardian Phone (অভিভাবকের ফোন)': '01811223344',
      'Residential Status (residential/day-care/non-residential)': 'residential',
      'Monthly Fee (মাসিক বেতন)': 4500,
      'Blood Group (রক্তের গ্রুপ)': 'A+',
      'Address (ঠিকানা)': 'চট্টগ্রাম, বাংলাদেশ',
      'Login Password (পাসওয়ার্ড)': 'student123',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');

  // Also append instructions sheet
  const instructionData = [
    { নির্দেশিকা: '১. তারকা (*) চিহ্নিত কলামগুলো অবশ্যই পূরণ করবেন।' },
    { নির্দেশিকা: '২. শ্রেণি কোড (Class Code) হিসেবে মাদরাসার ক্লাসের সঠিক কোড লিখুন (যেমন: cls-madani-1, cls-hifz-1)।' },
    { নির্দেশিকা: '৩. ছাত্র আইডি না দিলে স্বয়ংক্রিয়ভাবে নতুন আইডি তৈরি হবে।' },
    { নির্দেশিকা: '৪. এই এক্সেল ফাইলটি ফিল-আপ করে অ্যাডমিন প্যানেলের "এক্সেল আপলোড" বাটনে আপলোড করলেই সব ছাত্র স্বয়ংক্রিয়ভাবে ক্লাউড ডাটাবেসে যুক্ত হয়ে যাবে।' },
  ];
  const wsInst = XLSX.utils.json_to_sheet(instructionData);
  XLSX.utils.book_append_sheet(wb, wsInst, 'Instructions');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, 'madrasa_students_bulk_template.xlsx');
}

/**
 * 2. Export All Students to Excel
 */
export function exportStudentsToExcel(students: Student[], classes: AcademicClass[]) {
  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  const rows = students.map((st, idx) => ({
    'ক্রমিক নং': idx + 1,
    'ছাত্র আইডি': st.id,
    'শিক্ষার্থীর নাম (বাংলা)': st.nameBangla,
    'নাম (ইংরেজি)': st.nameEnglish || '',
    'শ্রেণি': classMap.get(st.classId) || st.className || st.classId,
    'শ্রেণি কোড': st.classId,
    'রোল নং': st.roll,
    'শিক্ষাবর্ষ': st.year || 2026,
    'পিতার নাম': st.fatherName || '',
    'মাতার নাম': st.motherName || '',
    'অভিভাবকের ফোন': st.guardianPhone || '',
    'আবাসন ধরন': st.residentialStatus === 'residential' ? 'আবাসিক' : st.residentialStatus === 'day-care' ? 'ডে-কেয়ার' : 'অনাবাসিক',
    'মাসিক বেতন (টাকা)': st.monthlyFee || 0,
    'রক্তের গ্রুপ': st.bloodGroup || '',
    'ঠিকানা': st.address || '',
    'লগইন পাসওয়ার্ড': st.password || 'student123',
    'ভর্তির তারিখ': st.admissionDate || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ছাত্র তালিকা');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `darul_amanah_students_${dateStr}.xlsx`);
}

/**
 * 3. Export Exam Results to Excel
 */
export function exportResultsToExcel(examResults: ExamResult[]) {
  const rows = examResults.map((res, idx) => {
    const subjectsStr = (res.subjects || []).map((s) => `${s.subjectName}: ${s.obtainedMarks}/${s.fullMarks}`).join(' | ');
    return {
      'ক্রমিক নং': idx + 1,
      'ফলাফল আইডি': res.id,
      'ছাত্র আইডি': res.studentId,
      'শিক্ষার্থীর নাম': res.studentName,
      'শ্রেণি': res.className,
      'পরীক্ষার নাম': res.examName,
      'রোল নং': res.roll,
      'মোট পূর্ণ নম্বর': res.totalMarksPossible,
      'প্রাপ্ত নম্বর': res.totalMarksObtained,
      'শতাংশ': `${res.percentage ? res.percentage.toFixed(1) : '0'}%`,
      'গ্রেড': res.overallGrade || '-',
      'মেধা স্থান': res.positionInClass || '-',
      'বিষয়ভিত্তিক নম্বরসমূহ': subjectsStr,
      'শিক্ষক মন্তব্য': res.generalRemarks || '',
      'প্রকাশের তারিখ': res.publishDate,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'পরীক্ষার ফলাফল');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `darul_amanah_exam_results_${dateStr}.xlsx`);
}

/**
 * 4. Export Complete Madrasa Database to Multi-Sheet Excel
 */
export function exportFullMadrasaDataToExcel(data: {
  students: Student[];
  teachers: Teacher[];
  classes: AcademicClass[];
  feePayments: FeePayment[];
  examResults: ExamResult[];
  notices: Notice[];
}) {
  const wb = XLSX.utils.book_new();

  // 1. Students
  const studentsRows = data.students.map((s) => ({
    'আইডি': s.id,
    'নাম (বাংলা)': s.nameBangla,
    'নাম (ইংরেজি)': s.nameEnglish || '',
    'শ্রেণি কোড': s.classId,
    'শ্রেণি': s.className || '',
    'রোল': s.roll,
    'পিতা': s.fatherName || '',
    'মাতা': s.motherName || '',
    'মোবাইল': s.guardianPhone || '',
    'আবাসন': s.residentialStatus || '',
    'মাসিক ফি': s.monthlyFee || 0,
    'রক্তের গ্রুপ': s.bloodGroup || '',
    'পাসওয়ার্ড': s.password || '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsRows), 'Students');

  // 2. Teachers
  const teachersRows = data.teachers.map((t) => ({
    'আইডি': t.id,
    'নাম': t.nameBangla,
    'পদবী': t.designation,
    'মোবাইল': t.phone || '',
    'ইমেইল': t.email || '',
    'শিক্ষাগত যোগ্যতা': t.qualification || '',
    'যোগদানের তারিখ': t.joiningDate || '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teachersRows), 'Teachers');

  // 3. Classes
  const classesRows = data.classes.map((c) => ({
    'কোড': c.id,
    'শ্রেণির নাম': c.name,
    'বিভাগ': c.department || '',
    'মাসিক ফি': c.monthlyFee || 0,
    'বার্ষিক ফি': c.yearlyFee || 0,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classesRows), 'Classes');

  // 4. Fee Payments
  const feeRows = data.feePayments.map((f) => ({
    'রসিদ নং': f.receiptNo || f.id,
    'ছাত্র আইডি': f.studentId,
    'ছাত্রের নাম': f.studentName,
    'শ্রেণি': f.className,
    'মাসের নাম': f.month,
    'পরিশোধিত টাকা': f.amount,
    'পেমেন্ট মেথড': f.paymentMethod,
    'ট্রানজেকশন আইডি': f.transactionId,
    'স্ট্যাটাস': f.status,
    'তারিখ': f.paymentDate,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(feeRows), 'Fee_Payments');

  // 5. Exam Results
  const resultRows = data.examResults.map((r) => ({
    'ছাত্র আইডি': r.studentId,
    'নাম': r.studentName,
    'শ্রেণি': r.className,
    'পরীক্ষা': r.examName,
    'রোল': r.roll,
    'পূর্ণ নম্বর': r.totalMarksPossible,
    'প্রাপ্ত নম্বর': r.totalMarksObtained,
    'শতাংশ': `${r.percentage ? r.percentage.toFixed(1) : '0'}%`,
    'গ্রেড': r.overallGrade || '-',
    'মেধা স্থান': r.positionInClass || '-',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resultRows), 'Exam_Results');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `darul_amanah_full_database_backup_${dateStr}.xlsx`);
}

/**
 * 5. Parse Uploaded Excel or CSV File for Students Bulk Import
 */
export async function parseStudentExcelFile(
  file: File,
  classes: AcademicClass[],
  existingStudents: Student[]
): Promise<{ success: boolean; students: Student[]; errors: string[]; stats: { added: number; updated: number } }> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, students: [], errors: ['এক্সেল ফাইলে কোনো ডাটা পাওয়া যায়নি।'], stats: { added: 0, updated: 0 } };
    }

    const errors: string[] = [];
    const parsedStudents: Student[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    const existingIdMap = new Map(existingStudents.map((s) => [s.id.toLowerCase().trim(), s]));

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2;

      // Extract field helpers (supports Bangla & English headers)
      const getValue = (...keys: string[]): string => {
        for (const k of keys) {
          for (const rowKey of Object.keys(row)) {
            if (rowKey.toLowerCase().includes(k.toLowerCase())) {
              const val = row[rowKey];
              if (val !== undefined && val !== null && String(val).trim() !== '') {
                return String(val).trim();
              }
            }
          }
        }
        return '';
      };

      const nameBn = getValue('নাম', 'name', 'bangla');
      const nameEn = getValue('english', 'name in english');
      const classKey = getValue('class code', 'শ্রেণি কোড', 'class', 'শ্রেণি');
      const rollVal = getValue('roll', 'রোল');
      const studentIdVal = getValue('student id', 'ছাত্র আইডি', 'id', 'আইডি');
      const father = getValue('father', 'পিতা');
      const mother = getValue('mother', 'মাতা');
      const phone = getValue('phone', 'mobile', 'ফোন', 'মোবাইল');
      const feeVal = getValue('fee', 'বেতন', 'মাসিক');
      const address = getValue('address', 'ঠিকানা');
      const blood = getValue('blood', 'রক্ত');
      const residence = getValue('residential', 'আবাসন', 'status');
      const password = getValue('password', 'পাসওয়ার্ড');

      if (!nameBn) {
        errors.push(`সারি ${rowNum}: শিক্ষার্থীর নাম খালি পাওয়া গেছে।`);
        return;
      }

      // Match class
      let matchedClass = classes.find(
        (c) =>
          c.id.toLowerCase() === classKey.toLowerCase() ||
          c.name.toLowerCase().includes(classKey.toLowerCase()) ||
          classKey.toLowerCase().includes(c.name.toLowerCase())
      );

      if (!matchedClass && classes.length > 0) {
        matchedClass = classes[0];
      }

      const resolvedClassId = matchedClass ? matchedClass.id : 'cls-madani-1';
      const resolvedClassName = matchedClass ? matchedClass.name : '১ম বর্ষ (উলা)';

      const rollNum = parseInt(rollVal) || parsedStudents.length + 1;
      const feeNum = parseFloat(feeVal) || (matchedClass ? matchedClass.monthlyFee : 4000);

      // Determine ID
      let finalId = studentIdVal;
      if (!finalId) {
        const nextNum = existingStudents.length + parsedStudents.length + 1;
        finalId = `DA-2026-${String(nextNum).padStart(3, '0')}`;
      }

      const isExisting = existingIdMap.has(finalId.toLowerCase().trim());
      if (isExisting) {
        updatedCount++;
      } else {
        addedCount++;
      }

      const residentialStatus: 'residential' | 'non-residential' | 'day-care' =
        residence.includes('day') || residence.includes('ডে')
          ? 'day-care'
          : residence.includes('non') || residence.includes('অনা')
          ? 'non-residential'
          : 'residential';

      const std: Student = {
        id: finalId,
        password: password || 'student123',
        nameBangla: nameBn,
        nameEnglish: nameEn || undefined,
        roll: rollNum,
        classId: resolvedClassId,
        className: resolvedClassName,
        year: 2026,
        fatherName: father || undefined,
        motherName: mother || undefined,
        guardianPhone: phone || undefined,
        residentialStatus,
        monthlyFee: feeNum,
        bloodGroup: blood || 'B+',
        address: address || undefined,
        admissionDate: new Date().toLocaleDateString('bn-BD'),
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      };

      parsedStudents.push(std);
    });

    return {
      success: parsedStudents.length > 0,
      students: parsedStudents,
      errors,
      stats: { added: addedCount, updated: updatedCount },
    };
  } catch (err: any) {
    return {
      success: false,
      students: [],
      errors: [`এক্সেল ফাইল পড়তে সমস্যা হয়েছে: ${err?.message || 'অজানা ত্রুটি'}`],
      stats: { added: 0, updated: 0 },
    };
  }
}
