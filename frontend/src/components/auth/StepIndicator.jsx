import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => (
    <div className="flex items-center gap-2 w-full mb-8">
        {steps.map((label, i) => {
            const done = i < currentStep, active = i === currentStep;
            return (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 group/step">
                        <div className={`rounded-xl p-px transition-all duration-700 ${
                            done ? 'bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.25)] scale-110' :
                            active ? 'bg-gradient-to-b from-blue-500/40 to-blue-700/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                            'dark:bg-white/[0.04] bg-slate-200 dark:bg-transparent'
                        }`}>
                            <div className={`w-8 h-8 rounded-[calc(0.75rem-1px)] flex items-center justify-center transition-all duration-700 ${
                                done ? 'bg-blue-600' : active ? 'dark:bg-[#0a0f1a] bg-white' : 'dark:bg-[#080c14] bg-slate-100'
                            }`}>
                                {done
                                    ? <Check size={12} strokeWidth={3.5} className="text-white animate-in zoom-in duration-500" />
                                    : <span className={`text-[10px] font-black tracking-tighter ${active ? 'text-blue-400' : 'dark:text-white/10 text-slate-300'}`}>{i + 1}</span>
                                }
                            </div>
                        </div>
                        <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-500 ${
                            done ? 'text-blue-400/70' : active ? 'dark:text-white/40 text-slate-600' : 'dark:text-white/10 text-slate-400'
                        }`}>{label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className="flex-1 h-px mt-[-10px] dark:bg-white/[0.03] bg-slate-200 dark:bg-transparent overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out" style={{ width: done ? '100%' : '0%' }} />
                        </div>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

export default StepIndicator;