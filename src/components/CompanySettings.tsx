import React, { useRef } from 'react';
import { CompanySettings as CompanySettingsType } from '../types';
import { Building2, Mail, Phone, Globe, FileText, Landmark, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CompanySettingsProps {
  settings: CompanySettingsType;
  onChange: (settings: CompanySettingsType) => void;
  id: string;
}

export default function CompanySettings({ settings, onChange, id }: CompanySettingsProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...settings,
      [name]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...settings,
          logo: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onChange({
      ...settings,
      logo: '',
    });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...settings,
          watermark: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeWatermark = () => {
    onChange({
      ...settings,
      watermark: '',
    });
    if (watermarkInputRef.current) watermarkInputRef.current.value = '';
  };

  return (
    <div id={`${id}-settings-form`} className="space-y-6">
      {/* Visual Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-1 px-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400 font-bold text-xs">V3</div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Enterprise Company Profile & Bank Details</h3>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Business Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Building2 size={13} /> Corporate Identity
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="settings-company-name"
                  value={settings.name}
                  onChange={handleTextChange}
                  placeholder="e.g. Leverage Tech Ltd"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Business Address</label>
              <textarea
                name="address"
                id="settings-company-address"
                value={settings.address}
                onChange={handleTextChange}
                rows={2}
                placeholder="Corporate Headquarters, Street address..."
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tax ID / TIN</label>
                <input
                  type="text"
                  name="tin"
                  id="settings-company-tin"
                  value={settings.tin}
                  onChange={handleTextChange}
                  placeholder="RC-1234567"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Official Email</label>
                <input
                  type="email"
                  name="email"
                  id="settings-company-email"
                  value={settings.email}
                  onChange={handleTextChange}
                  placeholder="billing@leverage.com"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Support Phone</label>
                <input
                  type="text"
                  name="phone"
                  id="settings-company-phone"
                  value={settings.phone}
                  onChange={handleTextChange}
                  placeholder="+234 800..."
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Website URL</label>
                <input
                  type="text"
                  name="website"
                  id="settings-company-website"
                  value={settings.website}
                  onChange={handleTextChange}
                  placeholder="www.leverage.com"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking and Branding Settigns */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Landmark size={13} /> Financial Clearance
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                id="settings-bank-name"
                value={settings.bankName}
                onChange={handleTextChange}
                placeholder="e.g. Access Bank Pls, Sterling Bank"
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Account Name & Sort</label>
                <input
                  type="text"
                  name="accountName"
                  id="settings-account-name"
                  value={settings.accountName}
                  onChange={handleTextChange}
                  placeholder="Corporate Account"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  id="settings-account-number"
                  value={settings.accountNumber}
                  onChange={handleTextChange}
                  placeholder="10 Main Digit Number..."
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Instant Payment Instructions</label>
              <input
                type="text"
                name="paymentInstructions"
                id="settings-payment-instructions"
                value={settings.paymentInstructions}
                onChange={handleTextChange}
                placeholder="Please state Quote / Invoice number as receipt narrative"
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Logo and Watermark settings row */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  Logo Branding <ImageIcon size={11} className="text-blue-500" />
                </label>
                {settings.logo ? (
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-between group overflow-hidden">
                    <img src={settings.logo} className="h-10 max-w-[100px] object-contain rounded-md" alt="Branding" />
                    <button
                      type="button"
                      id="settings-clear-logo"
                      onClick={removeLogo}
                      className="text-[10px] text-rose-500 font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 bg-slate-50/50 dark:bg-slate-950/30 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-800/85 transition">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">Click to select Logo</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  Watermark Seal <Sparkles size={11} className="text-amber-500" />
                </label>
                {settings.watermark ? (
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-between group overflow-hidden">
                    <img src={settings.watermark} className="h-10 max-w-[100px] object-contain opacity-40 rounded-md" alt="Watermark" />
                    <button
                      type="button"
                      id="settings-clear-watermark"
                      onClick={removeWatermark}
                      className="text-[10px] text-rose-500 font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 bg-slate-50/50 dark:bg-slate-950/30 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-800/85 transition">
                    <input
                      type="file"
                      ref={watermarkInputRef}
                      onChange={handleWatermarkUpload}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">Click to upload Seal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
