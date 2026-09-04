import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for base64 file payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize Gemini Client
  let ai: GoogleGenAI | null = null;
  const getAiClient = () => {
    if (!ai) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return ai;
  };

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API: AI Auto-Parse Syllabus from PDF / Image / Text
  app.post('/api/parse-syllabus', async (req, res) => {
    try {
      const { fileBase64, mimeType, rawText, classHint, subjectHint, termHint, parseDepth, customCommand } = req.body;

      if (!fileBase64 && !rawText) {
        return res.status(400).json({
          success: false,
          error: 'অনুগ্রহ করে সিলেবাসের পিডিএফ ফাইল, ছবি অথবা পাঠ্য প্রদান করুন।',
        });
      }

      const client = getAiClient();
      const parts: any[] = [];

      // If binary file provided (PDF, image, etc.)
      if (fileBase64 && mimeType) {
        // Strip data URL header if present
        const cleanBase64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
        parts.push({
          inlineData: {
            mimeType: mimeType || 'application/pdf',
            data: cleanBase64,
          },
        });
      }

      const promptText = `
আপনি কওমি (বেফাকুল মাদারিসিল আরাবিয়া, আল-হাইআতুল উলয়া), আলিয়া মাদরাসা ও ইসলামিক শিক্ষা কারিকুলামের একজন প্রথিতযশা বিশেষজ্ঞ শিক্ষক ও পাঠপরিকল্পনাকারী এআই।
আপনার কাজ হলো প্রদত্ত ডকুমেন্ট (পিডিএফ, কিতাবের সূচিপত্র, পরীক্ষার সিলেবাসের ছবি বা টেক্সট) অত্যন্ত সূক্ষ্মভাবে ও গভীরভাবে বিশ্লেষণ করে একটি আধুনিক, মানসম্মত এবং বাস্তবায়নযোগ্য অধ্যায়ভিত্তিক সিলেবাস ও পাঠপরিকল্পনা তৈরি করা।

${classHint ? `টার্গেট জামাত/শ্রেণি: ${classHint}` : ''}
${subjectHint ? `টার্গেট বিষয়/কিতাব: ${subjectHint}` : ''}
${termHint ? `টার্গেট পরীক্ষা/টার্ম: ${termHint}` : ''}
${parseDepth ? `বিশ্লেষণের গভীরতা: ${parseDepth}` : 'পূর্ণাঙ্গ বিস্তারিত বিশ্লেষণ'}
${rawText ? `অতিরিক্ত বিবরণ বা টেক্সট:\n${rawText}` : ''}
${customCommand ? `\n⚠️ শিক্ষকের বিশেষ কাস্টম নির্দেশনা / কমান্ড (অবশ্যই এটি কঠোরভাবে অনুসরণ করুন): ${customCommand}\n` : ''}

বিশেষ বিশ্লেষণ নির্দেশিকা:
১. বিষয়বস্তুর গভীর উপলব্ধি (Subject Comprehension):
   - যদি কিতাবটি আরবি ভাষা ও সাহিত্য (যেমন: এসো আরবী শিখি, আত-তারীক ইলাল আরাবিয়্যাহ, আল-বালাগাত) হয়, তবে অধ্যায়গুলোতে সংশ্লিষ্ট দরস, শব্দার্থ ভাণ্ডার, ইশারা, সিফাত-মাওসুফ, মুবতাদা-খবর, জমার, হরফে জার ও কথোপকথনের প্রায়োগিক দিক উল্লেখ করুন।
   - যদি কিতাবটি নাহব বা সরফ (যেমন: মিযান, মুনশাইব, নাহবেমীর, হেদায়াতুন্নাহু) হয়, তবে সংশ্লিষ্ট সীগাহ, বাহাস, আবওয়াব, তারকীব ও কায়েদাগুলো স্পষ্ট করুন।
   - যদি ফিকহ বা উসুল (যেমন: নূরুল ঈযাহ, কুদুরী, কানয, হেদায়া) হয়, তবে কিতাবুত তাহারাত, কিতাবুছ সালাত ইত্যাদি মাসআলা ও অনুচ্ছেদ অনুসারে সাজান।
   - যদি হিফজ/নূরানী হয়, তবে মাখরাজ, সিফাত, নূন সাকিন, মদ, পারার রুকু বা পৃষ্ঠা অনুযায়ী বিন্যাস করুন।

২. অধ্যায় বিন্যাস (Topic breakdown):
   - topicName: সুন্দর ও প্রমিত শিরোনাম (বাংলা ও আরবি উভয় ভাষায়, যেমন: "১ম অধ্যায় (الدرس الأول): পরিচিতি ও ইশারা সর্বনাম")
   - pageRangeOrChapters: পৃষ্ঠা পরিসীমা স্পষ্টভাবে লিখুন (যেমন: "পৃষ্ঠা ১ হতে ২০", "পৃষ্ঠা ২১ হতে ৪৫")
   - note: ওই অধ্যায়ে কী কী কায়েদা, শব্দার্থ, বাক্যগঠন বা অনুশীলন মুখস্থ ও তামরীন করানো হবে তার স্পষ্ট ৩-৪ লাইনের বিস্তারিত বিবরণ।
   - targetDate: ২০২৬ শিক্ষাবর্ষের মাস অনুযায়ী ক্রমান্বয়ে আনুমানিক সমাপ্তির তারিখ (যেমন: "২০২৬-০২-১৫", "২০২৬-০৩-০৫", ইত্যাদি)।
   - isCompleted: false

৩. সিলেবাসের সার্বিক কাঠামো:
   - subjectName: শুদ্ধ ও প্রাতিষ্ঠানিক নাম (যেমন: "এসো আরবী শিখি (১ম খণ্ড)", "নূরানী কায়দা ও আমপারা", "নাহবেমীর ও ব্যাকরণ")
   - kitabName: মূল কিতাব ও লেখকের নাম
   - className: উপযুক্ত জামাতের নাম (যেমন: "ইবতিদায়িয়্যাহ ১ম বর্ষ", "হিফজ বিভাগ", "মিযান", "নাহবেমীর")
   - term: "first_term" | "mid_term" | "final_term" | "annual"
   - termLabel: স্পষ্ট পরীক্ষার নাম (যেমন: "১ম সাময়িক পরীক্ষা ২০২৬")
   - totalMarks: মোট নম্বর (যেমন: ১০০)
   - passMarks: পাস নম্বর (যেমন: ৪০)
   - marksDistribution: বাস্তবসম্মত মানবন্টন (যেমন: "লিখিত ৬০ + মৌখিক ৩০ + তামরীন ও ইমলা ১০")
   - overview: শিক্ষক ও শিক্ষার্থীর জন্য ৩-৪ বাক্যে লক্ষ্য, পাঠদানের কৌশল ও বিশেষ উপদেশ।

অবশ্যই সম্পূর্ণ ভ্যালিড JSON ফরম্যাটে উত্তর দিন।`;

      parts.push({ text: promptText });

      let response;
      let retries = 3;
      let delay = 1500; // start with 1.5s delay

      while (retries > 0) {
        try {
          response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subjectName: { type: Type.STRING },
                  kitabName: { type: Type.STRING },
                  className: { type: Type.STRING },
                  term: { type: Type.STRING },
                  termLabel: { type: Type.STRING },
                  academicYear: { type: Type.NUMBER },
                  totalMarks: { type: Type.NUMBER },
                  passMarks: { type: Type.NUMBER },
                  marksDistribution: { type: Type.STRING },
                  overview: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topicName: { type: Type.STRING },
                        pageRangeOrChapters: { type: Type.STRING },
                        note: { type: Type.STRING },
                        targetDate: { type: Type.STRING },
                      },
                      required: ['topicName'],
                    },
                  },
                },
                required: ['subjectName', 'topics'],
              },
            },
          });
          break; // success
        } catch (err: any) {
          const isTransientError = err.status === 503 || err.status === 429 || err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('UNAVAILABLE');
          if (isTransientError && retries > 1) {
            retries--;
            console.warn(`Gemini API transient error, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // exponential backoff
          } else {
            throw err;
          }
        }
      }

      const responseText = response?.text || '{}';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        // Clean markdown code blocks if present
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error('Error parsing syllabus with Gemini:', error);
      
      let errorMessage = error?.message || 'সিলেবাস বিশ্লেষণ করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('429')) {
        errorMessage = 'বর্তমানে এআই সার্ভারে প্রচুর চাপ রয়েছে (503 Service Unavailable)। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
      } else if (errorMessage.toLowerCase().includes('quota')) {
        errorMessage = 'এআই ব্যবহারের কোটা (Quota) শেষ হয়ে গেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
      }

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Vite middleware setup for Development or Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Madrasa App Server running on http://localhost:${PORT}`);
  });
}

startServer();
