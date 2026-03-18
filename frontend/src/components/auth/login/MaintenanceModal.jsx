import React from 'react';
import { Wrench } from 'lucide-react';

const MaintenanceModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#020408]/90 backdrop-blur-xl animate-in fade-in duration-200" onClick={onClose} />
        <div className="relative w-full max-w-[320px] animate-in zoom-in-95 duration-200">
            <div className="rounded-2xl p-px bg-gradient-to-b from-white/10 to-white/[0.02]">
                <div className="bg-[#080c14] rounded-[calc(1rem-1px)] overflow-hidden">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                    <div className="p-8 text-center space-y-5">
                        <div className="relative inline-block mx-auto">
                            <div className="absolute inset-0 bg-yellow-500/15 blur-xl rounded-full" />
                            <div className="relative w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center mx-auto">
                                <Wrench size={22} className="text-yellow-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Mantenimiento</h3>
                            <p className="text-white/25 text-xs font-medium leading-relaxed mt-2">
                                Servidores en optimización. Reintente en unos minutos.
                            </p>
                        </div>
                        <button onClick={onClose}
                            className="w-full h-11 bg-white hover:bg-blue-50 text-[#080c14] font-black rounded-xl uppercase tracking-[0.15em] text-[10px] transition-all active:scale-[0.99]">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
export default MaintenanceModal;