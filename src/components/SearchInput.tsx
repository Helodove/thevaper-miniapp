import { useRef } from 'react';
import { Search, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export function SearchInput({ value, onChange, autoFocus, placeholder = 'Найти товар, вкус или бренд' }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center gap-2 px-4"
      style={{
        height: 48,
        borderRadius: 14,
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
        border: '1.5px solid transparent',
        transition: 'border-color 0.15s',
      }}
      onClick={() => ref.current?.focus()}
    >
      <Search size={18} strokeWidth={2} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent outline-none text-[15px]"
        style={{ color: 'var(--text-primary)' }}
        onFocus={(e) => {
          (e.currentTarget.parentElement as HTMLElement).style.borderColor = 'var(--brand-primary)';
        }}
        onBlur={(e) => {
          (e.currentTarget.parentElement as HTMLElement).style.borderColor = 'transparent';
        }}
      />
      {value && (
        <button onClick={() => onChange('')} className="flex-shrink-0 p-1">
          <X size={16} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
        </button>
      )}
    </div>
  );
}
