import React, { useState, useMemo } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  FinancialTransaction,
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentAccountMethod,
} from '../../types';
import { exportFinanceToExcel } from '../../utils/excelService';
import { printHtmlElement } from '../../utils/printHelper';
import { MonthlyFinanceView } from './finance/MonthlyFinanceView';
import { AnnualFinanceView } from './finance/AnnualFinanceView';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  Search,
  Filter,
  Calendar,
  CalendarRange,
  FileText,
  Printer,
  Download,
  Users,
  Building,
  DollarSign,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Layers,
  Sparkles,
  Receipt,
  Eye,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  AlertCircle,
  MoreVertical,
  Moon,
  BarChart3,
} from 'lucide-react';
import {
  HIJRI_MONTHS,
  ENGLISH_MONTHS,
  CURRENT_HIJRI_YEAR,
  CURRENT_ENGLISH_YEAR,
} from '../../utils/feeCalculator';

const INCOME_CATEGORIES: { value: IncomeCategory; label: string; icon: string }[] = [
  { value: 'student_tuition', label: 'ছাত্রদের মাসিক বেতন ও বোর্ডিং ফি', icon: '🎓' },
  { value: 'admission_fee', label: 'ভর্তি ও সেশন ফি', icon: '📝' },
  { value: 'exam_fee', label: 'পরীক্ষার ফি ও খাতা বাবদ আয়', icon: '📄' },
  { value: 'donation_general', label: 'সাধারণ এককালীন অনুদান / হাদিয়া', icon: '🤲' },
  { value: 'zakat_fitra', label: 'যাকাত ও ফিতরা ফান্ড', icon: '💚' },
  { value: 'lillah_boarding', label: 'লিল্লাহ ফান্ড ও গোরাবা এতিমখানা', icon: '🍲' },
  { value: 'building_development', label: 'ভবন নির্মাণ ও মাদরাসা উন্নয়ন ফান্ড', icon: '🕌' },
  { value: 'mahfil_collection', label: 'বার্ষিক মাহফিল ও জলসা কালেকশন', icon: '📢' },
  { value: 'book_sale', label: 'কিতাব ও খাতা-কলম বিক্রি', icon: '📚' },
  { value: 'qurbani_skin', label: 'কুরবানির চামড়া ও কালেকশন', icon: '🐑' },
  { value: 'other_income', label: 'অন্যান্য বিবিধ আয়', icon: '💰' },
];

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'teacher_salary', label: 'উস্তাদ ও শিক্ষকবৃন্দের মাসিক বেতন/হাদিয়া', icon: '👥' },
  { value: 'staff_salary', label: 'কর্মচারী ও বাবুর্চি বেতন', icon: '🧑‍🍳' },
  { value: 'boarding_food', label: 'ছাত্রদের মেস ও খাবারের বাজার খরচ', icon: '🍲' },
  { value: 'utility_bills', label: 'বিদ্যুৎ, গ্যাস, ইন্টারনেট ও পানির বিল', icon: '⚡' },
  { value: 'maintenance_repairs', label: 'মেরামত ও ভবন রক্ষণাবেক্ষণ খরচ', icon: '🔧' },
  { value: 'office_stationery', label: 'অফিস স্টেশনারি ও খাতা-কলম', icon: '📝' },
  { value: 'exam_printing', label: 'পরীক্ষার প্রশ্নপত্র ছাপা ও ফলাফল শিট', icon: '🖨️' },
  { value: 'mahfil_events', label: 'মাহফিল, ইফতার ও অনুষ্ঠান খরচ', icon: '🎪' },
  { value: 'treatment_medical', label: 'ছাত্র ও উস্তাদদের চিকিৎসা সহায়তা', icon: '💊' },
  { value: 'books_library', label: 'মাদরাসা লাইব্রেরির কিতাব ক্রয়', icon: '📚' },
  { value: 'transport', label: 'যাতায়াত ও গাড়ি ভাড়া', icon: '🚗' },
  { value: 'other_expense', label: 'অন্যান্য বিবিধ খরচ', icon: '📦' },
];

const PAYMENT_METHODS: { value: PaymentAccountMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'নগদ ক্যাশ (Cash)', icon: '💵' },
  { value: 'bank', label: 'ব্যাংক একাউন্ট (Bank Transfer)', icon: '🏦' },
  { value: 'bkash', label: 'বিকাশ (bKash)', icon: '📱' },
  { value: 'nagad', label: 'নগদ (Nagad)', icon: '📲' },
  { value: 'rocket', label: 'রকেট (Rocket)', icon: '🚀' },
  { value: 'check', label: 'ব্যাংক চেক (Cheque)', icon: '📜' },
];

// Helper to convert number to Bangla words
const numberToBanglaWords = (num: number): string => {
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

  if (num === 0) return 'শূন্য টাকা মাত্র';
  if (num < 0) return 'মাইনাস ' + numberToBanglaWords(Math.abs(num));

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return tens[ten] + (unit ? ' ' + units[unit] : '');
  };

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  if (crore > 0) words += convertLessThanThousand(crore) + ' কোটি ';
  if (lakh > 0) words += convertLessThanThousand(lakh) + ' লাখ ';
  if (thousand > 0) words += convertLessThanThousand(thousand) + ' হাজার ';
  if (hundred > 0) words += units[hundred] + ' শত ';
  if (remainder > 0) words += convertLessThanThousand(remainder) + ' ';

  return words.trim() + ' টাকা মাত্র';
};

export const AdminFinance: React.FC = () => {
  const {
    madrasaInfo,
    financialTransactions,
    addFinancialTransaction,
    updateFinancialTransaction,
    deleteFinancialTransaction,
    generateBulkSalaryVouchers,
    clearAllFinancialTransactions,
    clearAllFinancialData,
    teachers,
    setActiveAdminTab,
  } = useMadrasa();

  // Top-Level Categorization: Monthly vs Annual vs All Ledger
  const [financeMode, setFinanceMode] = useState<'monthly' | 'annual' | 'ledger'>('monthly');

  // Navigation & Subtabs (for ledger view)
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'salaries' | 'analytics' | 'statement'>('all');

  // Clear all modal state
  const [isClearAllFinanceOpen, setIsClearAllFinanceOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'this_month' | 'last_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [modalType, setModalType] = useState<TransactionType>('income');

  // Voucher / Receipt Print Modal
  const [selectedVoucher, setSelectedVoucher] = useState<FinancialTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Bulk Salary Modal (Support both Hijri and English, default Hijri per custom)
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isFinanceMoreOpen, setIsFinanceMoreOpen] = useState(false);
  const [salaryMonthCategory, setSalaryMonthCategory] = useState<'hijri' | 'english'>('hijri');
  const [salaryMonth, setSalaryMonth] = useState(`মুহাররম ${CURRENT_HIJRI_YEAR}`);
  const [salarySuccessMsg, setSalarySuccessMsg] = useState('');

  // Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'student_tuition',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as PaymentAccountMethod,
    bankAccountOrNumber: '',
    partyName: '',
    partyPhone: '',
    description: '',
    recordedBy: 'হিসাব শাখা',
    voucherNumber: '',
  });

  // Calculate Overall Financial Statistics
  const totalIncome = useMemo(() => {
    return financialTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [financialTransactions]);

  const totalExpense = useMemo(() => {
    return financialTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [financialTransactions]);

  const netBalance = totalIncome - totalExpense;

  // Current Month Stats
  const currentMonthYearPrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-02"
  const thisMonthIncome = useMemo(() => {
    return financialTransactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonthYearPrefix))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [financialTransactions, currentMonthYearPrefix]);

  const thisMonthExpense = useMemo(() => {
    return financialTransactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthYearPrefix))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [financialTransactions, currentMonthYearPrefix]);

  const thisMonthBalance = thisMonthIncome - thisMonthExpense;

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter((txn) => {
      // Subtab Type Filter
      if (activeTab === 'income' && txn.type !== 'income') return false;
      if (activeTab === 'expense' && txn.type !== 'expense') return false;
      if (activeTab === 'salaries' && txn.category !== 'teacher_salary' && txn.category !== 'staff_salary') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = txn.title.toLowerCase().includes(q);
        const matchParty = (txn.partyName || '').toLowerCase().includes(q);
        const matchVoucher = (txn.voucherNumber || '').toLowerCase().includes(q);
        const matchDesc = (txn.description || '').toLowerCase().includes(q);
        const matchCategory = (txn.categoryLabel || '').toLowerCase().includes(q);
        if (!matchTitle && !matchParty && !matchVoucher && !matchDesc && !matchCategory) {
          return false;
        }
      }

      // Category Filter
      if (categoryFilter !== 'all' && txn.category !== categoryFilter) {
        return false;
      }

      // Payment Method Filter
      if (paymentMethodFilter !== 'all' && txn.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      // Time Filter
      if (timeFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (txn.date !== today) return false;
      } else if (timeFilter === 'this_month') {
        if (!txn.date.startsWith(currentMonthYearPrefix)) return false;
      } else if (timeFilter === 'last_month') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonthPrefix = d.toISOString().slice(0, 7);
        if (!txn.date.startsWith(lastMonthPrefix)) return false;
      } else if (timeFilter === 'custom') {
        if (customStartDate && txn.date < customStartDate) return false;
        if (customEndDate && txn.date > customEndDate) return false;
      }

      return true;
    });
  }, [
    financialTransactions,
    activeTab,
    searchQuery,
    categoryFilter,
    paymentMethodFilter,
    timeFilter,
    currentMonthYearPrefix,
    customStartDate,
    customEndDate,
  ]);

  // Income Category Breakdown
  const incomeByCategory = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number; icon: string }> = {};
    INCOME_CATEGORIES.forEach((c) => {
      map[c.value] = { label: c.label, amount: 0, count: 0, icon: c.icon };
    });

    financialTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        if (!map[t.category]) {
          map[t.category] = { label: t.categoryLabel || t.category, amount: 0, count: 0, icon: '💰' };
        }
        map[t.category].amount += Number(t.amount) || 0;
        map[t.category].count += 1;
      });

    return Object.entries(map)
      .map(([key, data]) => ({ key, ...data }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [financialTransactions]);

  // Expense Category Breakdown
  const expenseByCategory = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number; icon: string }> = {};
    EXPENSE_CATEGORIES.forEach((c) => {
      map[c.value] = { label: c.label, amount: 0, count: 0, icon: c.icon };
    });

    financialTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!map[t.category]) {
          map[t.category] = { label: t.categoryLabel || t.category, amount: 0, count: 0, icon: '📦' };
        }
        map[t.category].amount += Number(t.amount) || 0;
        map[t.category].count += 1;
      });

    return Object.entries(map)
      .map(([key, data]) => ({ key, ...data }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [financialTransactions]);

  // Open Modal for New Transaction
  const handleOpenAddModal = (type: TransactionType) => {
    setEditingTransaction(null);
    setModalType(type);
    const prefix = type === 'income' ? 'VR' : 'VP';
    const randNum = Math.floor(100000 + Math.random() * 900000);
    setFormData({
      title: '',
      category: type === 'income' ? 'student_tuition' : 'teacher_salary',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      bankAccountOrNumber: '',
      partyName: '',
      partyPhone: '',
      description: '',
      recordedBy: 'হিসাব শাখা',
      voucherNumber: `${prefix}-${randNum}`,
    });
    setIsAddEditModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEditModal = (txn: FinancialTransaction) => {
    setEditingTransaction(txn);
    setModalType(txn.type);
    setFormData({
      title: txn.title,
      category: txn.category,
      amount: txn.amount.toString(),
      date: txn.date,
      paymentMethod: txn.paymentMethod,
      bankAccountOrNumber: txn.bankAccountOrNumber || '',
      partyName: txn.partyName || '',
      partyPhone: txn.partyPhone || '',
      description: txn.description || '',
      recordedBy: txn.recordedBy || 'হিসাব শাখা',
      voucherNumber: txn.voucherNumber || '',
    });
    setIsAddEditModalOpen(true);
  };

  // Save Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) {
      alert('অনুগ্রহ করে সঠিক শিরোনাম ও টাকার পরিমাণ প্রদান করুন।');
      return;
    }

    const categoryList = modalType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const matchedCat = categoryList.find((c) => c.value === formData.category);
    const categoryLabel = matchedCat ? matchedCat.label : formData.category;

    if (editingTransaction) {
      const updated: FinancialTransaction = {
        ...editingTransaction,
        type: modalType,
        category: formData.category as any,
        categoryLabel,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        bankAccountOrNumber: formData.bankAccountOrNumber.trim() || undefined,
        partyName: formData.partyName.trim() || undefined,
        partyPhone: formData.partyPhone.trim() || undefined,
        description: formData.description.trim() || undefined,
        recordedBy: formData.recordedBy.trim() || 'হিসাব শাখা',
        voucherNumber: formData.voucherNumber.trim() || undefined,
      };
      updateFinancialTransaction(updated);
    } else {
      addFinancialTransaction({
        type: modalType,
        category: formData.category as any,
        categoryLabel,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        bankAccountOrNumber: formData.bankAccountOrNumber.trim() || undefined,
        partyName: formData.partyName.trim() || undefined,
        partyPhone: formData.partyPhone.trim() || undefined,
        description: formData.description.trim() || undefined,
        recordedBy: formData.recordedBy.trim() || 'হিসাব শাখা',
        voucherNumber: formData.voucherNumber.trim() || undefined,
      });
    }

    setIsAddEditModalOpen(false);
  };

  // Handle Bulk Teacher Salary
  const handleBulkSalaryGenerate = () => {
    if (!generateBulkSalaryVouchers) return;
    const count = generateBulkSalaryVouchers(salaryMonth);
    if (count > 0) {
      setSalarySuccessMsg(`আলহামদুলিল্লাহ! মোট ${count} জন উস্তাদের ${salaryMonth} মাসের বেতন ভাউচার সফলভাবে তৈরি হয়েছে।`);
      setTimeout(() => {
        setIsSalaryModalOpen(false);
        setSalarySuccessMsg('');
      }, 2500);
    } else {
      setSalarySuccessMsg(`এই মাসের (${salaryMonth}) সকল উস্তাদের বেতন ভাউচার ইতোমধ্যে তৈরি করা আছে।`);
    }
  };

  // Open Voucher Print Modal
  const handleViewVoucher = (txn: FinancialTransaction) => {
    setSelectedVoucher(txn);
    setIsReceiptModalOpen(true);
  };

  // Print Statement / Screen
  const handlePrintStatement = () => {
    printHtmlElement('finance-monthly-statement-card', { title: 'আর্থিক বিবরণী ও তহবিল স্থিতি প্রতিবেদন - দারুল আমানাহ' });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP CATEGORY / MODE SELECTOR (মাসিক হিসাব vs পুরো বছরের হিসাব vs দৈনিক ভাউচার) */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFinanceMode('monthly')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              financeMode === 'monthly'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>১. মাসিক হিসাব (Monthly Statement)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                financeMode === 'monthly' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              মাসভিত্তিক
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFinanceMode('annual')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              financeMode === 'annual'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-950/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>২. পুরো বছরের হিসাব (Full Year / Annual Audit)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                financeMode === 'annual' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              ১২ মাসের ছক
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFinanceMode('ledger')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              financeMode === 'ledger'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>৩. দৈনিক ভাউচার ও সকল লেনদেন</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                financeMode === 'ledger' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {financialTransactions.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveAdminTab('teacher_salaries')}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer border border-amber-200"
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>উস্তাদদের হাদিয়া পোর্টাল</span>
          </button>
        </div>
      </div>

      {/* RENDER CATEGORY 1: MONTHLY FINANCE VIEW */}
      {financeMode === 'monthly' && (
        <MonthlyFinanceView
          transactions={financialTransactions}
          madrasaInfo={madrasaInfo}
          onOpenAddModal={handleOpenAddModal}
          onViewVoucher={(txn) => {
            setSelectedVoucher(txn);
            setIsReceiptModalOpen(true);
          }}
          onOpenEditModal={handleOpenEditModal}
          onDeleteTransaction={(id) => setDeleteConfirmId(id)}
        />
      )}

      {/* RENDER CATEGORY 2: ANNUAL / FULL YEAR FINANCE VIEW */}
      {financeMode === 'annual' && (
        <AnnualFinanceView
          transactions={financialTransactions}
          madrasaInfo={madrasaInfo}
          onSelectMonthForDetailedView={(mIdx, yr) => {
            setFinanceMode('monthly');
          }}
        />
      )}

      {/* RENDER CATEGORY 3: DAILY VOUCHERS & COMPLETE MASTER LEDGER */}
      {financeMode === 'ledger' && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Background Islamic Pattern Accent */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>মাদরাসা হিসাব বিভাগ ও আর্থিক স্বচ্ছতা ড্যাশবোর্ড</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>আয়-ব্যয় হিসাব ও ফান্ড ড্যাশবোর্ড</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              ছাত্রদের বেতন ও লিল্লাহ-যাকাত ফান্ড থেকে শুরু করে উস্তাদদের হাদিয়া, মেস ও অবকাঠামোগত প্রতিটি খরচের নিখুঁত ক্যাশ মেমো, ডেবিট/ক্রেডিট ভাউচার ও অডিট রিপোর্ট পরিচালনা করুন।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="admin-add-income-btn"
              onClick={() => handleOpenAddModal('income')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-emerald-400/40"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>+ নতুন আয়</span>
            </button>

            <button
              id="admin-add-expense-btn"
              onClick={() => handleOpenAddModal('expense')}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-rose-950/40 transition flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-rose-400/40"
            >
              <MinusCircle className="w-4 h-4 text-rose-200" />
              <span>- নতুন ব্যয়</span>
            </button>

            {/* Three-Dot Menu for Salary, Excel, and Print Statement */}
            <div className="relative">
              <button
                id="admin-finance-more-btn"
                onClick={() => setIsFinanceMoreOpen((prev) => !prev)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                title="বেতন ভাউচার ও অন্যান্য রিপোর্ট"
              >
                <MoreVertical className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">অপশন ও রিপোর্ট</span>
              </button>

              {isFinanceMoreOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFinanceMoreOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-slate-100 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1.5 text-xs animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setIsFinanceMoreOpen(false);
                        setActiveAdminTab('teacher_salaries');
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-emerald-950/70 text-emerald-300 transition text-left cursor-pointer border border-emerald-800/40"
                    >
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white">১৪৪৭-১৪৪৮ সেশন হাদিয়া পোর্টাল</div>
                        <div className="text-[11px] text-emerald-300">শিক্ষকভিত্তিক বেতন স্লিপ ও মাসভিত্তিক রেজিস্টার</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsSalaryModalOpen(true);
                        setIsFinanceMoreOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-amber-300 transition text-left cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white">উস্তাদদের বেতন ভাউচার</div>
                        <div className="text-[11px] text-slate-400">সকল শিক্ষকের মাসিক বেতন প্রদান</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsFinanceMoreOpen(false);
                        exportFinanceToExcel(filteredTransactions.length > 0 ? filteredTransactions : financialTransactions);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-emerald-300 transition text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white">এক্সেল ডাউনলোড (.xlsx)</div>
                        <div className="text-[11px] text-slate-400">সকল আয়-ব্যয় লেনদেনের স্প্রেডশিট</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsFinanceMoreOpen(false);
                        handlePrintStatement();
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-purple-300 transition text-left cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white">অডিট স্টেটমেন্ট প্রিন্ট</div>
                        <div className="text-[11px] text-slate-400">মাসিক হিসাব নথিপত্র প্রিন্ট</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* KPI Balance Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          {/* Card 1: Total Net Balance */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">বর্তমান মোট স্থিতি (তহবিল)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                ৳
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
                ৳ {netBalance.toLocaleString('bn-BD')}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${netBalance >= 0 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span>{netBalance >= 0 ? 'উদ্বৃত্ত তহবিল / সারপ্লাস' : 'ঘাটতি তহবিল'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Income */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-300">সর্বমোট জমা / আয়</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                ৳ {totalIncome.toLocaleString('bn-BD')}
              </div>
              <div className="text-xs text-emerald-300/80 mt-1">
                মোট {financialTransactions.filter((t) => t.type === 'income').length} টি আয় ভাউচার
              </div>
            </div>
          </div>

          {/* Card 3: Total Expense */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-rose-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-300">সর্বমোট খরচ / ব্যয়</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight font-mono">
                ৳ {totalExpense.toLocaleString('bn-BD')}
              </div>
              <div className="text-xs text-rose-300/80 mt-1">
                মোট {financialTransactions.filter((t) => t.type === 'expense').length} টি ব্যয় ভাউচার
              </div>
            </div>
          </div>

          {/* Card 4: This Month's Net Flow */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-blue-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-300">চলতি মাসের নেট স্থিতি</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-blue-300 tracking-tight font-mono">
                ৳ {thisMonthBalance.toLocaleString('bn-BD')}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span className="text-emerald-400">আয়: ৳{thisMonthIncome.toLocaleString('bn-BD')}</span>
                <span className="text-rose-400">ব্যয়: ৳{thisMonthExpense.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            id="finance-tab-all"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>সকল লেনদেন ({financialTransactions.length})</span>
          </button>

          <button
            id="finance-tab-income"
            onClick={() => setActiveTab('income')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>আয় ও জমা ({financialTransactions.filter((t) => t.type === 'income').length})</span>
          </button>

          <button
            id="finance-tab-expense"
            onClick={() => setActiveTab('expense')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-300" />
            <span>ব্যয় ও খরচ ({financialTransactions.filter((t) => t.type === 'expense').length})</span>
          </button>

          <button
            id="finance-tab-salaries"
            onClick={() => setActiveTab('salaries')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'salaries'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>উস্তাদদের বেতন রেজিস্টার</span>
          </button>

          <button
            id="finance-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>ক্যাটাগরি বিশ্লেষণ ও চার্ট</span>
          </button>

          <button
            id="finance-tab-statement"
            onClick={() => setActiveTab('statement')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'statement'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>মাসিক অডিট স্টেটমেন্ট</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {financialTransactions.length > 0 && (
            <button
              onClick={() => setIsClearAllFinanceOpen(true)}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-rose-200 shrink-0"
              title="পূর্বের সকল লেনদেন হিসাব ক্লিয়ার করুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>সকল লেনদেন ক্লিয়ার</span>
            </button>
          )}
          <button
            onClick={() => exportFinanceToExcel(filteredTransactions.length > 0 ? filteredTransactions : financialTransactions)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-emerald-200"
            title="বর্তমান তালিকা এক্সেলে ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>এক্সেল (.xlsx)</span>
          </button>
          <button
            onClick={handlePrintStatement}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
            title="বর্তমান ভিউ প্রিন্ট করুন"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'analytics' ? (
        /* Analytics & Category Breakdown View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>আয়ের ক্যাটাগরিভিত্তিক বিভাজন</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                মোট: ৳{totalIncome.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="space-y-3">
              {incomeByCategory.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm">কোন আয়ের রেকর্ড নেই</p>
              ) : (
                incomeByCategory.map((cat) => {
                  const percentage = totalIncome > 0 ? ((cat.amount / totalIncome) * 100).toFixed(1) : '0';
                  return (
                    <div key={cat.key} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                        <div className="text-right">
                          <span className="font-bold font-mono text-emerald-700">
                            ৳ {cat.amount.toLocaleString('bn-BD')}
                          </span>
                          <span className="text-slate-400 text-xs ml-1.5 font-mono">({percentage}%)</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(2, Number(percentage)))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span>ব্যয়ের খাতভিত্তিক বিভাজন</span>
              </h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                মোট: ৳{totalExpense.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="space-y-3">
              {expenseByCategory.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm">কোন ব্যয়ের রেকর্ড নেই</p>
              ) : (
                expenseByCategory.map((cat) => {
                  const percentage = totalExpense > 0 ? ((cat.amount / totalExpense) * 100).toFixed(1) : '0';
                  return (
                    <div key={cat.key} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                        <div className="text-right">
                          <span className="font-bold font-mono text-rose-700">
                            ৳ {cat.amount.toLocaleString('bn-BD')}
                          </span>
                          <span className="text-slate-400 text-xs ml-1.5 font-mono">({percentage}%)</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(2, Number(percentage)))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'statement' ? (
        /* Printable Monthly Balance Sheet & Audit Statement */
        <div id="finance-monthly-statement-card" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8">
          {/* Statement Header */}
          <div className="text-center space-y-2 border-b border-slate-200 pb-6">
            <div className="text-xs font-serif font-bold text-emerald-800 tracking-widest">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{madrasaInfo.nameBangla}</h2>
            <p className="text-xs text-slate-500">{madrasaInfo.address} | যোগাযোগ: {madrasaInfo.phone}</p>
            <div className="inline-block bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mt-2">
              আর্থিক বিবরণী ও তহবিল স্থিতি প্রতিবেদন (মাসিক ব্যালেন্স শিট)
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              তারিখ: {new Date().toLocaleDateString('bn-BD')} খ্রিস্টাব্দ
            </p>
          </div>

          {/* Statement Side-by-Side Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Inflow Sources */}
            <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/30 space-y-4">
              <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide border-b border-emerald-200 pb-2 flex justify-between">
                <span>আয় / জমা খাত (Income Sources)</span>
                <span>টাকা</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                {incomeByCategory.map((cat) => (
                  <div key={cat.key} className="flex justify-between text-slate-700 py-1 border-b border-emerald-100">
                    <span>{cat.label} ({cat.count}টি)</span>
                    <span className="font-mono font-bold text-emerald-800">৳ {cat.amount.toLocaleString('bn-BD')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-emerald-900 pt-3 border-t-2 border-emerald-300">
                <span>মোট আয় (Total Income):</span>
                <span className="font-mono">৳ {totalIncome.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Right: Outflow Heads */}
            <div className="border border-rose-200 rounded-2xl p-5 bg-rose-50/30 space-y-4">
              <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wide border-b border-rose-200 pb-2 flex justify-between">
                <span>ব্যয় / খরচ খাত (Expenditures)</span>
                <span>টাকা</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                {expenseByCategory.map((cat) => (
                  <div key={cat.key} className="flex justify-between text-slate-700 py-1 border-b border-rose-100">
                    <span>{cat.label} ({cat.count}টি)</span>
                    <span className="font-mono font-bold text-rose-800">৳ {cat.amount.toLocaleString('bn-BD')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-rose-900 pt-3 border-t-2 border-rose-300">
                <span>মোট ব্যয় (Total Expense):</span>
                <span className="font-mono">৳ {totalExpense.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Statement Bottom Net Result */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">সর্বশেষ তহবিল স্থিতি (Closing Cash Surplus)</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ৳ {netBalance.toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-slate-300">কথায়: {numberToBanglaWords(netBalance)}</p>
            </div>
            <button
              onClick={handlePrintStatement}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>প্রতিবেদন প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-12 text-center text-xs text-slate-600 font-semibold border-t border-slate-200">
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">হিসাবরক্ষক</div>
              <span className="text-[10px] text-slate-400">হিসাব শাখা</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">অডিট কমিটি</div>
              <span className="text-[10px] text-slate-400">নিরীক্ষক</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">মুহতামিম / সভাপতি</div>
              <span className="text-[10px] text-slate-400">{madrasaInfo.nameBangla}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Transactions Table & Register View (All / Income / Expense / Salaries) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
          {/* Filters & Search Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ভাউচার নং, শিরোনাম, দাতা/গ্রহীতা খুঁজুন..."
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Time Filter */}
            <div>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
              >
                <option value="all">📅 সকল সময়সীমা</option>
                <option value="today">আজকের লেনদেন</option>
                <option value="this_month">চলতি মাস ({new Date().toLocaleString('bn-BD', { month: 'long' })})</option>
                <option value="last_month">গত মাস</option>
                <option value="custom">কাস্টম তারিখ সীমা...</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
              >
                <option value="all">📂 সকল ক্যাটাগরি</option>
                <optgroup label="আয়ের খাতসমূহ">
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="ব্যয়ের খাতসমূহ">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
              >
                <option value="all">💳 সকল পেমেন্ট মাধ্যম</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.icon} {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Pickers if selected */}
          {timeFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900">তারিখ সীমা:</span>
              <div className="flex items-center gap-2">
                <span>হতে:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>পর্যন্ত:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Filter Stats Badge */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1">
            <span>
              ফিল্টারকৃত মোট লেনদেন: <strong className="text-slate-800">{filteredTransactions.length}</strong> টি
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-bold">
                মোট জমা: ৳
                {filteredTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((s, t) => s + (Number(t.amount) || 0), 0)
                  .toLocaleString('bn-BD')}
              </span>
              <span className="text-rose-700 font-bold">
                মোট ব্যয়: ৳
                {filteredTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((s, t) => s + (Number(t.amount) || 0), 0)
                  .toLocaleString('bn-BD')}
              </span>
            </div>
          </div>

          {/* Transactions List Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-100/80 text-slate-800 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">ভাউচার নং ও তারিখ</th>
                  <th className="py-3 px-3.5">খাত ও শিরোনাম</th>
                  <th className="py-3 px-3.5">দাতা / গ্রহীতা</th>
                  <th className="py-3 px-3.5">মাধ্যম</th>
                  <th className="py-3 px-3.5 text-right">পরিমাণ (টাকা)</th>
                  <th className="py-3 px-3.5 text-center">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 px-4">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-sm">কোনো লেনদেন পাওয়া যায়নি</h4>
                          <p className="text-xs text-slate-500">
                            পূর্বের ডেমো হিসাব মুছে ফেলা হয়েছে। আপনি নতুন আয় বা ব্যয় হিসাব ভাউচার যুক্ত করতে পারেন।
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            onClick={() => handleOpenAddModal('income')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            নতুন আয়
                          </button>
                          <button
                            onClick={() => handleOpenAddModal('expense')}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                            নতুন ব্যয়
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => {
                    const isIncome = txn.type === 'income';
                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition group">
                        {/* Column 1: Voucher & Date */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{txn.voucherNumber || 'VR-N/A'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {txn.date} {txn.hijriDate ? `| ${txn.hijriDate}` : ''}
                          </div>
                        </td>

                        {/* Column 2: Category & Title */}
                        <td className="py-3 px-3.5 max-w-xs">
                          <div className="font-semibold text-slate-900 line-clamp-1">{txn.title}</div>
                          <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600">
                              {txn.categoryLabel || txn.category}
                            </span>
                            {txn.isAutoGenerated && (
                              <span className="bg-blue-50 text-blue-700 text-[10px] px-1 py-0.5 rounded-md">
                                অটো সিঙ্ক
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 3: Party Name */}
                        <td className="py-3 px-3.5">
                          <div className="font-medium text-slate-800">{txn.partyName || 'অনিবন্ধিত'}</div>
                          {txn.partyPhone && (
                            <div className="text-[11px] text-slate-400 font-mono">{txn.partyPhone}</div>
                          )}
                        </td>

                        {/* Column 4: Payment Method */}
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {txn.paymentMethod === 'cash' && '💵 ক্যাশ'}
                            {txn.paymentMethod === 'bank' && '🏦 ব্যাংক'}
                            {txn.paymentMethod === 'bkash' && '📱 বিকাশ'}
                            {txn.paymentMethod === 'nagad' && '📲 নগদ'}
                            {txn.paymentMethod === 'rocket' && '🚀 রকেট'}
                            {txn.paymentMethod === 'check' && '📜 চেক'}
                          </span>
                        </td>

                        {/* Column 5: Amount */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-sm">
                          <span
                            className={
                              isIncome
                                ? 'text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg'
                                : 'text-rose-700 bg-rose-50 px-2 py-1 rounded-lg'
                            }
                          >
                            {isIncome ? '+' : '-'} ৳ {Number(txn.amount).toLocaleString('bn-BD')}
                          </span>
                        </td>

                        {/* Column 6: Actions */}
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewVoucher(txn)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                              title="মানি রসিদ ও ভাউচার দেখুন / প্রিন্ট করুন"
                            >
                              <Printer className="w-4 h-4 text-emerald-600" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(txn)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(txn.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                              title="এই লেনদেনটি মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}

      {/* MODAL 1: Add / Edit Transaction */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div
              className={`p-5 text-white flex items-center justify-between ${
                modalType === 'income'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700'
                  : 'bg-gradient-to-r from-rose-800 to-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  {modalType === 'income' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">
                    {editingTransaction ? 'লেনদেন সম্পাদনা' : modalType === 'income' ? 'নতুন আয় / জমা ভাউচার' : 'নতুন ব্যয় / খরচ ভাউচার'}
                  </h3>
                  <p className="text-xs text-white/80">মাদরাসার সাধারণ হিসাব বহিতে হিসাব এন্ট্রি করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Type Switch if new */}
              {!editingTransaction && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('income');
                      setFormData((p) => ({
                        ...p,
                        category: 'student_tuition',
                        voucherNumber: `VR-${Math.floor(100000 + Math.random() * 900000)}`,
                      }));
                    }}
                    className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalType === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>জমা / আয়</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('expense');
                      setFormData((p) => ({
                        ...p,
                        category: 'teacher_salary',
                        voucherNumber: `VP-${Math.floor(100000 + Math.random() * 900000)}`,
                      }));
                    }}
                    className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalType === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>ব্যয় / খরচ</span>
                  </button>
                </div>
              )}

              {/* Category Dropdown */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">হিসাব খাত / ক্যাটাগরি *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {(modalType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Description Summary */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">বিবরণ / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={modalType === 'income' ? 'যেমন: হাজী রফিকুল ইসলাম - সাধারণ দান' : 'যেমন: ফেব্রুয়ারি মাসের বিদ্যুৎ বিল পরিশোধ'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="৳ ০.০০"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method & Voucher No */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পেমেন্ট মাধ্যম *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ভাউচার / রসিদ নং</label>
                  <input
                    type="text"
                    value={formData.voucherNumber}
                    onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Party Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {modalType === 'income' ? 'দাতা / জমাকারীর নাম' : 'গ্রহীতা / বিক্রেতার নাম'}
                  </label>
                  <input
                    type="text"
                    value={formData.partyName}
                    onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                    placeholder="নাম"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={formData.partyPhone}
                    onChange={(e) => setFormData({ ...formData, partyPhone: e.target.value })}
                    placeholder="০১৭xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Additional Remarks */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">মন্তব্য / অতিরিক্ত তথ্য</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="কোন বিশেষ নোট বা রেফারেন্স থাকলে লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-md transition cursor-pointer ${
                    modalType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {editingTransaction ? 'হালনাগাদ সংরক্ষণ' : 'ভাউচার সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Teacher Salary Generator */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Users className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">উস্তাদ ও শিক্ষকবৃন্দের বেতন ভাউচার</h3>
                  <p className="text-xs text-amber-100">এক ক্লিকে সকল নিবন্ধিত শিক্ষকের মাসিক বেতন ভাউচার তৈরি</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSalaryModalOpen(false);
                  setSalarySuccessMsg('');
                }}
                className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    বেতন প্রদানের ক্যালেন্ডার ক্যাটাগরি *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-amber-100/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setSalaryMonthCategory('hijri');
                        setSalaryMonth(`মুহাররম ${CURRENT_HIJRI_YEAR}`);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        salaryMonthCategory === 'hijri'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white/70'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>🌙 আরবি মাস (হিজরি)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSalaryMonthCategory('english');
                        setSalaryMonth(`ফেব্রুয়ারি ${CURRENT_ENGLISH_YEAR}`);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        salaryMonthCategory === 'english'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white/70'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>📅 ইংরেজি মাস</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {salaryMonthCategory === 'hijri' ? 'আরবি (হিজরি) মাস ও সন বেছে নিন *' : 'ইংরেজি মাস ও বছর বেছে নিন *'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      {salaryMonthCategory === 'hijri' ? (
                        HIJRI_MONTHS.map((m) => (
                          <option key={m} value={`${m} ${CURRENT_HIJRI_YEAR}`}>
                            🌙 {m} ({CURRENT_HIJRI_YEAR})
                          </option>
                        ))
                      ) : (
                        ENGLISH_MONTHS.map((m) => (
                          <option key={m} value={`${m} ${CURRENT_ENGLISH_YEAR}`}>
                            📅 {m} ({CURRENT_ENGLISH_YEAR})
                          </option>
                        ))
                      )}
                    </select>

                    <input
                      type="text"
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      placeholder="বা কাস্টম লিখুন..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-slate-800 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>নিবন্ধিত শিক্ষক তালিকা ({teachers.length} জন)</span>
                </div>
                <ul className="text-xs space-y-1 max-h-40 overflow-y-auto pr-1 divide-y divide-amber-200/60">
                  {teachers.map((t) => (
                    <li key={t.id} className="py-1 flex justify-between">
                      <span className="font-semibold">{t.nameBangla}</span>
                      <span className="text-slate-500">{t.designation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {salarySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{salarySuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleBulkSalaryGenerate}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>সবাইকে বেতন ভাউচার তৈরি করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Money Receipt / Voucher Modal */}
      {isReceiptModalOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-300 overflow-hidden">
            {/* Action Bar */}
            <div className="bg-slate-900 text-white p-3 px-5 flex items-center justify-between">
              <span className="font-mono text-xs text-amber-400 font-bold">
                ভাউচার নং: {selectedVoucher.voucherNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    printHtmlElement('printable-voucher-card', {
                      title: `ভাউচার নং ${selectedVoucher.voucherNumber} - ${madrasaInfo.nameBangla}`,
                    })
                  }
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Body */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="printable-voucher-card">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-xs font-serif font-bold text-emerald-800">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{madrasaInfo.nameBangla}</h2>
                <p className="text-xs text-slate-600">{madrasaInfo.address} | ফোন: {madrasaInfo.phone}</p>
                <div className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border border-slate-800 bg-slate-50 text-slate-900">
                  {selectedVoucher.type === 'income' ? 'ক্যাশ জমা রসিদ (CREDIT VOUCHER)' : 'খরচ / ডেবিট ভাউচার (DEBIT VOUCHER)'}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">ভাউচার নম্বর:</span>{' '}
                  <span className="font-mono font-bold text-slate-900">{selectedVoucher.voucherNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">তারিখ:</span>{' '}
                  <span className="font-mono font-bold text-slate-900">{selectedVoucher.date}</span>
                </div>
                <div>
                  <span className="text-slate-500">হিসাব খাত:</span>{' '}
                  <span className="font-bold text-slate-900">{selectedVoucher.categoryLabel || selectedVoucher.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">পেমেন্ট মাধ্যম:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {selectedVoucher.paymentMethod === 'cash' ? 'নগদ ক্যাশ' : selectedVoucher.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Party & Description */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex border-b border-dashed border-slate-300 py-1.5">
                  <span className="w-32 text-slate-500 font-medium">
                    {selectedVoucher.type === 'income' ? 'গ্রহীতার নাম (দাতা):' : 'প্রাপকের নাম:'}
                  </span>
                  <span className="font-bold text-slate-900">{selectedVoucher.partyName || '—'}</span>
                </div>

                <div className="flex border-b border-dashed border-slate-300 py-1.5">
                  <span className="w-32 text-slate-500 font-medium">লেনদেনের বিবরণ:</span>
                  <span className="font-semibold text-slate-800">{selectedVoucher.title}</span>
                </div>

                {selectedVoucher.description && (
                  <div className="flex border-b border-dashed border-slate-300 py-1.5">
                    <span className="w-32 text-slate-500 font-medium">অতিরিক্ত তথ্য:</span>
                    <span className="text-slate-600">{selectedVoucher.description}</span>
                  </div>
                )}

                {/* Amount Highlight */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-800 font-bold block">মোট টাকার পরিমাণ:</span>
                    <span className="text-xs text-slate-600">কথায়: {numberToBanglaWords(selectedVoucher.amount)}</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-800">
                    ৳ {Number(selectedVoucher.amount).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs font-bold text-slate-700">
                <div>
                  <div className="border-t border-slate-400 pt-1">গ্রহীতা / আদায়কারীর স্বাক্ষর</div>
                  <span className="text-[10px] text-slate-400 font-normal">হিসাব শাখা</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1">মুহতামিম / অনুমোদকের স্বাক্ষর</div>
                  <span className="text-[10px] text-slate-400 font-normal">{madrasaInfo.nameBangla}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">লেনদেনটি মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500">এই ভাউচারটি ডিলিট করলে মাদরাসার সাধারণ হিসাব থেকে এটি চিরতরে বাদ যাবে।</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deleteFinancialTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Financial Transactions Modal */}
      {isClearAllFinanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-center animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">পূর্বের ডেমো আর্থিক হিসাব মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার মাদরাসার প্রকৃত ও সঠিক আয়-ব্যয় এবং বেতন নতুন করে লিপিবদ্ধ করার জন্য পূর্ববর্তী ডেমো হিসাব মুছে ফেলতে পারেন। অনুগ্রহ করে আপনার পছন্দ নির্বাচন করুন:
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  clearAllFinancialTransactions();
                  setIsClearAllFinanceOpen(false);
                }}
                className="w-full px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer border border-rose-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>শুধু আয় ও ব্যয়ের লেনদেন মুছুন</span>
              </button>

              <button
                onClick={() => {
                  clearAllFinancialData();
                  setIsClearAllFinanceOpen(false);
                }}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>সব আর্থিক হিসাব ও ছাত্রদের ফি রসিদ সম্পূর্ণ রিসেট (নতুন শুরু)</span>
              </button>

              <button
                onClick={() => setIsClearAllFinanceOpen(false)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
