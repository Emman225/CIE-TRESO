import React, { forwardRef, useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, icon, options, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg pointer-events-none">
              {icon}
            </span>
          )}

          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-12 bg-zinc-50 dark:bg-zinc-800
              border rounded-2xl text-sm font-bold
              px-5 appearance-none transition-all duration-200
              text-zinc-900 dark:text-white
              focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-12' : ''}
              ${error
                ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
                : 'border-zinc-100 dark:border-zinc-700'
              }
              ${className}
            `.trim()}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Dropdown chevron */}
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg pointer-events-none">
            expand_more
          </span>
        </div>

        {error && (
          <p className="text-xs font-bold text-red-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
