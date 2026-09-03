// Accurate Hijri & Gregorian dual date utilities

export const HIJRI_MONTHS_BN = [
  'মুহাররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমাদান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ্ব'
];

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah'
];

export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الثانية',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
];

export const GREGORIAN_MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const GREGORIAN_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const GREGORIAN_MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Digits conversion
export function toBnDigits(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function toArDigits(num: number | string): string {
  const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, (d) => arDigits[parseInt(d, 10)]);
}

export interface HijriDateObject {
  day: number;
  monthIndex: number; // 0-11
  year: number;
  monthNameBn: string;
  monthNameEn: string;
  monthNameAr: string;
  formattedBn: string;
  formattedEn: string;
  formattedAr: string;
}

// Convert Gregorian Date to Hijri Date (Kuwaiti algorithm + Intl fallback)
export function getHijriDate(dateInput?: Date | string | number): HijriDateObject {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } else {
    date = dateInput;
  }

  try {
    // Attempt standard Intl islamic calendar
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const dayPart = parts.find(p => p.type === 'day');
    const monthPart = parts.find(p => p.type === 'month');
    const yearPart = parts.find(p => p.type === 'year');

    if (dayPart && monthPart && yearPart) {
      const day = parseInt(dayPart.value, 10);
      const monthIndex = Math.max(0, Math.min(11, parseInt(monthPart.value, 10) - 1));
      const year = parseInt(yearPart.value, 10);

      const monthNameBn = HIJRI_MONTHS_BN[monthIndex] || 'সফর';
      const monthNameEn = HIJRI_MONTHS_EN[monthIndex] || 'Safar';
      const monthNameAr = HIJRI_MONTHS_AR[monthIndex] || 'صفر';

      return {
        day,
        monthIndex,
        year,
        monthNameBn,
        monthNameEn,
        monthNameAr,
        formattedBn: `${toBnDigits(day)} ${monthNameBn} ${toBnDigits(year)} হিজরি`,
        formattedEn: `${day} ${monthNameEn} ${year} AH`,
        formattedAr: `${toArDigits(day)} ${monthNameAr} ${toArDigits(year)} هـ`
      };
    }
  } catch {
    // Fallback algorithmic calculation if Intl Islamic is not available
  }

  // Kuwaiti algorithmic approximation
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  const z = jd - 1948439.5;
  const hy = Math.floor((30 * z + 10646) / 10631);
  const z2 = z - Math.floor((10631 * hy - 10646) / 30);
  const hm = Math.min(12, Math.ceil((z2 - 29) / 29.5) + 1);
  const hd = Math.floor(z2 - Math.floor(29.5 * (hm - 1)) + 1);

  const monthIdx = Math.max(0, Math.min(11, hm - 1));
  const hDay = Math.max(1, Math.min(30, hd));
  const hYear = hy;

  const monthNameBn = HIJRI_MONTHS_BN[monthIdx] || 'সফর';
  const monthNameEn = HIJRI_MONTHS_EN[monthIdx] || 'Safar';
  const monthNameAr = HIJRI_MONTHS_AR[monthIdx] || 'صفر';

  return {
    day: hDay,
    monthIndex: monthIdx,
    year: hYear,
    monthNameBn,
    monthNameEn,
    monthNameAr,
    formattedBn: `${toBnDigits(hDay)} ${monthNameBn} ${toBnDigits(hYear)} হিজরি`,
    formattedEn: `${hDay} ${monthNameEn} ${hYear} AH`,
    formattedAr: `${toArDigits(hDay)} ${monthNameAr} ${toArDigits(hYear)} هـ`
  };
}

// Formats both Gregorian and Hijri date in one clean string based on language
export function formatCombinedDate(
  dateInput?: Date | string | number,
  lang: 'bn' | 'en' | 'ar' = 'bn'
): { gregorian: string; hijri: string; combined: string; dayName: string } {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } else {
    date = dateInput;
  }

  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  const dayOfWeek = date.getDay();

  const hijri = getHijriDate(date);

  let gregorian = '';
  let hijriStr = '';
  let dayName = '';

  if (lang === 'bn') {
    dayName = DAYS_BN[dayOfWeek];
    gregorian = `${toBnDigits(d)} ${GREGORIAN_MONTHS_BN[m]} ${toBnDigits(y)}`;
    hijriStr = hijri.formattedBn;
  } else if (lang === 'ar') {
    dayName = DAYS_AR[dayOfWeek];
    gregorian = `${toArDigits(d)} ${GREGORIAN_MONTHS_AR[m]} ${toArDigits(y)} م`;
    hijriStr = hijri.formattedAr;
  } else {
    dayName = DAYS_EN[dayOfWeek];
    gregorian = `${d < 10 ? '0' + d : d} ${GREGORIAN_MONTHS_EN[m]} ${y}`;
    hijriStr = hijri.formattedEn;
  }

  return {
    gregorian,
    hijri: hijriStr,
    dayName,
    combined: `${gregorian} | ${hijriStr}`
  };
}

export function getHijriDateString(dateInput?: Date | string | number, lang: 'bn' | 'en' | 'ar' = 'bn'): string {
  const dateObj = getHijriDate(dateInput);
  if (lang === 'ar') return dateObj.formattedAr;
  if (lang === 'en') return dateObj.formattedEn;
  return dateObj.formattedBn;
}

export function formatDualDate(dateInput?: Date | string | number, lang: 'bn' | 'en' | 'ar' = 'bn'): string {
  return formatCombinedDate(dateInput, lang).combined;
}
