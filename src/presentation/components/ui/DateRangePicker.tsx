import React, { useState, useRef, useEffect } from 'react';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
}

const PRESET_RANGES = [
  { label: 'Aujourd\'hui', getValue: () => { const d = new Date().toISOString().split('T')[0]; return { start: d, end: d }; } },
  { label: '7 derniers jours', getValue: () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 7); return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }; } },
  { label: '30 derniers jours', getValue: () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 30); return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }; } },
  { label: 'Ce mois', getValue: () => { const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }; } },
  { label: 'Mois dernier', getValue: () => { const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); const end = new Date(now.getFullYear(), now.getMonth(), 0); return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }; } },
  { label: 'Cette annee', getValue: () => { const now = new Date(); return { start: `${now.getFullYear()}-01-01`, end: now.toISOString().split('T')[0] }; } },
];

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Selectionner une periode',
  minDate,
  maxDate,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sync tempRange when value changes externally
  useEffect(() => {
    setTempRange(value);
  }, [value]);

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  const handlePreset = (preset: typeof PRESET_RANGES[0]) => {
    const range = preset.getValue();
    setTempRange(range);
    onChange(range);
    setIsOpen(false);
  };

  const displayValue = value.start && value.end
    ? `${formatDisplayDate(value.start)} - ${formatDisplayDate(value.end)}`
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-11 px-4 flex items-center justify-between gap-2
          bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
          rounded-xl text-sm font-bold text-left
          transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600'}
          ${value.start && value.end ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-zinc-400">calendar_month</span>
          <span className="truncate">{displayValue}</span>
        </div>
        <span className={`material-symbols-outlined text-lg text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[340px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_RANGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5">
                  Date debut
                </label>
                <input
                  type="date"
                  value={tempRange.start}
                  onChange={(e) => setTempRange((prev) => ({ ...prev, start: e.target.value }))}
                  min={minDate}
                  max={tempRange.end || maxDate}
                  className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5">
                  Date fin
                </label>
                <input
                  type="date"
                  value={tempRange.end}
                  onChange={(e) => setTempRange((prev) => ({ ...prev, end: e.target.value }))}
                  min={tempRange.start || minDate}
                  max={maxDate}
                  className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => { setTempRange({ start: '', end: '' }); onChange({ start: '', end: '' }); setIsOpen(false); }}
                className="px-4 py-2 text-xs font-black text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!tempRange.start || !tempRange.end}
                className="px-4 py-2 text-xs font-black bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
