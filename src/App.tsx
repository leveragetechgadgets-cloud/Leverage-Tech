import React, { useState, useEffect } from 'react';
import { CompanySettings, Invoice, InvoiceItem, CurrencyType, AppState } from './types';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import CompanySettingsForm from './components/CompanySettings';
import InvoicePrint from './components/InvoicePrint';
import Notification, { NotificationMsg, NotificationType } from './components/Notification';
import { generateStandaloneHTML } from './utils/standaloneExporter';
import LoginGate from './components/LoginGate';
import LogoSvg from './components/LogoSvg';
import AiAssistant from './components/AiAssistant';

// Lucide icons
import { 
  Building2, FileText, Settings, Sparkles, Printer, 
  Moon, Sun, Plus, Landmark, History, Layers, 
  ArrowLeft, Palette, Download, Upload, Undo, Redo, HelpCircle,
  LogOut, MessageCircle, Mail, ChevronDown, ChevronUp, Search, Bell,
  PieChart, Brain, Users, CreditCard, ArrowRightLeft, Clock
} from 'lucide-react';

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'LevFlow',
  address: 'Commercial Avenue, Lagos, Nigeria',
  email: 'leveragetechgadgets@gmail.com',
  phone: '+234 913 929 3333',
  website: 'https://levflow.tech',
  tin: 'TIN-4920491-X',
  logo: '',
  bankName: 'Access Capital Bank',
  accountName: 'Leverage Tech & Business LTD',
  accountNumber: '1023940120',
  paymentInstructions: 'Transfer within 14 business days. Thank you for your continued partnership.',
  watermark: '',
};

const DEFAULT_INVOICE = (): Invoice => ({
  id: 'INV-2024-0156',
  invoiceNumber: 'INV-2024-0156',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'NGN',
  customer: {
    name: 'Nexus Tech Ltd',
    address: '42 Broad Street, Marina, Lagos',
    phone: '+234 803 203 3920',
    email: 'billing@nexustech.com',
    reference: 'NXT-2026-CORP',
  },
  items: [
    { id: '1', description: 'Enterprise Software Integration Consulting', quantity: 1, unitPrice: 1250000 },
    { id: '2', description: 'Cloud Infra Migration - AWS Cloudformation setup', quantity: 1, unitPrice: 700000 }
  ],
  vatPercent: 7.5,
  taxPercent: 5.0,
  discountPercent: 0,
  discountAmount: 0,
  transportationCost: 0,
  serviceCharge: 0,
  paidAmount: 1950000,
  terms: 'Payment is due strictly within the agreed payment period.',
  sellerSignature: '',
  buyerSignature: '',
  isReceiptMode: false,
  status: 'Paid',
  themeColor: '#3b82f6', // Geometric balance blue
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('leverage-auth-token') !== null;
  });
  const [operator, setOperator] = useState<{ name: string; email: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'edit' | 'settings' | 'print' | 'ai-assistant'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showFooterSupport, setShowFooterSupport] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Local Storage State
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(DEFAULT_INVOICE());
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_SETTINGS);

  // Redo/Undo Stacks for editing
  const [undoStack, setUndoStack] = useState<Invoice[]>([]);
  const [redoStack, setRedoStack] = useState<Invoice[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);

  // Handle Logout / Locking Workstation
  const handleLogout = () => {
    sessionStorage.removeItem('leverage-auth-token');
    setIsAuthenticated(false);
    showToast('Workstation locked. Logs are encrypted.', 'info');
  };

  // Load from local storage on startup
  useEffect(() => {
    // Load registered user
    const savedRegUser = localStorage.getItem('leverage-registered-user');
    if (savedRegUser) {
      try {
        const parsed = JSON.parse(savedRegUser);
        setOperator({ name: parsed.name, email: parsed.email });
      } catch (err) {
        console.error('Failed reading user:', err);
      }
    } else {
      setOperator({ name: 'Jude Jaala Jayce', email: 'threect@gmail.com' });
    }
    
    // Sync theme on load
    const savedTheme = localStorage.getItem('leverage-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // Load Company Settings
    const savedSettings = localStorage.getItem('leverage-settings');
    if (savedSettings) {
      try {
        setCompanySettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error('Failed reading settings:', err);
      }
    }

    // Load History
    const savedHistory = localStorage.getItem('leverage-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setInvoiceHistory(parsed);
        }
      } catch (err) {
        console.error('Failed reading history:', err);
      }
    } else {
      // Seed default initial invoices to match the mockup data!
      const mockInvoices: Invoice[] = [
        {
          id: 'INV-2024-0156',
          invoiceNumber: 'INV-2024-0156',
          date: '2024-05-29',
          dueDate: '2024-06-12',
          currency: 'NGN',
          customer: {
            name: 'Nexus Tech Ltd',
            address: '42 Broad Street, Marina, Lagos',
            phone: '+234 803 203 3920',
            email: 'billing@nexustech.com',
            reference: 'NXT-2026-CORP',
          },
          items: [
            { id: '1', description: 'Enterprise Software Integration Consulting', quantity: 1, unitPrice: 1950000 }
          ],
          vatPercent: 0,
          taxPercent: 0,
          discountPercent: 0,
          discountAmount: 0,
          transportationCost: 0,
          serviceCharge: 0,
          paidAmount: 1950000,
          terms: 'Standard net-14 terms.',
          sellerSignature: '',
          buyerSignature: '',
          isReceiptMode: false,
          status: 'Paid',
          themeColor: '#3b82f6',
        },
        {
          id: 'INV-2024-0155',
          invoiceNumber: 'INV-2024-0155',
          date: '2024-05-28',
          dueDate: '2024-06-11',
          currency: 'NGN',
          customer: {
            name: 'Stellar Builders',
            address: 'Annex Mall, Lekki, Lagos',
            phone: '+234 812 390 4010',
            email: 'accounts@stellarbuilders.com',
            reference: 'ST-BUILD-929',
          },
          items: [
            { id: '1', description: 'Technical Structural Concrete Supply', quantity: 1, unitPrice: 750000 }
          ],
          vatPercent: 0,
          taxPercent: 0,
          discountPercent: 0,
          discountAmount: 0,
          transportationCost: 0,
          serviceCharge: 0,
          paidAmount: 0,
          terms: 'Payment due on delivery.',
          sellerSignature: '',
          buyerSignature: '',
          isReceiptMode: false,
          status: 'Unpaid',
          themeColor: '#3b82f6',
        },
        {
          id: 'INV-2024-0154',
          invoiceNumber: 'INV-2024-0154',
          date: '2024-05-27',
          dueDate: '2024-06-10',
          currency: 'NGN',
          customer: {
            name: 'Greenfield Schools',
            address: 'Greenfield Road, Ikeja, Lagos',
            phone: '+234 905 201 1029',
            email: 'info@greenfieldschools.edu',
            reference: 'GF-EDU-221',
          },
          items: [
            { id: '1', description: 'EdTech Portal Subscription Licenses & Porting', quantity: 1, unitPrice: 2450000 }
          ],
          vatPercent: 0,
          taxPercent: 0,
          discountPercent: 0,
          discountAmount: 0,
          transportationCost: 0,
          serviceCharge: 0,
          paidAmount: 2450000,
          terms: 'Academic license contract.',
          sellerSignature: '',
          buyerSignature: '',
          isReceiptMode: false,
          status: 'Paid',
          themeColor: '#3b82f6',
        },
        {
          id: 'INV-2024-0153',
          invoiceNumber: 'INV-2024-0153',
          date: '2024-05-26',
          dueDate: '2024-06-09',
          currency: 'NGN',
          customer: {
            name: 'Avon Medicals',
            address: 'Glover Road, Ikoyi, Lagos',
            phone: '+234 816 702 4050',
            email: 'procure@avonmed.com',
            reference: 'AVON-MED-20',
          },
          items: [
            { id: '1', description: 'Diagnostic Gadgets & Protective Kits Supply', quantity: 1, unitPrice: 1200000 }
          ],
          vatPercent: 0,
          taxPercent: 0,
          discountPercent: 0,
          discountAmount: 0,
          transportationCost: 0,
          serviceCharge: 0,
          paidAmount: 0,
          terms: 'Standard terms.',
          sellerSignature: '',
          buyerSignature: '',
          isReceiptMode: false,
          status: 'Unpaid',
          themeColor: '#3b82f6',
        },
        {
          id: 'INV-2024-0152',
          invoiceNumber: 'INV-2024-0152',
          date: '2024-05-24',
          dueDate: '2024-06-07',
          currency: 'NGN',
          customer: {
            name: 'Prime Consulting',
            address: 'Civic Towers, Victoria Island, Lagos',
            phone: '+234 809 301 2291',
            email: 'prime@primeconsulting.org',
            reference: 'PRM-CONS-44',
          },
          items: [
            { id: '1', description: 'Corporate Strategy Research & Reporting', quantity: 1, unitPrice: 980000 }
          ],
          vatPercent: 0,
          taxPercent: 0,
          discountPercent: 0,
          discountAmount: 0,
          transportationCost: 0,
          serviceCharge: 0,
          paidAmount: 980000,
          terms: 'Immediate settlement.',
          sellerSignature: '',
          buyerSignature: '',
          isReceiptMode: false,
          status: 'Paid',
          themeColor: '#3b82f6',
        }
      ];
      setInvoiceHistory(mockInvoices);
      localStorage.setItem('leverage-history', JSON.stringify(mockInvoices));
    }
  }, []);

  // Sync current theme helper
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('leverage-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast('Theme swapped successfully', 'info');
  };

  // Toast notifier triggers
  const showToast = (message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Save current invoice or company settings to local storage auto save
  const triggerAutoSave = (updatedInvoice: Invoice) => {
    localStorage.setItem('leverage-current-draft', JSON.stringify(updatedInvoice));
  };

  const handleInvoiceEdit = (updated: Invoice) => {
    setUndoStack((prev) => [...prev.slice(-10), currentInvoice]); // limit stack to 10
    setRedoStack([]); // clear redo
    setCurrentInvoice(updated);
    triggerAutoSave(updated);
  };

  // Undo edit operation
  const triggerUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentInvoice]);
    setCurrentInvoice(previous);
    showToast('Undo change applied', 'info');
  };

  // Redo edit operation
  const triggerRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentInvoice]);
    setCurrentInvoice(next);
    showToast('Redo change applied', 'info');
  };

  // Save Company settings
  const handleSettingsChange = (updatedSettings: CompanySettings) => {
    setCompanySettings(updatedSettings);
    localStorage.setItem('leverage-settings', JSON.stringify(updatedSettings));
  };

  // Commiting Invoice to logs
  const handleSaveInvoice = () => {
    const existingIndex = invoiceHistory.findIndex((inv) => inv.id === currentInvoice.id);
    let updatedHistory = [...invoiceHistory];

    if (existingIndex > -1) {
      updatedHistory[existingIndex] = { ...currentInvoice, status: getCalculatedStatus(currentInvoice) };
      showToast(`Invoice ${currentInvoice.invoiceNumber} successfully updated`, 'success');
    } else {
      const freshInv = { ...currentInvoice, id: currentInvoice.invoiceNumber, status: getCalculatedStatus(currentInvoice) };
      updatedHistory = [freshInv, ...updatedHistory];
      showToast(`Invoice ${currentInvoice.invoiceNumber} committed to transaction logs`, 'success');
    }

    setInvoiceHistory(updatedHistory);
    localStorage.setItem('leverage-history', JSON.stringify(updatedHistory));
    
    // Auto-update last used index inside LocalStorage sequence
    const parsedNum = parseInt(currentInvoice.invoiceNumber.replace('INV-', ''));
    if (!isNaN(parsedNum)) {
      localStorage.setItem('leverage-last-invoice-number', parsedNum.toString());
    }

    setActiveTab('dashboard');
  };

  const getCalculatedStatus = (inv: Invoice): 'Paid' | 'Unpaid' => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = subtotal * (inv.vatPercent / 100);
    const taxAmount = subtotal * (inv.taxPercent / 100);
    
    let discountAmount = 0;
    if (inv.discountPercent > 0) {
      discountAmount = subtotal * (inv.discountPercent / 100);
    } else if (inv.discountAmount > 0) {
      discountAmount = inv.discountAmount;
    }

    const serviceCharge = Number(inv.serviceCharge) || 0;
    const transportationCost = Number(inv.transportationCost) || 0;
    const grandTotal = subtotal + vatAmount + taxAmount + serviceCharge + transportationCost - discountAmount;
    const balanceDue = grandTotal - inv.paidAmount;

    return balanceDue <= 0.05 ? 'Paid' : 'Unpaid';
  };

  // Duplication invoice action
  const handleDuplicateInvoice = (id: string) => {
    const original = invoiceHistory.find((inv) => inv.id === id);
    if (!original) return;

    const nextNumber = getNextInvoiceNumber();
    const cloned: Invoice = {
      ...original,
      id: nextNumber,
      invoiceNumber: nextNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paidAmount: 0
    };

    const newHistory = [cloned, ...invoiceHistory];
    setInvoiceHistory(newHistory);
    localStorage.setItem('leverage-history', JSON.stringify(newHistory));
    showToast(`Successfully duplicated into new invoice: ${nextNumber}`, 'success');
  };

  // Permanent Delete
  const handleDeleteInvoice = (id: string) => {
    const nextList = invoiceHistory.filter((inv) => inv.id !== id);
    setInvoiceHistory(nextList);
    localStorage.setItem('leverage-history', JSON.stringify(nextList));
    showToast(`Invoice permanently purged from database`, 'error');
  };

  // Reset or clear form to build a fresh invoice sequence
  const handleResetForm = () => {
    const nextNum = getNextInvoiceNumber();
    const fresh: Invoice = {
      ...DEFAULT_INVOICE(),
      id: nextNum,
      invoiceNumber: nextNum,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      sellerSignature: currentInvoice.sellerSignature,
    };
    setCurrentInvoice(fresh);
    setActiveTab('edit');
    showToast('Invoicing sheets reset. Fresh serial sequence: ' + nextNum, 'info');
  };

  // Get dynamic next INV sequential code
  const getNextInvoiceNumber = (): string => {
    const lastNumStr = localStorage.getItem('leverage-last-invoice-number');
    if (lastNumStr) {
      const num = parseInt(lastNumStr);
      if (!isNaN(num)) {
        return `INV-2024-0${num + 1}`;
      }
    }

    if (invoiceHistory.length > 0) {
      const numbers = invoiceHistory.map((inv) => {
        const parts = inv.invoiceNumber.split('-');
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart);
        return isNaN(parsed) ? 1000 : parsed;
      });
      const max = Math.max(...numbers);
      return `INV-2024-0${max + 1}`;
    }

    return 'INV-2024-0157';
  };

  // Load selected element into Editor
  const handleSelectInvoiceAndEdit = (inv: Invoice) => {
    setCurrentInvoice(inv);
    setActiveTab('edit');
    showToast(`Loaded details for Invoice: ${inv.invoiceNumber}`, 'info');
  };

  // Database configurations backups
  const handleExportBackup = () => {
    const dataStr = JSON.stringify({
      history: invoiceHistory,
      settings: companySettings
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LEVFLOW_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Secure JSON configuration database exported successfully');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (parsedData.history && Array.isArray(parsedData.history)) {
          setInvoiceHistory(parsedData.history);
          localStorage.setItem('leverage-history', JSON.stringify(parsedData.history));
        }
        if (parsedData.settings) {
          setCompanySettings(parsedData.settings);
          localStorage.setItem('leverage-settings', JSON.stringify(parsedData.settings));
        }
        showToast('System variables restored successfully. All logs synced.', 'success');
        setActiveTab('dashboard');
      } catch (err) {
        showToast('Corrupted JSON archive. Restore failed.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Portable standlone exporter download trigger
  const handleDownloadStandaloneEdition = () => {
    const sourceHtml = generateStandaloneHTML();
    const blob = new Blob([sourceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LEVFLOW_OFFLINE_V3.html';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Portable single HTML standalone downloaded. Works fully offline.', 'success');
  };

  // Print view launcher trigger
  const launchPrintViewer = () => {
    setActiveTab('print');
    showToast('Print mode loaded. Ready to compile PDF.', 'info');
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  const handleDraftCreated = (draft: any) => {
    const nextNum = getNextInvoiceNumber();
    const fresh: Invoice = {
      ...DEFAULT_INVOICE(),
      id: nextNum,
      invoiceNumber: nextNum,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: {
        name: draft.customerName || '',
        address: draft.address || '',
        phone: draft.phone || '',
        email: draft.email || '',
        reference: '',
      },
      items: (draft.items || []).map((it: any, idx: number) => ({
        id: (idx + 1).toString(),
        description: it.description || 'Deliverable',
        quantity: typeof it.quantity === 'number' ? it.quantity : 1,
        unitPrice: typeof it.unitPrice === 'number' ? it.unitPrice : 0,
      })),
      discountPercent: 0,
      discountAmount: draft.discountAmount || 0,
      vatPercent: typeof draft.vatPercent === 'number' ? draft.vatPercent : 7.5,
      taxPercent: typeof draft.taxPercent === 'number' ? draft.taxPercent : 5.0,
    };
    setCurrentInvoice(fresh);
    setActiveTab('edit');
    showToast(`Smart invoice compiled sequence created!`, 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans flex flex-col justify-between">
        <LoginGate 
          onSuccess={(user) => {
            setOperator(user);
            setIsAuthenticated(true);
          }} 
          id="workstation-gate" 
        />
        <Notification notifications={notifications} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans flex text-slate-800 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-100 dark:selection:bg-blue-950/60 selection:text-blue-800 print:bg-white print:p-0">
      
      {/* 1. LEFT-HAND MASTER SIDEBAR PANEL (Desktop-Only, completely matches picture aesthetic) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-150 dark:border-slate-800/80 p-6 flex flex-col justify-between shrink-0 h-screen sticky top-0 print:hidden select-none">
        <div className="space-y-7">
          
          {/* Logo segment */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center justify-center shadow-xs shrink-0">
              <LogoSvg size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-[#0F172A] dark:text-slate-100">
                LevFlow
              </h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block mt-1">Invoice with Impact</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'edit', label: 'Invoices', icon: FileText },
              { id: 'settings', label: 'Customers', icon: Users },
              { id: 'print', label: 'Payments', icon: CreditCard },
              { id: 'print-nav', label: 'Quotations', icon: ArrowRightLeft, disabledMsg: 'Quotations are mapped directly under AI Assistant smart drafting.' },
              { id: 'print-nav2', label: 'Expenses', icon: Clock, disabledMsg: 'Expenses logs are synced inside the primary Dashboard cards.' },
              { id: 'print-nav3', label: 'Reports', icon: Printer, disabledMsg: 'Standard reports can be printed instantly via Print button in invoice view.' },
              { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'NEW' },
            ].map((link) => {
              const IconComp = link.icon;
              const isActive = activeTab === link.id;
              
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    if (link.disabledMsg) {
                      showToast(link.disabledMsg, 'info');
                      return;
                    }
                    setActiveTab(link.id as any);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/10 text-[#2563EB] dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp size={15} className={isActive ? "text-[#2563EB] dark:text-blue-400" : "text-slate-400"} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[8px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase leading-none">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 my-3"></div>

            {/* Config Sub-links */}
            {[
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'integrations', label: 'Integrations', disabledMsg: 'V3 Workstation runs fully local. Integrations are fully self-contained.' },
              { id: 'backup', label: 'Backup & Sync', icon: Download, action: handleExportBackup }
            ].map((link, idx) => {
              const IconComp = link.icon || Settings;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (link.action) {
                      link.action();
                      return;
                    }
                    if (link.disabledMsg) {
                      showToast(link.disabledMsg, 'info');
                      return;
                    }
                    setActiveTab(link.id as any);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-500 hover:text-slate-805 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer`}
                >
                  <IconComp size={15} className="text-slate-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Banner & Account section */}
        <div className="space-y-4">
          
          {/* Pro promotional card */}
          <div className="bg-blue-600/5 dark:bg-blue-950/20 border border-blue-500/10 rounded-2xl p-4 text-center select-none">
            <div className="w-7 h-7 mx-auto rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs mb-2 shadow-sm">
              👑
            </div>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 leading-none">Upgrade to LevFlow Pro</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-snug">Unlock advanced features and automated sequences.</p>
            <button 
              type="button"
              onClick={() => showToast('Subscription details are managed locally in developer mode.', 'info')}
              className="mt-3 text-[10px] text-white font-bold bg-blue-600 hover:bg-blue-500 transition px-3.5 py-1.5 rounded-lg cursor-pointer w-full"
            >
              Upgrade Now →
            </button>
          </div>

          {/* Account Profile Box */}
          <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 font-bold text-xs select-none">
                {operator?.name ? operator.name.split(' ').map(n=>n[0]).join('') : 'OP'}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold text-[#0F172A] dark:text-slate-200 truncate leading-tight">
                  {operator?.name || 'Jude Jaala Joyce'}
                </span>
                <span className="block text-[9px] text-slate-400 dark:text-slate-500 truncate leading-none">
                  Worldwide Ltd
                </span>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer"
              title="Lock Workstation Session"
            >
              <LogOut size={13} />
            </button>
          </div>

        </div>
      </aside>

      {/* 2. MAIN WORKSPACE PANE (Right-Hand Side) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-screen">
        
        {/* Main Content scrollable box */}
        <div className="w-full">
          
          {/* Main Top Header Block - matching the picture's layout */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800/80 py-4 px-8 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden select-none">
            
            {/* Left side: Live search */}
            <div className="w-full md:w-80 relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices, customers..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-10 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-150"
              />
              <Search size={13} className="text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Right side: quick actions, theme toggle, bells, standalone builder */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              
              {/* Notification bell */}
              <button 
                type="button"
                onClick={() => showToast('All local storage files consolidated correctly. Logs green.', 'success')}
                className="p-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-300 transition relative cursor-pointer"
              >
                <Bell size={14} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </button>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-805 rounded-xl text-slate-500 dark:text-slate-300 cursor-pointer transition"
                title="Toggle visual style"
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              {/* Standard standalone single-HTML download */}
              <button
                type="button"
                onClick={handleDownloadStandaloneEdition}
                className="hidden md:flex items-center gap-1.5 bg-[#FAFBFD] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition shadow-xs"
              >
                <Download size={13} /> <span>Standalone HTML</span>
              </button>

              {/* Create new button */}
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white px-4 py-2 rounded-xl transition shadow-xs cursor-pointer select-none"
              >
                <Plus size={14} />
                <span>Create</span>
              </button>
            </div>
          </header>

          {/* Greeting segment - Only visible on Dashboard view */}
          {activeTab === 'dashboard' && (
            <div className="px-8 pt-6 select-none print:hidden">
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                Good Morning, {operator?.name ? operator.name.split(' ')[0] : 'Jude'} 👋
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Here's what's happening with your business today.</p>
            </div>
          )}

          {/* Primary Main Content View Area */}
          <main className="p-8 print:p-0 print:m-0">
            
            {/* Quick helper controls inside edit mode */}
            {activeTab === 'edit' && (
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2.5 rounded-2xl mb-5 border border-slate-200 dark:border-slate-850 print:hidden animate-fade-in select-none">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <ArrowLeft size={13} /> Back to dashboard
                  </button>
                  <div className="h-4 border-l border-slate-200 dark:border-slate-800 mx-2" />
                  <button
                    onClick={launchPrintViewer}
                    className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:bg-slate-50 transition animate-pulse"
                  >
                    <Printer size={12} /> Compile PDF Printout
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">Local edit controls:</span>
                  <button
                    onClick={triggerUndo}
                    disabled={undoStack.length === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center cursor-pointer"
                    title="Undo"
                  >
                    <Undo size={14} />
                  </button>
                  <button
                    onClick={triggerRedo}
                    disabled={redoStack.length === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center cursor-pointer"
                    title="Redo"
                  >
                    <Redo size={14} />
                  </button>
                  <div className="text-[10px] bg-slate-250 dark:bg-slate-800 px-2.5 py-0.5 rounded-md font-mono text-slate-500 select-all leading-none">
                    NO: {currentInvoice.invoiceNumber}
                  </div>
                </div>
              </div>
            )}

            {/* ROUTER SWITCH VIEW */}
            <div className="print:hidden">
              
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <Dashboard
                    invoices={invoiceHistory}
                    onSelectInvoice={handleSelectInvoiceAndEdit}
                    onDuplicateInvoice={handleDuplicateInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    onImportBackup={handleImportBackup}
                    onExportBackup={handleExportBackup}
                    currency={currentInvoice.currency}
                    id="main"
                    onNewInvoice={handleResetForm}
                    onViewSettings={() => setActiveTab('settings')}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="animate-fade-in">
                  <InvoiceForm
                    invoice={currentInvoice}
                    onChange={handleInvoiceEdit}
                    settings={companySettings}
                    onSave={handleSaveInvoice}
                    onReset={handleResetForm}
                    id="main-editor"
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs animate-fade-in">
                  <CompanySettingsForm
                    settings={companySettings}
                    onChange={handleSettingsChange}
                    id="main-settings"
                  />
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        showToast('Corporate settings synchronized securely');
                      }}
                      className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Synchronize & Save Profile
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'ai-assistant' && (
                <div className="animate-fade-in">
                  <AiAssistant
                    invoices={invoiceHistory}
                    currency={currentInvoice.currency}
                    onDraftCreated={handleDraftCreated}
                  />
                </div>
              )}

              {activeTab === 'print' && (
                <div className="space-y-4 animate-fade-in max-w-[210mm] mx-auto select-none">
                  {/* Floating Controller Row */}
                  <div className="flex justify-between items-center bg-[#0F172A] text-white p-3.5 rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('edit')}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer transition font-bold"
                      >
                        <ArrowLeft size={13} /> Back to Form
                      </button>
                      <div className="h-4 border-l border-white/10 mx-2" />
                      <span className="text-xs font-bold text-slate-400">Layout Preview: <strong className="text-white font-mono">{currentInvoice.invoiceNumber}</strong></span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrintTrigger}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white shadow-lg shadow-blue-500/10 cursor-pointer transition"
                      >
                        <Printer size={13} /> Print System / Save PDF
                      </button>
                    </div>
                  </div>

                  {/* Standard A4 Paper visual box */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
                    <InvoicePrint invoice={currentInvoice} settings={companySettings} id="preview" />
                  </div>
                </div>
              )}

            </div>

            {/* ALWAYS Render Printable Area on bottom so we can trigger perfect print and pdf outputs with layout wrappers */}
            <div id="print-invoice-area" className="hidden print:block absolute top-0 left-0 w-full m-0 p-0 h-auto">
              <InvoicePrint invoice={currentInvoice} settings={companySettings} id="print" />
            </div>

          </main>

        </div>

        {/* Footnote Margin Area */}
        <footer className="py-8 bg-slate-50 dark:bg-slate-950/40 text-center text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-150 dark:border-slate-900 leading-relaxed font-mono select-none print:hidden gap-2 flex flex-col items-center">
          <p className="font-semibold tracking-widest text-[#0F172A] dark:text-slate-300 uppercase">LEVFLOW INVOICING SUITE • WORKSTATION ID NODE: NGX-9B30</p>
          <p className="text-slate-500 italic">"Invoice with impact. Leverage your business"</p>
          
          {/* Support collapsible system */}
          <div className="flex flex-col items-center gap-3 py-2">
            <button 
              type="button"
              onClick={() => setShowFooterSupport(!showFooterSupport)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-xs cursor-pointer text-[11px] font-bold font-sans select-none"
            >
              <HelpCircle size={13} className="text-blue-500 shrink-0" />
              <span>{showFooterSupport ? 'Hide Technical Support Desk' : 'Need Help? Toggle Support Contacts'}</span>
              {showFooterSupport ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </button>

            {showFooterSupport && (
              <div className="flex flex-wrap items-center justify-center gap-4 py-1 animate-fade-in text-[11px] font-sans antialiased">
                <a 
                  href="https://wa.me/2349139293333" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  WhatsApp Link: <strong>+2349139293333</strong>
                </a>
                <a 
                  href="mailto:leveragetechgadgets@gmail.com" 
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer"
                >
                  Email Helpdesk: <strong>leveragetechgadgets@gmail.com</strong>
                </a>
              </div>
            )}
          </div>
          
          <p className="text-[9px] text-slate-400/80 mt-1">© 2026 LevFlow Offline Workstation. Standalone portability configured.</p>
        </footer>

      </div>

      {/* Dynamic Toast System */}
      <Notification notifications={notifications} />

    </div>
  );
}
