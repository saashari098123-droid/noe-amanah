/**
 * Ultra-reliable cross-platform printing helper
 * Supports browser popups, embedded iframes (e.g. AI Studio sandboxes), mobile, and direct window.print()
 */

export interface PrintOptions {
  title?: string;
  landscape?: boolean;
}

export function printHtmlElement(
  targetElement: HTMLElement | string,
  options: PrintOptions = {}
): void {
  const { title = 'মুদ্রণ - দারুল আমানাহ আল ইসলামিয়া', landscape = false } = options;

  const element: HTMLElement | null =
    typeof targetElement === 'string'
      ? document.getElementById(targetElement)
      : targetElement;

  if (!element) {
    console.warn('[PrintHelper] Target element not found, falling back to window.print()');
    window.print();
    return;
  }

  // Clone element to clean up any interactive or hidden UI
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print, [data-no-print="true"]').forEach((node) => node.remove());

  // Collect styles
  let stylesHtml = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  const printDocumentHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${stylesHtml}
  <style>
    @page {
      size: A4 ${landscape ? 'landscape' : 'portrait'};
      margin: 8mm 6mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Noto Serif Bengali', serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      margin: 0 !important;
      padding: 16px !important;
    }
    .no-print, [data-no-print="true"] {
      display: none !important;
    }
    table {
      border-collapse: collapse !important;
      width: 100% !important;
    }
    tr {
      page-break-inside: avoid !important;
    }
    .avoid-break-inside {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .print-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: sans-serif;
      font-size: 14px;
    }
    .print-btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    .print-btn:hover {
      background: #1d4ed8;
    }
    @media print {
      .print-toolbar {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-toolbar no-print">
    <span>🖨️ ${title}</span>
    <div>
      <button class="print-btn" onclick="window.print()">এখনই প্রিন্ট করুন (Print)</button>
      <button class="print-btn" style="background: #475569; margin-left: 8px;" onclick="window.close()">বন্ধ করুন</button>
    </div>
  </div>
  <div style="margin-top: 50px;" class="print-content-wrapper">
    ${clone.innerHTML}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.log('Auto-print triggered:', e);
        }
      }, 400);
    });
  </script>
</body>
</html>`;

  // Method 1: Try window.open (Standard modern popup window)
  try {
    const printWin = window.open('', '_blank', 'width=1050,height=900,scrollbars=yes');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printDocumentHtml);
      printWin.document.close();
      printWin.focus();
      return;
    }
  } catch (popupErr) {
    console.warn('[PrintHelper] window.open blocked by iframe or browser:', popupErr);
  }

  // Method 2: Hidden iframe printing
  try {
    let printIframe = document.getElementById('madrasa-hidden-print-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'madrasa-hidden-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);
    }

    const doc = printIframe.contentWindow?.document;
    if (doc && printIframe.contentWindow) {
      doc.open();
      doc.write(printDocumentHtml);
      doc.close();

      const cw = printIframe.contentWindow;
      setTimeout(() => {
        try {
          cw.focus();
          cw.print();
        } catch (iframeErr) {
          console.warn('[PrintHelper] Iframe print failed, falling back to window.print():', iframeErr);
          window.focus();
          window.print();
        }
      }, 350);
      return;
    }
  } catch (err) {
    console.warn('[PrintHelper] Hidden iframe error:', err);
  }

  // Method 3: Direct fallback
  window.focus();
  window.print();
}
