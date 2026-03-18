import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import OTPInput from '../OTPInput';

const TwoFAModal = ({ onConfirm, onCancel }) => {
    const [code, setCode] = useState('');
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020408]/95 backdrop-blur-2xl animate-in fade-in duration-200" />
            <div className="absolute w-72 h-72 bg-blue-700/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full max-w-[340px] animate-in zoom-in-95 duration-300">
                <div className="rounded-2xl p-px bg-gradient-to-b from-white/12 via-white/5 to-white/[0.02]">
                    <div className="bg-[#080c14] rounded-[calc(1rem-1px)] overflow-hidden">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                        <div className="p-8 flex flex-col items-center text-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                                <div className="relative w-14 h-14 bg-blue-600/15 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Fingerprint size={26} className="text-blue-400" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Verificación 2FA</h3>
                                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1.5">Ingrese su token de autenticación</p>
                            </div>

                            <form className="w-full space-y-5"
                                onSubmit={e => { e.preventDefault(); if (code.length === 6) onConfirm(code); }}>
                                <OTPInput value={code} onChange={setCode} />
                                <div className="rounded-xl p-px bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <button type="submit" disabled={code.length !== 6}
                                        className="w-full h-11 rounded-[calc(0.75rem-1px)] text-white font-black text-xs uppercase tracking-[0.2em] disabled:opacity-40 transition-all relative overflow-hidden group"
                                        style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <span className="relative z-10">Confirmar</span>
                                    </button>
                                </div>
                                <button type="button" onClick={onCancel}
                                    className="text-white/15 hover:text-white/35 text-[9px] font-black uppercase tracking-widest transition-colors">
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TwoFAModal;