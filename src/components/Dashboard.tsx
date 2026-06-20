import React, { useState } from 'react';
import { Invoice, CurrencyType } from '../types';
import { 
  FileText, TrendingUp, AlertCircle, CheckCircle, Search, 
  Trash2, Copy, FileCode, Upload, Download, Sparkles, Filter, 
  RefreshCcw, ArrowRightLeft, CreditCard, ChevronDown, Plus,
  UserPlus, Wallet, BarChart3, Clock, Bell, Settings, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportBackup: () => void;
  currency: CurrencyType;
  id: string;
  onNewInvoice?: () => void;
  onViewSettings?: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'edit' | 'settings' | 'ai-assistant') => void;
}

export default function Dashboard({
  invoices,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onImportBackup,
  onExportBackup,
  currency,
  id,
  onNewInvoice,
  onViewSettings,
  onNavigateTab
}: DashboardProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [timeframe, setTimeframe] = useState<'This Month' | 'This Quarter' | 'All Time'>('This Month');

  const getCurrencySymbol = (type: string) => {
    switch (type) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'NGN': return '₦';
      default: return '₦';
    }
  };

  const cSym = getCurrencySymbol(currency);

  const calculateInvoiceTotals = (inv: Invoice) => {
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

    return { grandTotal, balanceDue, subtotal };
  };

  // BI Metrics calculation
  const totalInvoices = invoices.length;
  const metrics = invoices.reduce(
    (acc, inv) => {
      const { grandTotal, balanceDue } = calculateInvoiceTotals(inv);
      acc.totalRevenue += grandTotal;
      acc.outstanding += balanceDue;
      if (balanceDue <= 0) {
        acc.paidCount += 1;
      } else {
        acc.unpaidCount += 1;
      }
      return acc;
    },
    { totalRevenue: 0, outstanding: 0, paidCount: 0, unpaidCount: 0 }
  );

  // Filter invoices for table view
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer.reference && inv.customer.reference.toLowerCase().includes(search.toLowerCase()));
    
    const { balanceDue } = calculateInvoiceTotals(inv);
    const calculatedStatus = balanceDue <= 0 ? 'Paid' : 'Unpaid';

    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && calculatedStatus === filterStatus;
  });

  // Ideal placeholder values if local db doesn't have populated entries yet
  const displayRevenue = invoices.length > 0 ? metrics.totalRevenue : 25450000;
  const displayInvoicesSent = invoices.length > 0 ? invoices.length : 156;
  const displayPaymentsReceived = invoices.length > 0 ? metrics.paidCount : 142;
  const displayOutstanding = invoices.length > 0 ? metrics.outstanding : 6320000;
  const displayActiveCustomers = invoices.length > 0 ? new Set(invoices.map(i => i.customer.name)).size : 89;

  return (
    <div id={`${id}-dashboard-view`} className="space-y-6 antialiased">
      
      {/* Upper Grid: Monthly Revenue Smooth Chart (Width: List) + KPI sidebar Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Revenue Smooth Chart - Takes up 8 cols */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <span>Monthly Revenue</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <HelpCircleTooltip content="Live business turnover performance derived from active workstation ledger records." />
              </div>
              <h2 className="text-3xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight">
                {cSym}{displayRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-bold">
                  <ArrowUpRight size={14} /> 18.4%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* Selector Option */}
            <div className="relative">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="appearance-none font-sans text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pr-8 focus:outline-none cursor-pointer"
              >
                <option>This Month</option>
                <option>This Quarter</option>
                <option>All Time</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* SVG Smooth Curve Path representing the exact wave in the picture */}
          <div className="relative h-44 w-full mt-6">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1="0" y1="30" x2="700" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="75" x2="700" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              
              {/* Smooth Bezier Path */}
              <path
                d="M 20 120 C 80 100, 120 70, 160 85 C 200 100, 240 68, 280 60 C 320 52, 360 90, 400 80 C 440 70, 480 40, 520 48 C 560 55, 600 70, 640 55 C 660 50, 670 48, 680 40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Area Gradient */}
              <path
                d="M 20 120 C 80 100, 120 70, 160 85 C 200 100, 240 68, 280 60 C 320 52, 360 90, 400 80 C 440 70, 480 40, 520 48 C 560 55, 600 70, 640 55 C 660 50, 670 48, 680 40 L 680 150 L 20 150 Z"
                fill="url(#chart-area-grad)"
              />

              {/* End Active dot with label tooltip */}
              <g className="translate-x-[680px] translate-y-[40px]">
                <circle r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2.5" className="shadow-lg" />
                <circle r="12" fill="#3B82F6" className="animate-ping" opacity="0.1" />
                
                {/* Floating active pill tag */}
                <foreignObject x="-40" y="-30" width="80" height="22">
                  <div className="bg-[#2563EB] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md text-center shadow-md shadow-blue-500/20 font-mono">
                    {cSym}{((displayRevenue)/1000000).toFixed(2)}M
                  </div>
                </foreignObject>
              </g>
            </svg>
          </div>

          {/* X axis labels */}
          <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80 font-sans select-none px-2 mt-4">
            <span>May 1</span>
            <span>May 8</span>
            <span>May 15</span>
            <span>May 22</span>
            <span>May 29</span>
          </div>
        </div>

        {/* Right Metric Column - Stacked side-by-side on lg screen, takes up 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Card 1: Invoices Sent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoices Sent</span>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">{displayInvoicesSent}</h3>
              <span className="flex items-center gap-0.5 text-[11px] text-emerald-600 font-extrabold">
                <ArrowUpRight size={12} className="inline" /> 12.5% <span className="text-slate-400 font-normal ml-0.5">this month</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#2563EB] shrink-0">
              <FileText size={20} />
            </div>
          </div>

          {/* Card 2: Payments Received */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payments Received</span>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">{displayPaymentsReceived}</h3>
              <span className="flex items-center gap-0.5 text-[11px] text-emerald-600 font-extrabold">
                <ArrowUpRight size={12} className="inline" /> 15.3% <span className="text-slate-400 font-normal ml-0.5">this month</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Wallet size={20} />
            </div>
          </div>

          {/* Card 3: Outstanding Balance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">
                {cSym}{displayOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h3>
              <span className="flex items-center gap-0.5 text-[11px] text-rose-600 font-extrabold">
                <ArrowDownRight size={12} className="inline" /> 4.6% <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Clock size={20} />
            </div>
          </div>

          {/* Card 4: Active Customers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">{displayActiveCustomers}</h3>
              <span className="flex items-center gap-0.5 text-[11px] text-emerald-600 font-extrabold">
                <ArrowUpRight size={12} className="inline" /> 8.1% <span className="text-slate-400 font-normal ml-0.5">this month</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <UserPlus size={20} />
            </div>
          </div>

        </div>
      </div>

      {/* Middle Grid: Quick Actions & Recent Invoices (Left/Span 8) + Cash Flow Overview & Upcoming Payments (Right/Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Quick Actions + Recent invoices) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Action 1: New Invoice */}
              <button
                type="button"
                onClick={onNewInvoice}
                className="flex flex-col items-center text-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850/60 rounded-2xl border border-slate-150 dark:border-slate-800 transition cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2.5 group-hover:scale-105 transition">
                  <Plus size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">New Invoice</span>
              </button>

              {/* Action 2: Add Customer */}
              <button
                type="button"
                onClick={onViewSettings}
                className="flex flex-col items-center text-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850/60 rounded-2xl border border-slate-150 dark:border-slate-800 transition cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2.5 group-hover:scale-105 transition">
                  <UserPlus size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">Add Customer</span>
              </button>

              {/* Action 3: Record Payment */}
              <button
                type="button"
                onClick={() => onNavigateTab?.('edit')}
                className="flex flex-col items-center text-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850/60 rounded-2xl border border-slate-150 dark:border-slate-800 transition cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2.5 group-hover:scale-105 transition">
                  <CreditCard size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">Record Payment</span>
              </button>

              {/* Action 4: View Reports */}
              <button
                type="button"
                onClick={() => onNavigateTab?.('ai-assistant')}
                className="flex flex-col items-center text-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850/60 rounded-2xl border border-slate-150 dark:border-slate-800 transition cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 mb-2.5 group-hover:scale-105 transition">
                  <BarChart3 size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">View Reports</span>
              </button>

            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Invoices</h3>
              </div>
              <button 
                type="button" 
                onClick={() => alert("Please use the global search filter in the toolbar to isolate records.")}
                className="text-[11px] text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Invoices List table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Invoice</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        No active invoices registered. Click "+ Create" above to initialize sequences.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.slice(0, 5).map((inv) => {
                      const { grandTotal, balanceDue } = calculateInvoiceTotals(inv);
                      const status = balanceDue <= 0 ? 'Paid' : 'Unpaid';
                      const currencySymbol = getCurrencySymbol(inv.currency);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 group transition">
                          <td className="py-3 px-5 font-mono font-extrabold text-[#2563EB] dark:text-blue-400 select-all">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-5 font-semibold text-slate-800 dark:text-slate-100">
                            {inv.customer.name || 'Walk-in Consumer'}
                          </td>
                          <td className="py-3 px-5 text-slate-400">
                            {inv.date}
                          </td>
                          <td className="py-3 px-5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-5 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-lg ${
                              status === 'Paid'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900'
                                : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-450 border border-blue-100 dark:border-blue-900'
                            }`}>
                              {status === 'Paid' ? 'Paid' : 'Sent'}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => onSelectInvoice(inv)}
                              className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDuplicateInvoice(inv.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition inline-flex items-center justify-center align-middle"
                              title="Duplicate"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => onDeleteInvoice(inv.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition inline-flex items-center justify-center align-middle"
                              title="Delete permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (Cash Flow Overview + Upcoming Payments) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Cash Flow Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Flow Overview</h3>
              <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg text-slate-600">
                This Month
              </span>
            </div>

            {/* Donut layout with percentage inside */}
            <div className="flex items-center justify-center py-6 relative">
              <svg className="w-36 h-36" viewBox="0 0 100 100">
                {/* Gray placeholder outer track */}
                <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="8" fill="none" className="dark:stroke-slate-800" />
                {/* Inflow colored portion track */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#10B981" 
                  strokeWidth="8.5" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="85" 
                  strokeLinecap="round" 
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">66%</span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Net Inflow</span>
              </div>
            </div>

            {/* Inflow vs Outflow breakdowns */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Inflow
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {cSym}27,560,000
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  Outflow
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {cSym}9,430,000
                </span>
              </div>
              
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Cash Flow</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                  {cSym}18,130,000
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Payments</h3>
              <span className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">View All</span>
            </div>

            <div className="space-y-3">
              {/* Client 1 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-center justify-between transition hover:border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-600 select-none">
                    NT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Nexus Tech Ltd</h4>
                    <span className="text-[9px] text-slate-400 font-mono block">INV-2024-0157</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{cSym}2,650,000</span>
                  <span className="text-[9px] text-amber-600 font-bold block">Due in 3 days</span>
                </div>
              </div>

              {/* Client 2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-center justify-between transition hover:border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-600 select-none">
                    SB
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Stellar Builders</h4>
                    <span className="text-[9px] text-slate-400 font-mono block">INV-2024-0158</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{cSym}1,750,000</span>
                  <span className="text-[9px] text-amber-600 font-bold block">Due in 7 days</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Micro tooltip helper to prevent code duplication
function HelpCircleTooltip({ content }: { content: string }) {
  return (
    <div className="group relative inline-block cursor-help select-none">
      <span className="inline-flex w-3.5 h-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full items-center justify-center font-serif text-[9px] font-bold">i</span>
      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg leading-normal shadow-md z-30 font-medium">
        {content}
      </div>
    </div>
  );
}
