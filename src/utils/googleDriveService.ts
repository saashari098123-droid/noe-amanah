import * as XLSX from 'xlsx';
import { Student, Teacher, AcademicClass, FeePayment, ExamResult, Notice } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export interface GoogleDriveAuthState {
  isConnected: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
}

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
].join(' ');

/**
 * Helper to get a Google OAuth Access Token via GSI Token Client
 */
export function requestGoogleAccessToken(customClientId?: string): Promise<{ token: string; email?: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services SDK লোড হয়নি। দয়া করে পেজটি রিফ্রেশ করুন।'));
      return;
    }

    const effectiveClientId =
      customClientId ||
      firebaseConfigData.oAuthClientId ||
      '785541846344-0ds3m2i38cit8v9e2e5l8bk35ckueutu.apps.googleusercontent.com';

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: effectiveClientId,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else if (response.access_token) {
            resolve({ token: response.access_token });
          } else {
            reject(new Error('গুগল এক্সেস টোকেন পাওয়া যায়নি।'));
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Upload an Excel or JSON backup file directly into the User's Google Drive
 */
export async function uploadBackupToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileContent: Blob | string,
  mimeType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
): Promise<{ fileId: string; webViewLink?: string }> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'দারুল আমানাহ আল ইসলামিয়া মাদরাসার সম্পূর্ণ ডাটাবেস ক্লাউড ব্যাকআপ',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', typeof fileContent === 'string' ? new Blob([fileContent], { type: mimeType }) : fileContent);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'গুগল ড্রাইভে ফাইল আপলোড করতে ব্যর্থ হয়েছে।');
  }

  const result = await response.json();
  return { fileId: result.id, webViewLink: result.webViewLink };
}

/**
 * Fetch rows from a Google Sheet given its Sheet ID / URL and Range
 */
export async function fetchGoogleSheetRows(
  accessToken: string,
  spreadsheetIdOrUrl: string,
  range: string = 'Sheet1!A1:Z500'
): Promise<any[][]> {
  // Extract clean ID from URL if user passed full URL
  let sheetId = spreadsheetIdOrUrl.trim();
  const match = spreadsheetIdOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    sheetId = match[1];
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'গুগল শিট থেকে ডাটা পড়তে ব্যর্থ হয়েছে। শিটটির শেয়ারিং পারমিশন চেক করুন।');
  }

  const data = await response.json();
  return data.values || [];
}
