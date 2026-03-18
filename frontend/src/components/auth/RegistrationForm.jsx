import React from 'react';
import { User, Mail, Key, Phone, CreditCard, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthInput from './AuthInput';
import PasswordStrength from './PasswordStrength';

const Sep = ({ label }) => (
  <div className="flex items-center gap-2 sm:gap-3 my-1">
    <span className="text-[8px] font-black dark:text-white/20 text-slate-500 uppercase tracking-[0.35em] whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px dark:bg-white/[0.04] bg-slate-200" />
  </div>
);

const RegistrationForm = ({
  formData, errors = {}, isLoading,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  handleChange, handleSubmit,
}) => (
  <form onSubmit={handleSubmit} className="space-y-3">
    <Sep label="Datos Personales" />

    <AuthInput label="Nombre Completo" name="fullName" icon={User}
      placeholder="Ej: Juan Pérez" value={formData.fullName}
      onChange={handleChange} error={errors.fullName} required />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <AuthInput label="DNI" name="dni" icon={CreditCard}
        placeholder="00000000" value={formData.dni}
        onChange={handleChange} error={errors.dni} required />
      <AuthInput label="Teléfono" name="phone" type="tel" icon={Phone}
        placeholder="+51 9…" value={formData.phone}
        onChange={handleChange} error={errors.phone} required />
    </div>
    <AuthInput label="Correo" name="email" type="email" icon={Mail}
      placeholder="usuario@empresa.com" value={formData.email}
      onChange={handleChange} error={errors.email} required />

    <Sep label="Credenciales" />

    <div className="space-y-1.5">
      <div className="relative">
        <AuthInput label="Contraseña" name="password" type={showPassword ? 'text' : 'password'}
          icon={Key} placeholder="••••••••" value={formData.password}
          onChange={handleChange} error={errors.password} 
          autoComplete="new-password" required />
        <button type="button" onClick={() => setShowPassword(v => !v)}
          className="absolute right-3.5 top-[2.2rem] p-1 dark:text-white/15 text-slate-400 dark:hover:text-white/50 hover:text-blue-600 transition-colors">
          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      {formData.password && <PasswordStrength password={formData.password} />}
    </div>

    <div className="relative">
      <AuthInput label="Confirmar" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
        icon={CheckCircle2} placeholder="••••••••" value={formData.confirmPassword}
        onChange={handleChange} error={errors.confirmPassword} 
        autoComplete="new-password" required />
      <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
        className="absolute right-3.5 top-[2.2rem] p-1 dark:text-white/15 text-slate-400 dark:hover:text-white/50 hover:text-blue-600 transition-colors">
        {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>

    <div className="pt-2">
      <div className="rounded-xl p-px bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 shadow-[0_4px_24px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.35)] transition-all duration-500 group/btn active:scale-[0.985]">
        <button type="submit" disabled={isLoading}
          className="w-full h-12 rounded-[calc(0.75rem-1px)] text-white font-black text-[11px] uppercase tracking-[0.25em] disabled:opacity-50 relative overflow-hidden flex items-center justify-center gap-3"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
          <div className="relative z-10 flex items-center gap-3">
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Implementar Registro</span><ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" /></>
            }
          </div>
        </button>
      </div>
    </div>
  </form>
);

export default RegistrationForm;