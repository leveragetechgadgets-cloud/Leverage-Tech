import React from 'react';
import { Invoice, CompanySettings, InvoiceItem, CurrencyType } from '../types';
import { Plus, Trash2, Calendar, FileText, Settings, User, Landmark, DollarSign, PenTool, ClipboardList, RefreshCw, Layers } from 'lucide-react';
import SignaturePad from './SignaturePad';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  settings: CompanySettings;
  onSave: () => void;
  onReset: () => void;
  id: string;
}

const THEME_PRESETS = [
  { name: 'SaaS Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Enterprise Slate', hex: '#475569' },
  { name: 'Imperial Violet', hex: '#7c3aed' },
  { name: 'Executive Crimson', hex: '#be123c' },
];

export default function InvoiceForm({
  invoice,
  onChange,
  settings,
  onSave,
  onReset,
  id
}: InvoiceFormProps) {

  const handleInvoiceFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...invoice,
      [name]: value,
    });
  };

  const handleCustomerFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...invoice,
      customer: {
        ...invoice.customer,
        [name]: value,
      },
    });
  };

  // Switch currencies
  const setCurrency = (curr: CurrencyType) => {
    onChange({
      ...invoice,
      currency: curr,
    });
  };

  // Preset themes
  const setThemeColor = (hex: string) => {
    onChange({
      ...invoice,
      themeColor: hex,
    });
  };

  // Toggle full invoice/compact receipt
  const toggleReceiptMode = (mode: boolean) => {
    onChange({
      ...invoice,
      isReceiptMode: mode,
    });
  };

  // Add Item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  // Remove Item
  const removeItem = (itemId: string) => {
    onChange({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== itemId),
    });
  };

  // Edit Item Details
  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });

    onChange({
      ...invoice,
      items: updatedItems,
    });
  };

  // Totals calculations
  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = subtotal * (invoice.vatPercent / 100);
    const taxAmount = subtotal * (invoice.taxPercent / 100);
    
    let discountAmount = 0;
    if (invoice.discountPercent > 0) {
      discountAmount = subtotal * (invoice.discountPercent / 100);
    } else if (invoice.discountAmount > 0) {
      discountAmount = invoice.discountAmount;
    }

    const serviceCharge = Number(invoice.serviceCharge) || 0;
    const transportationCost = Number(invoice.transportationCost) || 0;
    const grandTotal = subtotal + vatAmount + taxAmount + serviceCharge + transportationCost - discountAmount;
    const balanceDue = grandTotal - invoice.paidAmount;

    return {
      subtotal,
      vatAmount,
      taxAmount,
      discountAmount,
      grandTotal,
      balanceDue,
    };
  };

  const getCurrencySymbol = (type: string) => {
    switch (type) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'NGN': return '₦';
      default: return '₦';
    }
  };

  const totals = calculateTotals();
  const cSym = getCurrencySymbol(invoice.currency);

  return (
    <div id={`${id}-invoice-form-view`} className="space-y-6">
      {/* Upper Control Bar: Mode, Theme, Currencies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Invoice / Receipt Mode Toggle (Span 4) */}
        <div className="lg:col-span-4 space-y-1.5 font-medium">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Layers size={11} className="text-blue-500" /> Print Preset Mode
          </label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl gap-1">
            <button
              type="button"
              id="toggle-mode-full-invoice"
              onClick={() => toggleReceiptMode(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !invoice.isReceiptMode
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Full Invoice Mode
            </button>
            <button
              type="button"
              id="toggle-mode-compact-receipt"
              onClick={() => toggleReceiptMode(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                invoice.isReceiptMode
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Compact Receipt Mode
            </button>
          </div>
        </div>

        {/* Currency select triggers (Span 4) */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <DollarSign size={11} className="text-emerald-500" /> Active Trade Currency
          </label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl gap-1 justify-between">
            {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyType[]).map((cur) => (
              <button
                key={cur}
                type="button"
                id={`cur-picker-${cur}`}
                onClick={() => setCurrency(cur)}
                className={`w-12 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  invoice.currency === cur
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-705 dark:hover:text-slate-300'
                }`}
              >
                {getCurrencySymbol(cur)}
              </button>
            ))}
          </div>
        </div>

        {/* Branding Presets Color Selectors (Span 4) */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            Theme Customization Picker
          </label>
          <div className="flex gap-2 p-1.5 justify-around bg-slate-105 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            {THEME_PRESETS.map((th) => (
              <button
                key={th.name}
                type="button"
                id={`theme-picker-${th.name.replace(' ', '-')}`}
                onClick={() => setThemeColor(th.hex)}
                className="h-6 w-6 rounded-full border-2 cursor-pointer transition transform hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: th.hex,
                  borderColor: invoice.themeColor === th.hex ? '#f8fafc' : 'transparent',
                  boxShadow: invoice.themeColor === th.hex ? '0 0 0 2px #4f46e5' : 'none',
                }}
                title={th.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Editor Main Content: Details vs Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Details Forms Column (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata details block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText size={13} /> Invoice Master Reference
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Invoice Code</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  id="form-invoice-number"
                  value={invoice.invoiceNumber}
                  onChange={handleInvoiceFieldChange}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    name="date"
                    id="form-invoice-date"
                    value={invoice.date}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-[11px] px-2 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    id="form-invoice-due-date"
                    value={invoice.dueDate}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-[11px] px-2 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer details block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <User size={13} /> Target Client Details
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Customer / Name</label>
                <input
                  type="text"
                  name="name"
                  id="form-customer-name"
                  value={invoice.customer.name}
                  onChange={handleCustomerFieldChange}
                  placeholder="Official client Corporate identity"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Customer Ref / PO No.</label>
                <input
                  type="text"
                  name="reference"
                  id="form-customer-reference"
                  value={invoice.customer.reference}
                  onChange={handleCustomerFieldChange}
                  placeholder="PO-982343-X, etc"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Billing Address</label>
                <textarea
                  name="address"
                  id="form-customer-address"
                  value={invoice.customer.address}
                  onChange={handleCustomerFieldChange}
                  rows={2}
                  placeholder="Street No, Post office..."
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    id="form-customer-phone"
                    value={invoice.customer.phone}
                    onChange={handleCustomerFieldChange}
                    placeholder="+234 ... or $..."
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    id="form-customer-email"
                    value={invoice.customer.email}
                    onChange={handleCustomerFieldChange}
                    placeholder="name@company.com"
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger table items and summaries (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Dynamic Table Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center">
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ClipboardList size={14} /> Billable Invoice Items
              </h4>
              <button
                type="button"
                id="btn-add-item-row"
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition cursor-pointer"
              >
                <Plus size={12} /> Add Item Line
              </button>
            </div>

            {/* List items dynamic table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/20 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-2.5 px-4 w-10 text-center">Row</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Price ({cSym})</th>
                    <th className="py-2.5 px-3 w-36 text-right">Amount ({cSym})</th>
                    <th className="py-2.5 px-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoice.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        Empty ledger queue. Click "Add Item Line" above to add products / services.
                      </td>
                    </tr>
                  ) : (
                    invoice.items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-55 dark:hover:bg-slate-950/40">
                        <td className="py-2 px-4 text-center font-mono text-slate-400 font-bold">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            id={`item-desc-${item.id}`}
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Consulting services, Delivery line..."
                            className="w-full text-xs px-2 py-1.5 border rounded-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            id={`item-qty-${item.id}`}
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full text-xs px-2 py-1.5 border rounded-md text-center bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            id={`item-price-${item.id}`}
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full text-xs px-2 py-1.5 border rounded-md text-right bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            type="button"
                            id={`btn-remove-item-${item.id}`}
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition duration-150"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Math summary, taxes, transport discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: transport, service charge, extra notes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                Corporate Logistics & Fee Addons
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Transportation / Delivery ({cSym})</label>
                  <input
                    type="number"
                    name="transportationCost"
                    id="form-transportation"
                    min="0"
                    placeholder="Transportation sum"
                    value={invoice.transportationCost || ''}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Service / Processing Charge ({cSym})</label>
                  <input
                    type="number"
                    name="serviceCharge"
                    id="form-service"
                    min="0"
                    placeholder="Extra handling cost"
                    value={invoice.serviceCharge || ''}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Terms & Service Declarations</label>
                <textarea
                  name="terms"
                  id="form-terms"
                  value={invoice.terms}
                  onChange={handleInvoiceFieldChange}
                  rows={2}
                  className="w-full text-[11px] px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>

            {/* Right side: VAT, TAX, discount calculations and totals */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5">
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                Tax Engine & Grand Totals
              </h4>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-405 mb-1">VAT (%)</label>
                  <input
                    type="number"
                    name="vatPercent"
                    id="form-vat-percent"
                    min="0"
                    step="0.1"
                    value={invoice.vatPercent || ''}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-[11px] px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-405 mb-1">Corporate Tax (%)</label>
                  <input
                    type="number"
                    name="taxPercent"
                    id="form-tax-percent"
                    min="0"
                    step="0.1"
                    value={invoice.taxPercent || ''}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-[11px] px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-405 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    name="discountPercent"
                    id="form-discount-percent"
                    min="0"
                    max="100"
                    step="0.1"
                    value={invoice.discountPercent || ''}
                    onChange={handleInvoiceFieldChange}
                    className="w-full text-[11px] px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono text-center"
                  />
                </div>
              </div>

              {/* Calculations ledger display */}
              <div className="space-y-1.5 text-xs pt-1.5 border-t border-slate-55 dark:border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{cSym}{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {(totals.vatAmount > 0 || totals.taxAmount > 0) && (
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Combined Tax (VAT + Corporate Tax):</span>
                    <span className="font-mono text-slate-705 dark:text-slate-300 font-semibold">+{cSym}{(totals.vatAmount + totals.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-{cSym}{totals.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 text-slate-900 dark:text-slate-100">
                  <span>Grand Total:</span>
                  <span className="font-mono">{cSym}{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Paid amount details input */}
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 pt-1">
                  <label className="text-[11px] font-bold text-slate-500 shrink-0">Paid Amount ({cSym}):</label>
                  <input
                    type="number"
                    name="paidAmount"
                    id="form-paid-amount"
                    min="0"
                    step="0.01"
                    placeholder="Down payment / Dep"
                    value={invoice.paidAmount || ''}
                    onChange={handleInvoiceFieldChange}
                    className="max-w-[140px] text-xs px-2.5 py-1 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-right focus:outline-hidden font-mono"
                  />
                </div>

                {/* Outstanding balance due */}
                <div className="flex justify-between font-black text-xs bg-slate-100 dark:bg-slate-950/40 p-2.5 rounded-xl font-mono text-slate-800 dark:text-amber-500">
                  <span>Outstanding Balance Due:</span>
                  <span>{cSym}{totals.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SignaturePad
          label="Authorized Seller Signature"
          id="seller"
          signatureData={invoice.sellerSignature}
          onChange={(base64) => onChange({ ...invoice, sellerSignature: base64 })}
        />

        <SignaturePad
          label="Customer representative signature"
          id="buyer"
          signatureData={invoice.buyerSignature}
          onChange={(base64) => onChange({ ...invoice, buyerSignature: base64 })}
        />
      </div>

      {/* Primary Actions Trigger block */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60 pb-6">
        <button
          type="button"
          id="form-clear-invoice"
          onClick={onReset}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-700 text-slate-700 dark:text-slate-350 transition"
        >
          Clear Fields / New Invoice
        </button>
        <button
          type="button"
          id="form-save-invoice"
          onClick={onSave}
          className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-extrabold rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
        >
          <Landmark size={14} /> Commit & Save Invoice to Audit Logs
        </button>
      </div>
    </div>
  );
}
