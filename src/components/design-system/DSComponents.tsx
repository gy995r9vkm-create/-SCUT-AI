/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, ChevronDown, AlertCircle, AlertTriangle, Info, CheckCircle, 
  Search, Eye, EyeOff, Loader2, ArrowRight, User, Settings, Shield,
  Activity, Key, Star, Award, ChevronRight, X, Heart, MessageSquare, Bell
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-250 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-98 select-none';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 border border-cyan-400/25',
    secondary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10 border border-blue-500/20',
    outline: 'bg-transparent border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/40 text-slate-200',
    ghost: 'bg-transparent hover:bg-slate-900 text-slate-300 hover:text-white',
    danger: 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-lg shadow-rose-500/20 border border-rose-400/25',
    glow: 'relative bg-slate-950 border border-cyan-500/40 text-cyan-400 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all overflow-hidden group',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Glow button background effect */}
      {variant === 'glow' && (
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      
      <span>{children}</span>
      
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
});

Button.displayName = 'Button';


// ==========================================
// 2. INPUT, TEXTAREA, SELECT, TOGGLE, CHECKBOX, SLIDER
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ComponentType<any>;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  icon: Icon,
  className = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-400 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={inputType}
          className={`w-full bg-slate-900/60 hover:bg-slate-900 border text-slate-200 text-sm rounded-xl px-4 py-2.5 transition-all outline-none focus:bg-slate-900
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-rose-500/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15' : ''}
            ${success ? 'border-emerald-500/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15' : ''}
            ${!error && !success ? 'border-slate-800 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// TextArea Component
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const textId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={textId} className="block text-xs font-semibold text-slate-400 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={textId}
        ref={ref}
        className={`w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 transition-all outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 min-h-[100px] resize-y
          ${error ? 'border-rose-500/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// Select Dropdown Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="space-y-1.5 w-full relative">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-400 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 pr-10 appearance-none transition-all outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10
            ${error ? 'border-rose-500/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Toggle (Switch) Component
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle = ({ checked, onChange, label, description, disabled = false }: ToggleProps) => {
  return (
    <label className={`flex items-start gap-3 select-none ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
      <div className="relative flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-cyan-500' : 'bg-slate-800'}`} />
        <div className={`absolute left-0.5 w-5 h-5 rounded-full bg-slate-950 shadow border transition-transform duration-200 ${checked ? 'transform translate-x-4 border-cyan-400' : 'border-slate-700'}`} />
      </div>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <span className="block text-sm font-semibold text-slate-200">{label}</span>}
          {description && <span className="block text-xs text-slate-500 leading-normal">{description}</span>}
        </div>
      )}
    </label>
  );
};

// Checkbox Component
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string | React.ReactNode;
  id?: string;
}

export const Checkbox = ({ checked, onChange, label, id }: CheckboxProps) => {
  const checkId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <label htmlFor={checkId} className="flex items-start gap-3 cursor-pointer select-none">
      <div className="relative flex items-center mt-0.5">
        <input
          type="checkbox"
          id={checkId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'}`}>
          {checked && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </label>
  );
};

// Slider Component
interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  label?: string;
  valueLabelSuffix?: string;
}

export const Slider = ({ min, max, value, onChange, step = 1, label, valueLabelSuffix = '' }: SliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center text-xs font-semibold tracking-wide">
        {label && <span className="text-slate-400">{label}</span>}
        <span className="text-cyan-400 font-mono">{value}{valueLabelSuffix}</span>
      </div>
      <div className="relative flex items-center w-full group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none accent-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          style={{
            background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(6, 182, 212) ${percentage}%, rgb(30, 41, 59) ${percentage}%, rgb(30, 41, 59) 100%)`
          }}
        />
      </div>
    </div>
  );
};


// ==========================================
// 3. CARDS & CONTAINER COMPONENTS
// ==========================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900/40 border border-slate-850 rounded-2xl p-5 ${onClick ? 'cursor-pointer hover:bg-slate-900/60 hover:border-slate-800 active:scale-99 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const GlowCard = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`relative bg-slate-950 border border-slate-850 hover:border-cyan-500/30 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.06)] transition-all duration-300 group overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Decorative inner glow hover element */}
      <div className="absolute top-0 left-0 h-24 w-24 bg-cyan-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const BentoCard = ({ 
  children, 
  className = '', 
  accent = 'cyan',
  title,
  description
}: CardProps & { accent?: 'cyan' | 'blue' | 'rose' | 'emerald'; title?: string; description?: string }) => {
  const accentColors = {
    cyan: 'from-cyan-500/10 via-slate-900/40 to-slate-950 border-cyan-500/10',
    blue: 'from-blue-500/10 via-slate-900/40 to-slate-950 border-blue-500/10',
    rose: 'from-rose-500/10 via-slate-900/40 to-slate-950 border-rose-500/10',
    emerald: 'from-emerald-500/10 via-slate-900/40 to-slate-950 border-emerald-500/10',
  };

  return (
    <div className={`bg-gradient-to-br ${accentColors[accent]} border rounded-2xl p-6 relative overflow-hidden group ${className}`}>
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full blur-[60px] opacity-20 pointer-events-none bg-current text-cyan-500" />
      <div className="space-y-4">
        {(title || description) && (
          <div className="space-y-1">
            {title && <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>}
            {description && <p className="text-xs text-slate-400 leading-relaxed font-light">{description}</p>}
          </div>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<any>;
  className?: string;
}

export const MetricCard = ({ title, value, subtext, trend, icon: Icon, className = '' }: MetricCardProps) => {
  return (
    <Card className={`flex flex-col justify-between min-h-[120px] ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wide block uppercase">{title}</span>
          <span className="text-2xl font-black text-white font-mono tracking-tight">{value}</span>
        </div>
        {Icon && (
          <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-cyan-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(trend || subtext) && (
        <div className="flex items-center gap-2 mt-4 text-xs font-mono">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
          {subtext && <span className="text-slate-500 font-sans">{subtext}</span>}
        </div>
      )}
    </Card>
  );
};


// ==========================================
// 4. BADGES & AVATARS
// ==========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ children, variant = 'slate', size = 'sm', className = '' }: BadgeProps) => {
  const variantStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]',
    blue: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    slate: 'bg-slate-900 border-slate-800 text-slate-400',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[9px] font-bold tracking-wider rounded-md uppercase',
    md: 'px-2.5 py-1 text-[11px] font-semibold rounded-lg',
  };

  return (
    <span className={`inline-flex items-center border font-mono select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export const Avatar = ({ src, name, size = 'md', status, className = '' }: AvatarProps) => {
  const [error, setError] = useState(false);
  
  const sizeStyles = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  const statusColors = {
    online: 'bg-emerald-400 ring-2 ring-slate-950',
    offline: 'bg-slate-500 ring-2 ring-slate-950',
    away: 'bg-amber-400 ring-2 ring-slate-950',
    busy: 'bg-rose-400 ring-2 ring-slate-950',
  };

  const statusSize = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative inline-block shrink-0">
      <div className={`rounded-full overflow-hidden flex items-center justify-center font-bold tracking-wide font-mono bg-slate-800 border border-slate-700 text-slate-200 select-none ${sizeStyles[size]} ${className}`}>
        {src && !error ? (
          <img 
            src={src} 
            alt={name} 
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover" 
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 rounded-full ${statusColors[status]} ${statusSize[size]}`} />
      )}
    </div>
  );
};

export const AvatarGroup = ({ avatars, limit = 4, size = 'sm' }: { avatars: { src?: string; name: string }[]; limit?: number; size?: 'xs' | 'sm' | 'md' }) => {
  const displayedAvatars = avatars.slice(0, limit);
  const overflow = avatars.length - limit;

  return (
    <div className="flex items-center -space-x-2">
      {displayedAvatars.map((av, idx) => (
        <Avatar 
          key={idx} 
          src={av.src} 
          name={av.name} 
          size={size} 
          className="ring-2 ring-slate-950 relative z-10 hover:z-20 transition-all cursor-pointer" 
        />
      ))}
      {overflow > 0 && (
        <div className={`rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-bold font-mono tracking-tight ring-2 ring-slate-950 relative z-10
          ${size === 'xs' ? 'h-6 w-6 text-[9px]' : size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-xs'}
        `}>
          +{overflow}
        </div>
      )}
    </div>
  );
};


// ==========================================
// 5. MODAL COMPONENT
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`w-full ${sizeClasses[size]} bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-900 shrink-0">
              <h3 className="font-display text-lg font-bold text-white tracking-tight">{title}</h3>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="px-6 py-6 overflow-y-auto flex-1 text-slate-300 text-sm leading-relaxed scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


// ==========================================
// 6. DROPDOWN COMPONENT
// ==========================================
interface DropdownProps {
  trigger: React.ReactNode;
  items: {
    id: string;
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
  }[];
  className?: string;
  align?: 'left' | 'right';
}

export const Dropdown = ({ trigger, items, className = '', align = 'right' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-30 mt-2 w-52 bg-slate-950 border border-slate-850 rounded-xl shadow-xl py-1.5 overflow-hidden
              ${align === 'right' ? 'right-0' : 'left-0'}
            `}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-xs font-semibold text-left flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none
                    ${item.danger 
                      ? 'text-rose-400 hover:bg-rose-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}
                  `}
                >
                  {Icon && <Icon className={`h-4 w-4 ${item.danger ? 'text-rose-400' : 'text-slate-500'}`} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ==========================================
// 7. NAVIGATION: TABS & SIDES
// ==========================================
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ComponentType<any> }[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pill';
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, variant = 'line', className = '' }: TabsProps) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === activeTab;
        
        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2
                ${active 
                  ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300' 
                  : 'bg-slate-900/40 border-slate-850/60 text-slate-400 hover:text-slate-200 hover:border-slate-800'}
              `}
            >
              {Icon && <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />}
              <span>{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer relative
              ${active ? 'text-cyan-400 border-cyan-500' : 'border-transparent'}
            `}
          >
            {Icon && <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />}
            <span>{tab.label}</span>
            {active && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};


// ==========================================
// 8. DATA DISPLAY: TABLES, CHARTS
// ==========================================
interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export const Table = ({ headers, rows, className = '' }: TableProps) => {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/20 w-full ${className}`}>
      <table className="min-w-full divide-y divide-slate-900 text-left text-xs text-slate-300">
        <thead className="bg-slate-950 font-display font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} scope="col" className="px-6 py-4.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 font-light">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-900/30 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-6 py-4 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500">
                No database records matched this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Gradient Styled Area Chart Wrapper
interface ChartDataPoint {
  name: string;
  value: number;
}

export const AreaChartWidget = ({ 
  data, 
  height = 200, 
  gradientColor = '#06b6d4',
  id = 'cyan-chart-grad'
}: { data: ChartDataPoint[]; height?: number; gradientColor?: string; id?: string }) => {
  return (
    <div style={{ width: '100%', height }} className="font-mono text-[10px] text-slate-500 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#111827" vertical={false} />
          <XAxis dataKey="name" stroke="#4b5563" tickLine={false} axisLine={false} />
          <YAxis stroke="#4b5563" tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#020617', 
              borderColor: '#1e293b',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '11px',
              fontFamily: 'monospace'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={gradientColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#${id})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


// ==========================================
// 9. FEEDBACK: NOTIFICATIONS & SKELETONS
// ==========================================
interface NotificationProps {
  id: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onClose?: (id: string) => void;
}

export const Notification = ({ id, type = 'info', title, message, onClose }: NotificationProps) => {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-cyan-400 shrink-0" />,
  };

  const containerStyles = {
    success: 'bg-slate-950 border-emerald-500/30 text-slate-100',
    warning: 'bg-slate-950 border-amber-500/30 text-slate-100',
    error: 'bg-slate-950 border-rose-500/30 text-slate-100',
    info: 'bg-slate-950 border-cyan-500/30 text-slate-100',
  };

  return (
    <div className={`p-4 rounded-2xl border flex gap-3.5 shadow-2xl relative max-w-sm w-full ${containerStyles[type]}`}>
      <div className="mt-0.5">{iconMap[type]}</div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed font-light">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={() => onClose(id)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 cursor-pointer shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Shimmering skeleton loader
export const Skeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`bg-slate-900 rounded-xl relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent ${className}`} />
  );
};


// ==========================================
// 10. EMPTY & ERROR STATES
// ==========================================
interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-900 rounded-3xl text-center max-w-sm mx-auto space-y-4 bg-slate-950/10 py-12 select-none">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 text-slate-400">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-light max-w-[280px]">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  details?: string;
}

export const ErrorState = ({ title, message, retryLabel = 'Retry Action', onRetry, details }: ErrorStateProps) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-rose-500/10 rounded-3xl bg-rose-500/[0.01] text-center max-w-md mx-auto space-y-4">
      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl animate-pulse">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-rose-400 tracking-tight uppercase font-mono">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-light">
          {message}
        </p>
      </div>
      
      {details && (
        <div className="w-full text-left bg-slate-950 border border-slate-900 rounded-xl p-3 space-y-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] font-bold font-mono tracking-wide text-slate-500 uppercase hover:text-slate-300 flex items-center justify-between w-full cursor-pointer"
          >
            <span>Telemetry details</span>
            <span>{showDetails ? 'Hide' : 'Show'}</span>
          </button>
          {showDetails && (
            <pre className="text-[9px] font-mono text-rose-400 leading-relaxed overflow-x-auto py-1 scrollbar-thin">
              {details}
            </pre>
          )}
        </div>
      )}

      {onRetry && (
        <Button size="sm" variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

// ==========================================
// 11. CHAT COMPONENTS
// ==========================================
interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  avatarUrl?: string;
  name: string;
  tokens?: number;
}

export const ChatBubble = ({ role, content, timestamp, avatarUrl, name, tokens }: ChatBubbleProps) => {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-4 p-4.5 rounded-2xl border transition-colors ${
      isUser 
        ? 'bg-cyan-950/5 border-cyan-500/10 flex-row-reverse' 
        : 'bg-slate-900/25 border-slate-900'
    }`}>
      <Avatar src={avatarUrl} name={name} status={isUser ? undefined : 'online'} size="sm" className="ring-1 ring-slate-800" />
      <div className="space-y-2 flex-1">
        <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs font-bold text-white">{name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{timestamp}</span>
          {tokens && (
            <Badge variant="cyan" size="sm" className="font-light">
              {tokens} TS
            </Badge>
          )}
        </div>
        <p className={`text-sm leading-relaxed text-slate-300 font-light whitespace-pre-wrap ${isUser ? 'text-right' : 'text-left'}`}>
          {content}
        </p>
      </div>
    </div>
  );
};

export const ChatInputBar = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Message SCUT AI...", 
  isLoading = false,
  chips = []
}: { 
  value: string; 
  onChange: (val: string) => void; 
  onSubmit: () => void; 
  placeholder?: string; 
  isLoading?: boolean;
  chips?: string[]
}) => {
  return (
    <div className="space-y-3.5 w-full">
      {chips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onChange(chip)}
              className="px-3 py-1.5 rounded-full border border-slate-900 bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-cyan-300 text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
      <div className="relative flex items-center bg-slate-900/40 hover:bg-slate-900/60 border border-slate-850 rounded-2xl p-2 transition-all">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3.5 py-2 text-sm text-slate-200 outline-none placeholder-slate-500"
          disabled={isLoading}
        />
        <Button 
          variant="primary" 
          size="sm" 
          isLoading={isLoading} 
          onClick={onSubmit}
          className="rounded-xl"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 12. PRICING CARDS
// ==========================================
interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const PricingCard = ({ 
  tier, 
  price, 
  period = 'mo', 
  description, 
  features, 
  isPopular = false, 
  ctaText = 'Get Started', 
  onCtaClick 
}: PricingCardProps) => {
  return (
    <div className={`rounded-3xl p-6 relative flex flex-col justify-between border h-full transition-all duration-300 ${
      isPopular 
        ? 'bg-slate-950 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.08)]' 
        : 'bg-slate-900/30 border-slate-850 hover:border-slate-800'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black font-mono uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <div className="space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase block">{tier}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono">{price}</span>
            <span className="text-xs text-slate-500 font-medium">/{period}</span>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed pt-1.5">{description}</p>
        </div>
        <div className="h-[1px] bg-slate-900" />
        <ul className="space-y-3">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-light">
              <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-6">
        <Button 
          variant={isPopular ? 'glow' : 'outline'} 
          className="w-full justify-center" 
          onClick={onCtaClick}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 13. PROFILE COMPONENTS
// ==========================================
interface ProfileWidgetProps {
  name: string;
  email: string;
  tier: string;
  avatarUrl?: string;
  stats: { label: string; value: string | number }[];
  bio?: string;
}

export const ProfileWidget = ({ name, email, tier, avatarUrl, stats, bio }: ProfileWidgetProps) => {
  return (
    <Card className="overflow-hidden p-0 bg-slate-950 border border-slate-850">
      {/* Decorative gradient top banner */}
      <div className="h-24 bg-gradient-to-r from-blue-900/40 via-cyan-900/20 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/10 rounded-full blur-2xl" />
      </div>
      {/* Content wrapper */}
      <div className="px-6 pb-6 relative">
        {/* Avatar overlapping */}
        <div className="-mt-10 mb-4 inline-block">
          <Avatar src={avatarUrl} name={name} size="xl" status="online" className="ring-4 ring-slate-950 bg-slate-900" />
        </div>
        
        {/* Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">{name}</h3>
              <Badge variant="cyan" size="sm">
                {tier}
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-mono">{email}</span>
          </div>

          {bio && <p className="text-xs text-slate-400 font-light leading-relaxed">{bio}</p>}

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {stats.map((st, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-900 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{st.label}</span>
                <span className="text-sm font-black text-white font-mono">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ==========================================
// 14. SETTINGS PANEL GROUP
// ==========================================
interface SettingsGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup = ({ title, description, children }: SettingsGroupProps) => {
  return (
    <Card className="space-y-5 bg-slate-900/20 border border-slate-850 text-left">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h3>
        {description && <p className="text-xs text-slate-500 font-light leading-normal">{description}</p>}
      </div>
      <div className="h-[1px] bg-slate-900" />
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
};

// ==========================================
// 15. RESPONSIVE NAVIGATION & LAYOUTS
// ==========================================
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeItem: string;
  onNavigate: (id: string) => void;
  items: { id: string; label: string; icon: React.ComponentType<any>; badge?: string | number }[];
  user?: { name: string; email: string; avatarUrl?: string };
}

export const Sidebar = ({ isOpen, setIsOpen, activeItem, onNavigate, items, user }: SidebarProps) => {
  return (
    <aside className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950 border-r border-slate-900 w-64 transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 transition-transform duration-300 flex flex-col justify-between`}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto scrollbar-none">
        {/* Logo brand */}
        <div className="flex items-center justify-between px-6 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-black">
              S
            </div>
            <span className="text-base font-display font-extrabold text-white tracking-tight">SCUT AI</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1.5">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.id === activeItem;
            return (
              <button
                key={it.id}
                onClick={() => {
                  onNavigate(it.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  active 
                    ? 'bg-cyan-500/10 border border-cyan-500/15 text-cyan-300 font-bold' 
                    : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{it.label}</span>
                </div>
                {it.badge && (
                  <Badge variant="cyan" size="sm">
                    {it.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      {user && (
        <div className="p-4 border-t border-slate-900 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/30 border border-slate-900">
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const Navbar = ({ sidebarOpen, setSidebarOpen, title, onNotificationClick, onProfileClick }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
        >
          <Activity className="h-5 w-5 animate-pulse" /> {/* Use as menu representation */}
        </button>
        <h2 className="text-sm font-display font-extrabold text-white tracking-tight uppercase">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNotificationClick}
          className="p-2 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 cursor-pointer relative"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
        </button>
        <button
          onClick={onProfileClick}
          className="p-2 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 cursor-pointer"
        >
          <User className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
};
