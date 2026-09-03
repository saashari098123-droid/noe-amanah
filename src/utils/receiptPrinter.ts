import { FeePayment, MadrasaInfo } from '../types';

/**
 * Generates an elegant, self-contained HTML page for the money receipt
 */
export function generateReceiptHtml(
  receipt: FeePayment,
  madrasaInfo: MadrasaInfo,
  dueAmount: number = 0,
  dueNote?: string
): string {
  const receiptNo = receipt.receiptNumber || receipt.receiptNo || 'REC-' + Date.now().toString().slice(-6);
  const dateStr = receipt.paidAt || receipt.paymentDate || new Date().toLocaleDateString('bn-BD');
  const method = receipt.paymentMethod ? receipt.paymentMethod.toUpperCase() : 'CASH';
  const trxId = receipt.transactionId || 'কাউন্টার ক্যাশ';
  const amountStr = receipt.amount ? receipt.amount.toLocaleString('en-IN') : '0';
  const dueStr = dueAmount > 0 ? `৳${dueAmount.toLocaleString('en-IN')}/- ${dueNote ? `(${dueNote})` : ''}` : '৳০/- (কোনো বকেয়া নেই)';

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>মানি রসিদ - ${receiptNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Noto+Serif+Bengali:wght@400;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Noto Serif Bengali', serif, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      min-height: 100vh;
    }

    .toolbar {
      position: sticky;
      top: 10px;
      z-index: 100;
      background: #1e3a8a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
    }

    .btn {
      background: #f59e0b;
      color: #000;
      font-weight: 700;
      border: none;
      padding: 8px 18px;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn:hover {
      background: #d97706;
      color: #fff;
    }

    .btn-close {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }
    .btn-close:hover {
      background: rgba(255,255,255,0.3);
    }

    .receipt-card {
      background: #ffffff;
      width: 100%;
      max-width: 580px;
      border: 2px solid #1e3a8a;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      position: relative;
    }

    .inner-border {
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px;
    }

    .arabic-name {
      font-family: 'Amiri', serif;
      color: #1e3a8a;
      font-size: 18px;
      text-align: center;
      direction: rtl;
    }

    .bangla-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
      margin-top: 4px;
    }

    .address {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      margin-top: 2px;
    }

    .badge-title {
      background: #1e3a8a;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 16px;
      border-radius: 9999px;
      display: inline-block;
      margin: 12px auto 0;
      text-align: center;
      letter-spacing: 0.5px;
    }

    .badge-wrap {
      text-align: center;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-top: 16px;
      font-size: 12px;
    }

    .info-grid div {
      line-height: 1.5;
    }

    .label {
      color: #64748b;
    }

    .value {
      font-weight: 700;
      color: #0f172a;
    }

    .mono {
      font-family: monospace;
    }

    .details-table {
      width: 100%;
      margin-top: 16px;
      border-collapse: collapse;
      font-size: 13px;
    }

    .details-table td {
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .amount-box {
      margin-top: 16px;
      background: #ecfdf5;
      border: 1.5px solid #10b981;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      font-weight: 800;
      color: #065f46;
    }

    .amount-val {
      font-size: 20px;
      font-family: monospace;
    }

    .footer {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
      padding-top: 8px;
    }

    .signature-area {
      text-align: center;
    }

    .signature-line {
      border-top: 1px solid #475569;
      width: 130px;
      margin-bottom: 4px;
    }

    .status-stamp {
      color: #059669;
      font-weight: 700;
      font-size: 11px;
    }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .toolbar {
        display: none !important;
      }
      .receipt-card {
        box-shadow: none !important;
        border: 1.5px solid #000000 !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 20px !important;
      }
      .badge-title {
        background: #000 !important;
        color: #fff !important;
      }
      .amount-box {
        background: #ffffff !important;
        border: 1.5px solid #000000 !important;
        color: #000000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <span>মানি রসিদ প্রিন্ট প্রিভিউ</span>
    <button class="btn" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন</button>
    <button class="btn btn-close" onclick="window.close()">বন্ধ করুন</button>
  </div>

  <div class="receipt-card">
    <div class="inner-border">
      <div class="arabic-name">${madrasaInfo.nameArabic || 'دار الأمانة الإسلامية'}</div>
      <h1 class="bangla-name">${madrasaInfo.nameBangla || 'দারুল আমানাহ আল ইসলামিয়া'}</h1>
      <p class="address">${madrasaInfo.address || 'ঢাকা, বাংলাদেশ'} | মোবাঃ ${madrasaInfo.phone || ''}</p>
      
      <div class="badge-wrap">
        <div class="badge-title">টাকা আদায়ের অফিসিয়াল মানি রসিদ (MONEY RECEIPT)</div>
      </div>

      <div class="info-grid">
        <div><span class="label">রসিদ নং:</span> <span class="value mono">${receiptNo}</span></div>
        <div><span class="label">তারিখ:</span> <span class="value">${dateStr}</span></div>
        <div><span class="label">ছাত্র আইডি:</span> <span class="value mono">${receipt.studentId || 'N/A'}</span></div>
        <div><span class="label">শ্রেণি:</span> <span class="value">${receipt.className || 'সাধারণ'}</span></div>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">শিক্ষার্থীর নাম:</td>
          <td class="value" style="text-align: right;">${receipt.studentName || 'শিক্ষার্থী'}</td>
        </tr>
        <tr>
          <td class="label">পরিশোধের মাস ও বছর:</td>
          <td class="value" style="text-align: right;">${receipt.month} (${receipt.year || 2026})</td>
        </tr>
        <tr>
          <td class="label">পেমেন্ট মেথড:</td>
          <td class="value mono" style="text-align: right;">${method}</td>
        </tr>
        <tr>
          <td class="label">ট্রানজেকশন আইডি (TrxID):</td>
          <td class="value mono" style="text-align: right;">${trxId}</td>
        </tr>
        <tr>
          <td class="label">পরবর্তী বকেয়া স্থিতি (Due Balance):</td>
          <td class="value" style="text-align: right; color: ${dueAmount > 0 ? '#b91c1c' : '#059669'}; font-weight: bold;">
            ${dueStr}
          </td>
        </tr>
      </table>

      <div class="amount-box">
        <span>মোট আদায়কৃত ফি:</span>
        <span class="amount-val">৳${amountStr}/-</span>
      </div>

      <div class="footer">
        <div>
          <div class="status-stamp">✓ স্ট্যাটাস: অনুমোদিত ও জমাভুক্ত (PAID)</div>
          <div>যেকোনো তথ্যে যোগাযোগ: ${madrasaInfo.phone || ''}</div>
        </div>
        <div class="signature-area">
          <div class="signature-line"></div>
          <div>মুহতামিম / প্রধান ক্যাশিয়ার</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Auto-trigger print when loaded
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;
}

/**
 * Generates an ultra-crisp, high-resolution downloadable image (PNG) of the official receipt
 * using HTML5 Canvas. This 100% works on all phones, tablets, PCs, even within sandboxed iframes.
 */
export async function downloadReceiptImage(
  receipt: FeePayment,
  madrasaInfo: MadrasaInfo,
  dueAmount: number = 0,
  dueNote?: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1150;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e3a8a'; // Navy
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner Border
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#d97706'; // Amber/Gold
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // Top header background tint
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(30, 30, width - 60, 160);

  // Arabic Name
  ctx.font = 'bold 24px Amiri, serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.textAlign = 'center';
  ctx.fillText(madrasaInfo.nameArabic || 'دار الأمانة الإسلامية', width / 2, 75);

  // Bangla Madrasa Name
  ctx.font = 'bold 30px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(madrasaInfo.nameBangla || 'দারুল আমানাহ আল ইসলামিয়া', width / 2, 120);

  // Address & phone
  ctx.font = '16px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`${madrasaInfo.address || 'ঢাকা, বাংলাদেশ'} | যোগাযোগ: ${madrasaInfo.phone || ''}`, width / 2, 155);

  // Divider
  ctx.beginPath();
  ctx.moveTo(40, 190);
  ctx.lineTo(width - 40, 190);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Receipt Badge
  const badgeText = 'টাকা আদায়ের অফিসিয়াল মানি রসিদ (MONEY RECEIPT)';
  ctx.font = 'bold 18px "Noto Serif Bengali", serif, sans-serif';
  const badgeWidth = ctx.measureText(badgeText).width + 40;
  ctx.fillStyle = '#1e3a8a';
  roundRect(ctx, (width - badgeWidth) / 2, 215, badgeWidth, 38, 19);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, width / 2, 240);

  // Info Box (Receipt No, Date, Student ID, Class)
  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, 60, 280, width - 120, 90, 12);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '16px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('রসিদ নং:', 85, 318);
  ctx.fillText('তারিখ:', 460, 318);
  ctx.fillText('শিক্ষার্থী আইডি:', 85, 352);
  ctx.fillText('শ্রেণি:', 460, 352);

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#1e3a8a';
  const receiptNo = receipt.receiptNumber || receipt.receiptNo || 'REC-' + Date.now().toString().slice(-6);
  ctx.fillText(receiptNo, 165, 318);

  ctx.font = 'bold 16px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(receipt.paidAt || receipt.paymentDate || new Date().toLocaleDateString('bn-BD'), 520, 318);

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(receipt.studentId || 'N/A', 205, 352);

  ctx.font = 'bold 16px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillText(receipt.className || 'সাধারণ', 520, 352);

  // Payment Breakdown Table
  const rows = [
    { label: 'শিক্ষার্থীর নাম:', val: receipt.studentName || 'শিক্ষার্থী' },
    { label: 'পরিশোধের মাস ও বছর:', val: `${receipt.month} (${receipt.year || 2026})` },
    { label: 'ফি ক্যাটাগরি / বিবরণ:', val: receipt.feeTypeLabel || 'মাসিক টিউশন ও খাদ্য ফি' },
    { label: 'পরিশোধের মাধ্যম (Method):', val: (receipt.paymentMethod || 'cash').toUpperCase() },
    { label: 'ট্রানজেকশন আইডি (TrxID):', val: receipt.transactionId || 'কাউন্টার ক্যাশ' },
    {
      label: 'পরবর্তী বকেয়া স্থিতি (Due):',
      val: dueAmount > 0 ? `৳${dueAmount.toLocaleString('en-IN')}/- ${dueNote ? `(${dueNote})` : ''}` : '৳০/- (কোনো বকেয়া নেই)',
      isDue: true,
    },
  ];

  let startY = 410;
  ctx.font = '16px "Noto Serif Bengali", serif, sans-serif';
  rows.forEach((r, idx) => {
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText(r.label, 80, startY);

    if (r.isDue) {
      ctx.fillStyle = dueAmount > 0 ? '#b91c1c' : '#059669';
    } else {
      ctx.fillStyle = '#0f172a';
    }
    ctx.textAlign = 'right';
    ctx.font = idx === 3 || idx === 4 ? 'bold 16px monospace' : 'bold 16px "Noto Serif Bengali", serif, sans-serif';
    ctx.fillText(r.val, width - 80, startY);

    // Row line
    ctx.beginPath();
    ctx.moveTo(80, startY + 12);
    ctx.lineTo(width - 80, startY + 12);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.stroke();

    startY += 44;
    ctx.font = '16px "Noto Serif Bengali", serif, sans-serif';
  });

  // Highlighted Total Amount Box
  const amountBoxY = startY + 20;
  ctx.fillStyle = '#ecfdf5'; // light emerald
  roundRect(ctx, 60, amountBoxY, width - 120, 80, 14);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 20px "Noto Serif Bengali", serif, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('মোট পরিশোধিত টাকা (Paid Amount):', 85, amountBoxY + 48);

  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`৳${(receipt.amount || 0).toLocaleString('en-IN')}/-`, width - 85, amountBoxY + 50);

  // Status Stamp
  ctx.fillStyle = '#047857';
  roundRect(ctx, 80, amountBoxY + 120, 240, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Noto Serif Bengali", serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ অনুমোদিত ও আদায়কৃত (PAID)', 200, amountBoxY + 143);

  // Bottom Footer & Signature
  const footerY = height - 90;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '13px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillText(`ইলেকট্রনিক রসিদ • সফটওয়্যার জেনারেটেড`, 80, footerY);
  ctx.fillText(`মুদ্রণ তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, 80, footerY + 22);

  // Cashier / Principal Signature Line
  ctx.beginPath();
  ctx.moveTo(width - 240, footerY);
  ctx.lineTo(width - 80, footerY);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 14px "Noto Serif Bengali", serif, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('মুহতামিম / প্রধান ক্যাশিয়ার', width - 160, footerY + 24);

  // Trigger Download
  const link = document.createElement('a');
  link.download = `money_receipt_${receiptNo}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Bulletproof print function:
 * 1. Tries window.open popup (most reliable in modern browsers)
 * 2. If blocked, injects into body and executes window.print()
 * 3. Also provides instant fallback to downloadReceiptImage
 */
export async function printReceipt(
  receipt: FeePayment,
  madrasaInfo: MadrasaInfo,
  dueAmount: number = 0,
  dueNote?: string
): Promise<void> {
  // Method 1: Try window.open
  try {
    const printWindow = window.open('', '_blank', 'width=700,height=850,scrollbars=yes');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(generateReceiptHtml(receipt, madrasaInfo, dueAmount, dueNote));
      printWindow.document.close();
      printWindow.focus();
      return;
    }
  } catch (err) {
    console.warn('[ReceiptPrinter] Popup window blocked:', err);
  }

  // Method 2: In-page print portal
  try {
    let printPortal = document.getElementById('madrasa-print-portal');
    if (!printPortal) {
      printPortal = document.createElement('div');
      printPortal.id = 'madrasa-print-portal';
      document.body.appendChild(printPortal);
    }

    const receiptNo = receipt.receiptNumber || receipt.receiptNo || 'REC-' + Date.now().toString().slice(-6);
    const dateStr = receipt.paidAt || receipt.paymentDate || new Date().toLocaleDateString('bn-BD');
    const amountStr = receipt.amount ? receipt.amount.toLocaleString('en-IN') : '0';
    const dueStr = dueAmount > 0 ? `৳${dueAmount.toLocaleString('en-IN')}/- ${dueNote ? `(${dueNote})` : ''}` : '৳০/- (কোনো বকেয়া নেই)';

    printPortal.innerHTML = `
      <div style="padding: 30px; font-family: 'Noto Serif Bengali', serif, sans-serif; background: white; color: black; max-width: 600px; margin: 0 auto; border: 2px solid #1e3a8a; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="font-family: Amiri, serif; font-size: 18px; color: #1e3a8a;">${madrasaInfo.nameArabic || 'دار الأمانة الإسلامية'}</div>
          <h2 style="font-size: 22px; font-weight: bold; margin: 4px 0;">${madrasaInfo.nameBangla || 'দারুল আমানাহ আল ইসলামিয়া'}</h2>
          <div style="font-size: 12px; color: #64748b;">${madrasaInfo.address || 'ঢাকা, বাংলাদেশ'} | মোবাঃ ${madrasaInfo.phone || ''}</div>
          <div style="display: inline-block; background: #1e3a8a; color: white; padding: 4px 16px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-top: 8px;">
            টাকা আদায়ের অফিসিয়াল মানি রসিদ (MONEY RECEIPT)
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 16px;">
          <div>
            <div><strong>রসিদ নং:</strong> ${receiptNo}</div>
            <div><strong>ছাত্র আইডি:</strong> ${receipt.studentId || 'N/A'}</div>
          </div>
          <div style="text-align: right;">
            <div><strong>তারিখ:</strong> ${dateStr}</div>
            <div><strong>শ্রেণি:</strong> ${receipt.className || 'সাধারণ'}</div>
          </div>
        </div>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 16px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">শিক্ষার্থীর নাম:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${receipt.studentName || 'শিক্ষার্থী'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">পরিশোধের মাস:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${receipt.month} (${receipt.year || 2026})</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">পেমেন্ট মেথড:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${receipt.paymentMethod || 'cash'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">ট্রানজেকশন আইডি:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${receipt.transactionId || 'কাউন্টার ক্যাশ'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">পরবর্তী বকেয়া স্থিতি:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: ${dueAmount > 0 ? '#b91c1c' : '#059669'};">
              ${dueStr}
            </td>
          </tr>
        </table>
        <div style="background: #ecfdf5; border: 1.5px solid #10b981; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 16px; color: #065f46; margin-bottom: 24px;">
          <span>মোট পরিশোধিত ফি:</span>
          <span style="font-size: 22px; font-family: monospace;">৳${amountStr}/-</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; padding-top: 12px;">
          <div>
            <div style="color: #059669; font-weight: bold;">✓ স্ট্যাটাস: অনুমোদিত ও জমাভুক্ত (PAID)</div>
            <div>যোগাযোগ: ${madrasaInfo.phone || ''}</div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #475569; width: 120px; margin-bottom: 4px;"></div>
            <div>ক্যাশিয়ার / মুহতামিম</div>
          </div>
        </div>
      </div>
    `;

    window.print();
  } catch (err) {
    console.error('[ReceiptPrinter] In-page print error:', err);
    // Method 3: Guaranteed fallback to downloading high-res image
    await downloadReceiptImage(receipt, madrasaInfo, dueAmount, dueNote);
  }
}

// Helper to draw rounded rectangle on canvas
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
