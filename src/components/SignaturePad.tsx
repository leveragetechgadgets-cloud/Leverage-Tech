import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Trash2, Upload, AlertCircle, Sparkles } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  signatureData: string; // base64
  onChange: (data: string) => void;
  id: string;
}

export default function SignaturePad({ label, signatureData, onChange, id }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>(signatureData.startsWith('data:image/') ? 'upload' : 'draw');
  const [scale, setScale] = useState<number>(100);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current && !signatureData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Clear background with crisp off-white for nice drawing area
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [mode, signatureData]);

  // Handle start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  // Handle draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Handle stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvas();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is blank before saving
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      onChange('');
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id={`${id}-signature-card`} className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            id={`${id}-tab-draw`}
            onClick={() => {
              setMode('draw');
              onChange('');
            }}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              mode === 'draw'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <PenTool size={12} /> Draw
          </button>
          <button
            type="button"
            id={`${id}-tab-upload`}
            onClick={() => {
              setMode('upload');
              onChange('');
            }}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Upload size={12} /> Upload
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="relative group">
          {signatureData ? (
            <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 h-32">
              <img
                src={signatureData}
                alt={`${label} Preview`}
                className="max-h-24 max-w-full object-contain"
                style={{ transform: `scale(${scale / 100})` }}
              />
              <button
                type="button"
                id={`${id}-btn-re-draw`}
                onClick={clearCanvas}
                className="absolute top-2 right-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 hover:dark:bg-rose-900 border border-rose-300 dark:border-rose-800 p-1.5 rounded-lg text-rose-600 dark:text-rose-400 transition"
                title="Redraw signature"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
              <canvas
                id={`${id}-signature-canvas`}
                ref={canvasRef}
                width={380}
                height={128}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-32 bg-slate-50 dark:bg-slate-950 touch-none cursor-crosshair block"
              />
              <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 flex justify-between items-center text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Sparkles size={10} className="text-blue-500" /> Sign above with touch or cursor</span>
                <button
                  type="button"
                  id={`${id}-canvas-clear`}
                  onClick={clearCanvas}
                  className="hover:text-rose-600 font-medium transition"
                >
                  Clear Pad
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {signatureData ? (
            <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-3 h-32">
              <img
                src={signatureData}
                alt={`${label} Uploaded`}
                className="max-h-20 max-w-full object-contain"
                style={{ transform: `scale(${scale / 100})` }}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  id={`${id}-btn-re-upload`}
                  onClick={() => onChange('')}
                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 hover:dark:bg-rose-900 border border-rose-300 dark:border-rose-800 p-1.5 rounded-lg text-rose-600 dark:text-rose-400 transition"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-700 transition duration-150 rounded-lg bg-slate-50/50 dark:bg-slate-950/30 flex flex-col items-center justify-center h-32 text-center p-4">
              <input
                type="file"
                id={`${id}-signature-upload-input`}
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload size={22} className="text-slate-400 dark:text-slate-600 mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload signature file</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">PNG, JPG, or SVG (transparent works best)</p>
            </div>
          )}
        </div>
      )}

      {signatureData && (
        <div id={`${id}-scale-control`} className="mt-2.5 px-1 py-1 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-lg">
          <span className="text-[10px] font-medium text-slate-500">Signature Size:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={`${id}-signature-scale-slider`}
              min="50"
              max="150"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-20 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400">{scale}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
