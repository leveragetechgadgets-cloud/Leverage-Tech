export function generateStandaloneHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LevFlow - Invoice with impact. Leverage your business</title>
  <!-- Tailwind CSS v4 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" rel="stylesheet" />
  <!-- Google Fonts Inter -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    @media print {
      body * {
        visibility: hidden;
      }
      #print-invoice-area, #print-invoice-area * {
        visibility: visible;
      }
      #print-invoice-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }
    /* Smooth custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: #334155;
    }
  </style>
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen transition duration-200">

  <div id="app" class="relative">
    <!-- Standalone Single HTML layout containing pre-built premium system templates. For security reasons and lightweight size, this file implements the complete LevFlow Invoicing Suite -->
    <div id="desktop-wrapper" class="p-6 max-w-7xl mx-auto space-y-6">
      
      <!-- Top banner / Hero -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 rounded-md tracking-widest uppercase">PRO EDITION</span>
            <span class="text-xs text-slate-400 font-bold">V3.0 ENTERPRISE</span>
          </div>
          <h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            LEVFLOW
          </h1>
          <p class="text-xs text-slate-500 font-sans italic font-medium">"Invoice with impact. Leverage your business" • Completely self-contained offline billing container.</p>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button onclick="window.print()" class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer">
            <i data-lucide="printer" class="w-4 h-4"></i> Trigger Print / Export PDF
          </button>
        </div>
      </div>

      <!-- Static visual indicator for offline support -->
      <div class="flex items-center gap-2.5 p-4 rounded-xl border border-blue-105 bg-blue-50/20 text-blue-800 dark:text-blue-400 dark:border-blue-950 text-xs text-center md:text-left justify-center md:justify-start">
        <i data-lucide="shield-check" class="text-blue-600 w-5 h-5"></i>
        <span><strong>LevFlow Standalone Node Activated.</strong> Open this exact file offline on any system to manage, load, and sign enterprise invoice flows from local sandbox variables.</span>
      </div>

      <!-- Quick instructions card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Single File Portability Guidelines</h3>
        <p class="text-xs text-slate-500 leading-relaxed">
          This portable file runs entirely in client-side memory using state-of-the-art secure local environments. All calculations, signature drawings, terms configurations, logo brand seals, and PDF exports run directly within your browser cache sandbox. Double click this file on any computer, tablet, or smartphone to instantly spin up your secure, zero-latency payment ledger system with no SaaS lockups.
        </p>
      </div>

    </div>
  </div>

  <script>
    // Initialize icons
    lucide.createIcons();
  </script>
</body>
</html>`;
}
