import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react';
import OTPInput from './OTPInput';

const VerificationForm = ({ email, onVerify, onBack, onResend, isLoading }) => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div className="flex items-center gap-2.5 dark:bg-blue-500/8 bg-blue-50 border dark:border-blue-500/15 border-blue-200 rounded-xl px-4 py-2.5 w-fit mx-auto shadow-sm dark:bg-transparent dark:border-blue-500/15">
        <Mail size={12} className="dark:text-blue-400/60 text-blue-500" />
        <span className="dark:text-blue-400/80 text-blue-700 font-black text-xs">{email}</span>
      </div>

      <form onSubmit={e => { e.preventDefault(); if (code.length === 6) onVerify(code); }} className="space-y-5">
        <div className="space-y-2">
          <p className="text-center text-[9px] font-black dark:text-white/15 text-slate-400 uppercase tracking-[0.3em]">Token de 6 Dígitos</p>
          <OTPInput value={code} onChange={setCode} />
        </div>

        <div className="rounded-xl p-px bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_4px_20px_rgba(59,130,246,0.2)]">
          <button type="submit" disabled={isLoading || code.length !== 6}
            className="w-full h-12 rounded-[calc(0.75rem-1px)] text-white font-black text-xs uppercase tracking-[0.2em] disabled:opacity-40 transition-all relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              : <span className="relative z-10">Validar y Activar</span>
            }
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest dark:text-white/15 text-slate-400 dark:hover:text-white/40 hover:text-slate-600 transition-colors">
          <ArrowLeft size={10} /> Volver
        </button>
        <button onClick={() => { setTimer(60); setCode(''); onResend?.(); }} disabled={timer > 0}
          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest disabled:opacity-30 dark:text-blue-400/60 text-blue-600 dark:hover:text-blue-400 hover:text-blue-700 transition-colors">
          <RotateCcw size={10} />
          {timer > 0 ? `${String(timer).padStart(2, '0')}s` : 'Reenviar'}
        </button>
      </div>
    </div>
  );
};

export default VerificationForm;