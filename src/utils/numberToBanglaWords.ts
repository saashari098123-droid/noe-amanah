/**
 * Converts numbers into Bengali words (টাকা কথায় রূপান্তর)
 */
export function numberToBanglaWords(num: number): string {
  const units = [
    '',
    'এক',
    'দুই',
    'তিন',
    'চার',
    'পাঁচ',
    'ছয়',
    'সাত',
    'আট',
    'নয়',
    'দশ',
    'এগারো',
    'বারো',
    'তেরো',
    'চৌদ্দ',
    'পনেরো',
    'ষোলো',
    'সতেরো',
    'আঠারো',
    'উনিশ',
  ];
  const tens = [
    '',
    '',
    'বিশ',
    'ত্রিশ',
    'চল্লিশ',
    'পঞ্চাশ',
    'ষাট',
    'সত্তর',
    'আশি',
    'নব্বই',
  ];

  if (num === 0) return 'শূন্য টাকা মাত্র';
  if (num < 0) return 'মাইনাস ' + numberToBanglaWords(Math.abs(num));

  const convertLessThanThousand = (n: number): string => {
    let result = '';
    if (n >= 100) {
      const hundredDigit = Math.floor(n / 100);
      result += units[hundredDigit] + ' শত ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        result += units[n] + ' ';
      } else {
        const tenDigit = Math.floor(n / 10);
        const unitDigit = n % 10;
        result += tens[tenDigit] + ' ';
        if (unitDigit > 0) {
          result += units[unitDigit] + ' ';
        }
      }
    }
    return result.trim();
  };

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' কোটি ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' লক্ষ ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' হাজার ';
  }
  if (num > 0) {
    words += convertLessThanThousand(num) + ' ';
  }

  return words.trim() + ' টাকা মাত্র';
}
