import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Phone, Shield, Sparkles, AlertCircle, MessageCircle, Send, Check, ChevronDown, ChevronUp, Headphones } from 'lucide-react';
import LogoSvg from './LogoSvg';

interface LoginGateProps {
  onSuccess: (user: { name: string; email: string }) => void;
  id: string;
}

export default function LoginGate({ onSuccess, id }: LoginGateProps) {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [showRecovery, setShowRecovery] = useState<boolean>(false);
  const [showSupport, setShowSupport] = useState<boolean>(false);
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Recovery States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Validation messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('leverage-registered-user');
    if (savedUser) {
      setIsRegistered(true);
      try {
        const parsed = JSON.parse(savedUser);
        setLoginEmail(parsed.email || '');
      } catch (err) {
        console.error('Failed to read saved user config', err);
      }
    }
  }, []);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPhone || !regPassword || !regPin) {
      setErrorMsg('Please complete all workstation registration fields.');
      return;
    }

    if (regPin.length < 4) {
      setErrorMsg('Security PIN must be at least 4 digits for recovery.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must accept the workstation storage terms.');
      return;
    }

    const regData = {
      name: regName,
      email: regEmail.toLowerCase().trim(),
      phone: regPhone,
      password: regPassword,
      pin: regPin
    };

    localStorage.setItem('leverage-registered-user', JSON.stringify(regData));
    sessionStorage.setItem('leverage-auth-token', 'operator-' + Math.random().toString(36).substring(2));
    
    setSuccessMsg('Workstation registration complete! Access granted.');
    setTimeout(() => {
      onSuccess({ name: regName, email: regEmail });
    }, 1200);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both registered Email and Password.');
      return;
    }

    const savedUserStr = localStorage.getItem('leverage-registered-user');
    if (!savedUserStr) {
      setErrorMsg('No registered operator found on this system. Please clear cache or register.');
      return;
    }

    try {
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser.email === loginEmail.toLowerCase().trim() && savedUser.password === loginPassword) {
        sessionStorage.setItem('leverage-auth-token', 'operator-' + Math.random().toString(36).substring(2));
        setSuccessMsg('Workstation unlocked. Initiating editor panels...');
        setTimeout(() => {
          onSuccess({ name: savedUser.name, email: savedUser.email });
        }, 1200);
      } else {
        setErrorMsg('Invalid operator credentials. Access denied.');
      }
    } catch (err) {
      setErrorMsg('Corrupt workstation configuration registry.');
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!recoveryEmail || !recoveryPin || !newPassword) {
      setErrorMsg('Please complete all fields for emergency password reset.');
      return;
    }

    const savedUserStr = localStorage.getItem('leverage-registered-user');
    if (!savedUserStr) {
      setErrorMsg('No operator registered on this workstation.');
      return;
    }

    try {
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser.email === recoveryEmail.toLowerCase().trim() && savedUser.pin === recoveryPin) {
        savedUser.password = newPassword;
        localStorage.setItem('leverage-registered-user', JSON.stringify(savedUser));
        setSuccessMsg('Passcode reset completed successfully. You can now Log In!');
        setTimeout(() => {
          setShowRecovery(false);
          setLoginPassword('');
        }, 1500);
      } else {
        setErrorMsg('Incorrect Recovery Email or Security PIN.');
      }
    } catch (err) {
      setErrorMsg('Error rebuilding workstation credentials.');
    }
  };

  // Helper clear
  const triggerResetRegistration = () => {
    if (window.confirm('WARNING: Doing this will clear all local operator registration locks from this device. Do you want to proceed?')) {
      localStorage.removeItem('leverage-registered-user');
      sessionStorage.removeItem('leverage-auth-token');
      setIsRegistered(false);
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegPin('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  return (
    <div id={`${id}-gate-overlay`} className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[580px]">
        
        {/* Left column - Geometric Balance Brand & Support Presentation */}
        <div className="w-full md:w-5/12 bg-[#0F172A] text-white p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
          
          {/* Geometric elements overlays (Theme accents) */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-600/5 rounded-tr-full pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <LogoSvg size={32} className="text-blue-500 shrink-0" />
              <span className="text-sm font-black tracking-widest uppercase">LEV<span className="text-blue-400">FLOW</span> V3</span>
            </div>

            <div className="space-y-3 font-sans">
              <h1 className="text-xl font-black uppercase tracking-tight leading-tight pt-4">
                LevFlow Workstation
              </h1>
              <p className="text-xs text-blue-300 font-semibold italic">
                "Invoice with impact. Leverage your business"
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                Enterprise-grade client-side encryption keeps all of your customer databases, signatures, and transaction registers completely isolated on your hardware.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>No preloaded dummy data</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>100% data ownership protection</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Audit list, automated VAT & Signature Pads</span>
              </div>
            </div>
          </div>

          {/* Prompt/Support segment with directly clickable links */}
          <div className="pt-8 border-t border-white/10 mt-6 relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Direct Operator Support</p>
              <button
                type="button"
                onClick={() => setShowSupport(!showSupport)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg text-slate-300 transition cursor-pointer font-sans select-none"
              >
                <Headphones size={11} className="text-blue-400" />
                <span>{showSupport ? 'Hide Support' : 'Show Support'}</span>
                {showSupport ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {showSupport ? (
              <div className="space-y-3 pt-1 animate-fade-in">
                <p className="text-[11px] text-slate-400">If you require setup guidance or need to restore an offline backup, contact our specialized corporate support desks:</p>
                <div className="space-y-2.5">
                  <a 
                    href="https://wa.me/2349139293333" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 transition cursor-pointer"
                  >
                    <MessageCircle size={14} className="text-emerald-400" />
                    <div className="text-left font-mono">
                      <span className="block text-[9px] text-emerald-500/70 font-sans uppercase font-bold leading-none">WhatsApp Support</span>
                      <span className="text-[11px] font-bold">+234 913 929 3333</span>
                    </div>
                  </a>

                  <a 
                    href="mailto:leveragetechgadgets@gmail.com"
                    className="flex items-center gap-2 p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-xs text-blue-400 transition cursor-pointer"
                  >
                    <Mail size={14} className="text-blue-400" />
                    <div className="text-left font-mono">
                      <span className="block text-[9px] text-blue-400/70 font-sans uppercase font-bold leading-none">Email Helpdesk</span>
                      <span className="text-[11px] shrink-0 font-bold text-[11px] break-all">leveragetechgadgets@gmail.com</span>
                    </div>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400/80 leading-relaxed font-light font-sans">
                Corporate contact lines are hidden for workspace minimalism. Use the button above to access WhatsApp & Helpdesk.
              </p>
            )}
            
            <p className="text-[9px] text-slate-500 font-mono">V3.0.4 • Workstation ID Node: NGX-9B30</p>
          </div>
        </div>

        {/* Right column - Clean Authentication Panel */}
        <div className="flex-1 p-8 flex flex-col justify-center bg-white">
          
          {/* Status alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fade-in font-medium">
              <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2 animate-fade-in font-medium">
              <Sparkles size={15} className="shrink-0 text-emerald-500 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: Recovery Process */}
          {showRecovery ? (
            <form onSubmit={handleRecoverySubmit} className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold uppercase tracking-wider">Device Level Rescue Recovery</span>
                <h2 className="text-lg font-bold text-slate-800 uppercase mt-1">Reset Workstation Passcode</h2>
                <p className="text-xs text-slate-500 leading-normal">Enter your master record email and the unique 4-digit security PIN set during workstation creation.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Corporate Email Address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="e.g. operator@leverage.com"
                      className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Security PIN</label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      value={recoveryPin}
                      onChange={(e) => setRecoveryPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 8829"
                      className="w-full text-center text-xs py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Configure New Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Send size={12} /> Rewrite Master Credentials
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setErrorMsg('');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-medium transition cursor-pointer text-center"
                >
                  Cancel and Return
                </button>
              </div>
            </form>
          ) : isRegistered ? (
            /* Mode 2: Sign In Gate */
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900 uppercase">Operator Sign In</h2>
                <p className="text-xs text-slate-500">Authenticate session to load your offline invoice catalog sheets.</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Work Email Address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="operator@leverage.com"
                      className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Workstation Passcode</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecovery(true);
                        setErrorMsg('');
                        setRecoveryEmail(loginEmail);
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot? Reset with PIN
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer transition-all uppercase tracking-wider"
                >
                  Unlock Workstation
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={triggerResetRegistration}
                  className="text-[9px] text-slate-400 hover:text-rose-500 transition cursor-pointer uppercase font-bold"
                >
                  Register new operator
                </button>
                <span className="text-[9px] text-slate-300 font-mono">Secured with AES-Local Block</span>
              </div>
            </form>
          ) : (
            /* Mode 3: Master Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[9px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest">Initial System Registry</span>
                <h2 className="text-base font-bold text-slate-900 uppercase mt-1">Register New Offline Workstation</h2>
                <p className="text-xs text-slate-500">Initiate a secure workspace on this browser container. No data is sent to external clouds.</p>
              </div>

              <div className="space-y-3.5 pt-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Operator Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Nexus Accounts Officer"
                      className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Work Email</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@leverage.com"
                        className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Workstation Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1" title="Used to recover/reset password offline">Recovery PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 8829"
                      className="w-full text-center text-xs py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono text-slate-850"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 font-medium select-none">
                  <input
                    type="checkbox"
                    id="chk-terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="chk-terms" className="text-[10px] text-slate-500 leading-tight">
                    I agree that my billing records are saved purely inside this local browser container storage. Clearing cookies/history can delete unsaved data unless a JSON backup is exported.
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer transition-all uppercase tracking-wider"
                >
                  Generate Private Workstation
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistered(true);
                    setErrorMsg('');
                  }}
                  className="text-[10px] text-slate-500 hover:text-blue-600 transition font-bold uppercase"
                >
                  Already registered? Sign In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
