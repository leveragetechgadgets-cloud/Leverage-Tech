export type CurrencyType = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface CompanySettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  tin: string;
  logo: string; // base64
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentInstructions: string;
  watermark: string; // base64
}

export interface CustomerDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  reference: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string; // e.g. INV-1001
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: CurrencyType;
  customer: CustomerDetails;
  items: InvoiceItem[];
  vatPercent: number; // e.g. 7.5
  taxPercent: number; // custom tax %
  discountPercent: number; // discount %
  discountAmount: number; // custom discount absolute
  transportationCost: number;
  serviceCharge: number;
  paidAmount: number;
  terms: string;
  sellerSignature: string; // base64 or drawn canvas path
  buyerSignature: string; // base64 or drawn canvas path
  isReceiptMode: boolean;
  status: 'Paid' | 'Unpaid' | 'Outstanding';
  themeColor: string; // hex colour for enterprise branding
}

export interface AppState {
  currentInvoice: Invoice;
  invoiceHistory: Invoice[];
  companySettings: CompanySettings;
}
