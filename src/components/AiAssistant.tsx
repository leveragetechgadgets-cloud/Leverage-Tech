import React, { useState, useRef, useEffect } from "react";
import { Invoice, CompanySettings } from "../types";
import { Sparkles, Send, Bot, User, Brain, AlertCircle, FilePlus2, Check, RefreshCw } from "lucide-react";

interface AiAssistantProps {
  invoices: Invoice[];
  onDraftCreated: (draftData: any) => void;
  currency: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  isDraftCard?: boolean;
  draftData?: any;
}

export default function AiAssistant({ invoices, onDraftCreated, currency }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am your **LevFlow AI Assistant**. I can help you analyze invoice records, calculate transaction sum, or draft brand new invoice documents using natural language!\n\n**Try a quick command below, or write your own prompts:**"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draftPromptText, setDraftPromptText] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getCompanySummary = () => {
    const totalTransactions = invoices.reduce((sum, inv) => {
      const subtotal = inv.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
      const vat = subtotal * (inv.vatPercent / 100);
      const tax = subtotal * (inv.taxPercent / 100);
      const service = Number(inv.serviceCharge) || 0;
      const transport = Number(inv.transportationCost) || 0;
      const discount = inv.discountPercent > 0 ? subtotal * (inv.discountPercent / 100) : (inv.discountAmount || 0);
      return sum + (subtotal + vat + tax + service + transport - discount);
    }, 0);

    const paidSum = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
    const outstanding = totalTransactions - paidSum;

    return {
      worsktationStats: {
        totalInvoiceRecordsCount: invoices.length,
        aggregatedRevenueCalculated: totalTransactions,
        totalPaidAmount: paidSum,
        totalOutstandingDebtAmount: outstanding,
        currencySymbolUsed: currency,
      },
      recentActiveLedgers: invoices.map(i => ({
        invoiceId: i.invoiceNumber,
        customerName: i.customer.name,
        dateIssued: i.date,
        dueBy: i.dueDate,
        billedItems: i.items.map(it => `${it.description} (Qty: ${it.quantity} x Price: ${it.unitPrice})`),
        paidStatus: (i.paidAmount >= i.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0)) ? "Paid" : "Unpaid"
      }))
    };
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const companyContext = getCompanySummary();
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          companyContext
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `⚠️ Failed to execute: ${data.error || "The workstation AI server is currently starting up, please wait a moment."}` 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "⚠️ Connecting to server failed. Please wait for the application development server to boot." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartDraft = async (prompt: string) => {
    if (!prompt.trim() || isDrafting) return;
    setIsDrafting(true);
    
    // Add user message to log
    setMessages(prev => [...prev, {
      role: "user",
      content: `Create an invoice draft sequence for: "${prompt}"`
    }]);

    try {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      if (res.ok && data.customerName) {
        const itemSlices = data.items || [];
        const breakdownText = itemSlices.map((it: any) => `- **${it.description}**: ${it.quantity} unit(s) x ₦${it.unitPrice.toLocaleString()}`).join("\n");
        const summaryText = `I have successfully tokenized your prompt and generated a structured invoice layout!\n\n**Client Info:**\n- Customer Name: **${data.customerName}**\n- Email: ${data.email || "N/A"}\n- Phone: ${data.phone || "N/A"}\n- Address: ${data.address || "N/A"}\n\n**Billed Line Items:**\n${breakdownText}\n\n*Click the green button below to apply this draft directly into the invoice workstation editor.*`;
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: summaryText,
          isDraftCard: true,
          draftData: data
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `⚠️ Failed generating structured sequence: ${data.error || "Please verify prompt structure."}`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Tokenizer server is taking offline actions, please wait for connection alignment."
      }]);
    } finally {
      setIsDrafting(false);
      setDraftPromptText("");
    }
  };

  const applyDraftToWorkstation = (draftData: any) => {
    onDraftCreated(draftData);
  };

  const PRESETS = [
    { title: "Calculate Outstanding Sum", desc: "Show outstanding sum and top debtors" },
    { title: "Draft Cloud Coding Contract", desc: "Create draft for 30 hours dev ops work" },
    { title: "Review This Month's Performance", desc: "Analyze transactional logs of ledgers" },
    { title: "Draft Gadgets Supply invoice", desc: "Create draft for Jude Jaala with 5 gadget devices" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] text-slate-800 dark:text-slate-100 font-sans">
      {/* Sidebar Tooltips */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-sm mb-3">
            <Brain size={18} />
            <span>AI Real-time Context</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            LevFlow AI reads active ledger rows securely inside your browser's context. Your credentials, local invoice databases, and clients are guarded securely offline.
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80 rounded-xl">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Indexed Database Size</span>
              <span className="text-lg font-black">{invoices.length} Active Records</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80 rounded-xl">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aggregated Cash-Flow</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {currency}{invoices.reduce((sum, inv) => {
                  const subtotal = inv.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
                  return sum + subtotal;
                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Natural Language Tokenizer */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-sm mb-2">
            <Sparkles size={16} />
            <span>Smart Invoice Draft Builder</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Describe billing deliverables. AI converts descriptions to clean structured items.
          </p>
          <div className="space-y-2">
            <textarea
              value={draftPromptText}
              onChange={(e) => setDraftPromptText(e.target.value)}
              placeholder="e.g. Generate invoice for Chevron Tech, 4 smart controllers and design phase fee of 120000"
              className="w-full text-xs p-3 border rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-150 focus:outline-none min-h-[90px] resize-none"
            />
            <button
              onClick={() => handleSmartDraft(draftPromptText)}
              disabled={!draftPromptText.trim() || isDrafting}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition cursor-pointer select-none"
            >
              {isDrafting ? <RefreshCw size={13} className="animate-spin" /> : <FilePlus2 size={13} />}
              <span>{isDrafting ? "Analyzing Tokenized Stream..." : "Compile Smart Invoice Draft"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Chat Box */}
      <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Chat top info */}
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider leading-none">Interactive Billing Hub</h3>
              <span className="text-[10px] text-slate-500">Gemini model sequence live diagnostics active</span>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
            CONNECTED
          </span>
        </div>

        {/* Chat message logger */}
        <div className="flex-1 p-5 overflow-y-auto max-h-[420px] min-h-[350px] space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 select-none">
                  <Bot size={15} />
                </div>
              )}
              
              <div className="space-y-2 max-w-[85%]">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line border shadow-xs ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                    : "bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-350 border-slate-150 dark:border-slate-850/80 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>

                {/* Direct Action Card */}
                {msg.isDraftCard && msg.draftData && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-in">
                    <div className="text-left">
                      <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider leading-none">Authorization Queue</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Authorize draft to initialize invoice sheets for **{msg.draftData.customerName}**</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyDraftToWorkstation(msg.draftData)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer select-none whitespace-nowrap transition"
                    >
                      <Check size={11} />
                      <span>Authorize Draft & Edit</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 select-none font-bold text-[10px]">
                  OP
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 animate-spin shrink-0">
                <Bot size={15} />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                Analyzing workstation ledgers...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Inputs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Preset Buttons */}
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide select-none">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.title)}
                className="text-[10px] whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-550 text-slate-600 dark:text-slate-350 cursor-pointer transition flex items-center gap-1"
              >
                <Sparkles size={10} className="text-blue-500 shrink-0" />
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AI accountant or key-in auditing queries..."
              className="flex-1 text-xs px-3.5 py-2.5 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-150 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
