
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'number' | 'text';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function InputField({
  label, value, onChange, type = 'number', min, max, step = 0.1,
  unit, hint, placeholder, required, disabled
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
            disabled:bg-slate-100 disabled:cursor-not-allowed pr-12"
        />
        {unit && (
          <span className="absolute right-3 text-xs text-slate-400 font-medium">{unit}</span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface FtInFieldProps {
  label: string;
  feet: number;
  inches: number;
  onFeetChange: (v: string) => void;
  onInchesChange: (v: string) => void;
  hint?: string;
}

export function FtInField({ label, feet, inches, onFeetChange, onInchesChange, hint }: FtInFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={feet}
            onChange={e => onFeetChange(e.target.value)}
            min={0}
            step={1}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 pr-8"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">ft</span>
        </div>
        <div className="relative flex-1">
          <input
            type="number"
            value={inches}
            onChange={e => onInchesChange(e.target.value)}
            min={0}
            max={11.9}
            step={0.5}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 pr-8"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">in</span>
        </div>
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
