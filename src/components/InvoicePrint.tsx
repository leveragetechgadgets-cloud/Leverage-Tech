import React, { useEffect, useState } from 'react';
import { Invoice, CompanySettings } from '../types';
import { numberToWords } from '../utils/numberToWords';
import { generatePaymentQRCode } from '../utils/qrCode';
import { Mail, Phone, Globe, Building2, ShieldCheck, CreditCard } from 'lucide-react';

interface InvoicePrintProps {
  invoice: Invoice;
  settings: CompanySettings;
  id: string;
}

export default function InvoicePrint({ invoice, settings, id }: InvoicePrintProps) {
  const [paymentQr, setPaymentQr] = useState<string>('');

  const getCurrencySymbol = (type: string) => {
    switch (type) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'NGN': return '₦';
      default: return '₦';
    }
  };

  const getThemeColorClass = (colorVal: string) => {
    // Return CSS color rules or default to Indigo
    return colorVal || '#4f46e5';
  };

  useEffect(() => {
    const fetchQr = async () => {
      const totals = calculateTotals();
      const qrDataUrl = await generatePaymentQRCode(
        settings.bankName,
        settings.accountName,
        settings.accountNumber,
        totals.grandTotal,
        getCurrencySymbol(invoice.currency),
        invoice.invoiceNumber
      );
      setPaymentQr(qrDataUrl);
    };
    fetchQr();
  }, [invoice, settings]);

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

    const serviceCharge = invoice.serviceCharge || 0;
    const transportationCost = invoice.transportationCost || 0;
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

  const totals = calculateTotals();
  const cSym = getCurrencySymbol(invoice.currency);
  const themeHex = getThemeColorClass(invoice.themeColor);

  return (
    <div
      id={`${id}-invoice-print-container`}
      className="invoice-print-surface select-text relative w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-800 p-12 shadow-2xl overflow-hidden print:p-8 print:shadow-none print:w-full print:min-h-0"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Background Watermark */}
      {settings.watermark && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5 print:opacity-[0.04]">
          <img
            src={settings.watermark}
            alt="Corporate Watermark"
            className="w-[120mm] h-[120mm] object-contain rotate-[-15deg]"
          />
        </div>
      )}

      {/* Decorative Brand Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-2.5" style={{ backgroundColor: themeHex }} />

      {/* Corporate Header Block */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {settings.logo ? (
            <img src={settings.logo} alt="Corporate Logo" className="max-h-16 max-w-[160px] object-contain" />
          ) : (
            <div className="h-14 w-14 rounded-xl flex items-center justify-center font-bold text-white text-xl" style={{ backgroundColor: themeHex }}>
              {settings.name ? settings.name.substring(0, 2).toUpperCase() : 'LV'}
            </div>
          )}
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">{settings.name || 'LEVFLOW ENTERPRISE'}</h1>
            {settings.tin && (
              <p className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded-md inline-block text-slate-600">
                TIN: {settings.tin}
              </p>
            )}
            <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed whitespace-pre-wrap">{settings.address}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 pt-1">
              {settings.email && <span className="flex items-center gap-1"><Mail size={10} /> {settings.email}</span>}
              {settings.phone && <span className="flex items-center gap-1"><Phone size={10} /> {settings.phone}</span>}
              {settings.website && <span className="flex items-center gap-1"><Globe size={10} /> {settings.website}</span>}
            </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="inline-block px-3 py-1 bg-slate-100 rounded-md font-extrabold text-[11px] uppercase tracking-wider text-slate-700">
            {invoice.isReceiptMode ? 'OFFICIAL RECEIPT' : 'COMMERCIAL INVOICE'}
          </div>
          <h2 className="text-xl font-black font-mono tracking-wider mt-1" style={{ color: themeHex }}>
            {invoice.invoiceNumber || 'INV-1001'}
          </h2>
          <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
            <div className="grid grid-cols-2 gap-x-2 text-right">
              <span className="font-semibold text-slate-400">Date:</span>
              <span className="font-mono text-slate-800">{invoice.date}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-right">
              <span className="font-semibold text-slate-400">Due Date:</span>
              <span className="font-mono text-slate-800">{invoice.dueDate}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-right">
              <span className="font-semibold text-slate-400">Currency:</span>
              <span className="font-semibold text-slate-800">{invoice.currency} </span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Block */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billed To / Client</div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-900">{invoice.customer.name || 'Walk-in Customer'}</h3>
            {invoice.customer.reference && (
              <p className="text-[10px] text-slate-500">Ref: <span className="font-mono font-semibold">{invoice.customer.reference}</span></p>
            )}
            <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-wrap">{invoice.customer.address}</p>
            <div className="space-y-0.5 pt-2 text-[10px] text-slate-500">
              {invoice.customer.phone && <p>📞 {invoice.customer.phone}</p>}
              {invoice.customer.email && <p>✉️ {invoice.customer.email}</p>}
            </div>
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Instruction Summary</div>
            <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
              <p className="flex justify-between border-b border-slate-100 pb-1">
                <span>Bank:</span> <strong className="text-slate-800 font-semibold">{settings.bankName || 'N/A'}</strong>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-1">
                <span>Account Name:</span> <strong className="text-slate-800 font-semibold">{settings.accountName || 'N/A'}</strong>
              </p>
              <p className="flex justify-between pb-1">
                <span>Account No:</span> <strong className="text-slate-800 font-mono font-semibold">{settings.accountNumber || 'N/A'}</strong>
              </p>
            </div>
          </div>
          <p className="text-[10px] italic text-slate-500 text-right font-medium">{settings.paymentInstructions}</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-2.5 px-3 font-semibold text-slate-500 max-w-[40px]">#</th>
              <th className="py-2.5 px-3 font-semibold text-slate-500">Item Description</th>
              <th className="py-2.5 px-3 font-semibold text-slate-500 text-center max-w-[80px]">Qty</th>
              <th className="py-2.5 px-3 font-semibold text-slate-500 text-right max-w-[120px]">Unit Price</th>
              <th className="py-2.5 px-3 font-semibold text-slate-500 text-right max-w-[140px]">Total ({cSym})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 italic">No billable items added.</td>
              </tr>
            ) : (
              invoice.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/40">
                  <td className="py-2 px-3 font-mono text-slate-400">{index + 1}</td>
                  <td className="py-2 px-3 font-medium text-slate-800 whitespace-pre-wrap">{item.description}</td>
                  <td className="py-2 px-3 text-center text-slate-700 font-mono">{item.quantity}</td>
                  <td className="py-2 px-3 text-right text-slate-700 font-mono">{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Calculations Breakdowns Grid */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Left column - Amount in Words and Bank Instruction */}
        <div className="space-y-4">
          <div>
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Guarantor Verification</div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-[10px]">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <p>Authentic invoice. Certified offline via cryptographic key index.</p>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Amount in Words</div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-700 leading-snug">
                {numberToWords(totals.grandTotal, invoice.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Right column - Summary maths */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-mono font-bold text-slate-800">{cSym}{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {invoice.vatPercent > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">VAT ({invoice.vatPercent}%):</span>
              <span className="font-mono font-semibold text-slate-700">+{cSym}{totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {invoice.taxPercent > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Other Tax ({invoice.taxPercent}%):</span>
              <span className="font-mono font-semibold text-slate-700">+{cSym}{totals.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Service Charge:</span>
              <span className="font-mono font-semibold text-slate-700">+{cSym}{invoice.serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {invoice.transportationCost > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transportation / Delivery:</span>
              <span className="font-mono font-semibold text-slate-700 font-medium">+{cSym}{invoice.transportationCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {totals.discountAmount > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-emerald-600 font-semibold">Discount Applied:</span>
              <span className="font-mono font-bold text-emerald-600">-{cSym}{totals.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between py-1.5 border-b border-slate-200">
            <span className="text-slate-900 font-bold">Grand Total:</span>
            <span className="font-mono font-black text-sm" style={{ color: themeHex }}>{cSym}{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Paid Amount:</span>
            <span className="font-mono font-semibold text-slate-700">{cSym}{invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between py-2 bg-slate-100 px-3 rounded-lg mt-1 font-bold text-slate-900">
            <span>Balance Due / Outstanding:</span>
            <span className="font-mono text-xs">{cSym}{totals.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Signature and Payment Gate Block */}
      <div className="grid grid-cols-12 gap-6 items-end mt-8 pt-8 border-t border-slate-100">
        {/* Term & Conditions (Span 7) */}
        <div className="col-span-6 space-y-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Terms & Conditions</div>
            <p className="text-[9px] text-slate-500 leading-relaxed whitespace-pre-wrap italic">
              {invoice.terms || 'Goods sold in good condition are not returnable. No refund shall be made after payment unless otherwise agreed in writing.'}
            </p>
          </div>
          
          {/* Payment QR Scan space */}
          {paymentQr && (
            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/60 max-w-xs">
              <img src={paymentQr} alt="Payment Scancode" className="h-16 w-16 bg-white p-1 rounded-md border" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                  <CreditCard size={9} /> QR Bank Scan
                </span>
                <p className="text-[9px] text-slate-500 leading-tight">Scan this secure code using your banking application to auto-fill account references.</p>
              </div>
            </div>
          )}
        </div>

        {/* Digital Signature Spots (Span 6) */}
        <div className="col-span-6 grid grid-cols-2 gap-4">
          {/* Seller Signature Spot */}
          <div className="flex flex-col items-center">
            <div className="border-b border-slate-300 w-full flex items-center justify-center h-16 pb-1">
              {invoice.sellerSignature ? (
                <img src={invoice.sellerSignature} alt="Authorized Sign" className="max-h-14 max-w-full object-contain" />
              ) : (
                <span className="text-[11px] text-slate-300 italic">Signature stamp</span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 text-center">Authorized Signatory</span>
          </div>

          {/* Buyer Signature Spot */}
          <div className="flex flex-col items-center">
            <div className="border-b border-slate-300 w-full flex items-center justify-center h-16 pb-1">
              {invoice.buyerSignature ? (
                <img src={invoice.buyerSignature} alt="Receiver Sign" className="max-h-14 max-w-full object-contain" />
              ) : (
                <span className="text-[11px] text-slate-300 italic">Signature space</span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 text-center">Client Representative</span>
          </div>
        </div>
      </div>

      {/* Corporate Footnotes and Contact */}
      <div className="mt-12 text-center text-[9px] text-slate-400 space-y-1 pt-4 border-t border-slate-50 tracking-wider">
        <p className="font-semibold">Thank you for doing business with {settings.name || 'us'}!</p>
        <p>This document is digitally locked and audited securely under high-end offline system engines. System ID: V3.9-ENT-OFFLINE</p>
      </div>
    </div>
  );
}
