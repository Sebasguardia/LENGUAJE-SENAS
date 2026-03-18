import React from 'react';

const AuthInput = ({ icon: Icon, label, error, hint, className = '', ...props }) => (
  <div className={`group/f space-y-1.5 ${className}`}>
    {label && (
      <label className="flex items-center gap-2 text-[9px] font-black dark:text-white/25 text-slate-500 uppercase tracking-[0.3em] ml-0.5 transition-colors dark:group-focus-within/f:text-white/45 group-focus-within/f:text-blue-600">
        {label}
        {props.required && <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />}
      </label>
    )}

    <div className={`relative rounded-xl p-px transition-all duration-500
      ${error
        ? 'bg-gradient-to-r from-red-500/40 to-red-500/10'
        : 'dark:bg-white/[0.06] bg-slate-200 focus-within:bg-gradient-to-r focus-within:from-blue-600 focus-within:to-indigo-600 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)] focus-within:scale-[1.01]'
      }`}>
      <div className={`relative rounded-[calc(0.75rem-1px)] transition-all duration-300
        ${error ? 'dark:bg-[#120a0a] bg-red-50' : 'dark:bg-[#080c14] bg-slate-50 focus-within:dark:bg-[#0a0f1a] focus-within:bg-white'}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon size={14} className={`transition-colors duration-300 ${error ? 'text-red-400/60' : 'dark:text-white/20 text-slate-400 dark:group-focus-within/f:text-blue-400 group-focus-within/f:text-blue-500'}`} />
          </div>
        )}
        <input {...props}
          className={`w-full bg-transparent py-4 pr-4 text-sm font-medium outline-none rounded-[calc(0.75rem-1px)]
            ${Icon ? 'pl-11' : 'pl-4'}
            ${error ? 'dark:text-red-200 text-red-600 placeholder:text-red-400/40' : 'dark:text-white text-slate-900 dark:placeholder:text-white/10 placeholder:text-slate-400'}`}
        />
      </div>
    </div>

    {error && (
      <p className="flex items-center gap-2 text-[9px] text-red-400 font-black uppercase tracking-widest ml-1 animate-in slide-in-from-top-1 duration-300">
        <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />{error}
      </p>
    )}
    {hint && !error && (
      <p className="text-[9px] dark:text-white/15 text-slate-400 font-bold uppercase tracking-widest ml-0.5">{hint}</p>
    )}
  </div>
);

export default AuthInput;