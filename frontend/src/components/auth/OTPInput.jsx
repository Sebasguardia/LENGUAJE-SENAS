import React, { useRef } from 'react';

const OTPInput = ({ value = '', onChange, autoFocus = true }) => {
    const refs = useRef([]);
    const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

    const focus = (i) => { const el = refs.current[i]; if (el) { el.focus(); el.select(); } };

    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const next = [...digits];
            if (next[i]) { next[i] = ''; onChange(next.join('')); }
            else if (i > 0) { next[i - 1] = ''; onChange(next.join('')); focus(i - 1); }
        }
        if (e.key === 'ArrowLeft' && i > 0) focus(i - 1);
        if (e.key === 'ArrowRight' && i < 5) focus(i + 1);
    };

    const handleChange = (i, e) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (!raw) return;
        const next = [...digits]; next[i] = raw.slice(-1);
        onChange(next.join(''));
        if (i < 5) focus(i + 1);
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const s = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(s); focus(Math.min(s.length, 5));
    };

    return (
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
                <React.Fragment key={i}>
                    {i === 3 && <div className="self-center w-2 sm:w-3 h-0.5 dark:bg-white/5 bg-slate-300 dark:bg-transparent flex-shrink-0 rounded-full" />}
                    <div className={`relative rounded-xl p-px transition-all duration-500 ${
                        d ? 'bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                        'dark:bg-white/[0.06] bg-slate-200 dark:bg-transparent focus-within:bg-gradient-to-b focus-within:from-blue-600 focus-within:to-blue-900 focus-within:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    }`}>
                        <input ref={el => (refs.current[i] = el)} type="text" inputMode="numeric"
                            maxLength={1} value={d} autoFocus={autoFocus && i === 0}
                            onChange={e => handleChange(i, e)} onKeyDown={e => handleKey(i, e)}
                            onFocus={e => e.target.select()}
                            className={`w-9 sm:w-11 h-12 sm:h-14 rounded-[calc(0.75rem-1px)] text-center text-xl sm:text-2xl font-black outline-none dark:bg-[#080c14] bg-slate-50 transition-all duration-300 block ${
                                d ? 'text-blue-400' : 'dark:text-white text-slate-900 dark:focus:bg-[#0a0f1a] focus:bg-white'
                            }`}
                        />
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default OTPInput;