import React from 'react';
import { Check, X } from 'lucide-react';

const RULES = [
    { label: '8+ caracteres', test: p => p.length >= 8 },
    { label: 'Mayúscula', test: p => /[A-Z]/.test(p) },
    { label: 'Número', test: p => /[0-9]/.test(p) },
    { label: 'Símbolo', test: p => /[^A-Za-z0-9]/.test(p) },
];

export const getStrength = (pass) => {
    if (!pass) return { score: 0, segments: 0, label: '', color: '', text: '' };
    const s = RULES.filter(r => r.test(pass)).length;
    if (s <= 1) return { score: 25, segments: 1, label: 'Débil', color: 'bg-red-500', text: 'text-red-400' };
    if (s === 2) return { score: 50, segments: 2, label: 'Regular', color: 'bg-yellow-500', text: 'text-yellow-400' };
    if (s === 3) return { score: 75, segments: 3, label: 'Fuerte', color: 'bg-blue-500', text: 'text-blue-400' };
    return { score: 100, segments: 4, label: 'Muy Segura', color: 'bg-green-500', text: 'text-green-400' };
};

const PasswordStrength = ({ password }) => {
    if (!password) return null;
    const { segments, label, color, text } = getStrength(password);
    return (
        <div className="space-y-2.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${i <= segments ? color : 'dark:bg-white/[0.06] bg-slate-200 dark:bg-transparent'}`} />
                    ))}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${text.replace('text-', 'dark:text-')}`}>{label}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {RULES.map(r => {
                    const met = r.test(password);
                    return (
                        <div key={r.label} className={`flex items-center gap-1.5 text-[9px] font-bold ${met ? 'dark:text-green-400 text-green-600' : 'dark:text-white/15 text-slate-300'}`}>
                            {met ? <Check size={9} strokeWidth={3} /> : <X size={9} />}
                            {r.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrength;