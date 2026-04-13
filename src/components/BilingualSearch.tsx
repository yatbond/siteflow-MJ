import { useState, useEffect } from 'react';
import { t } from '@/shared/i18n/i18n';

interface BilingualSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function BilingualSearch({
  value,
  onChange,
  placeholder = 'Search... / 搜尋...',
  className = '',
}: BilingualSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 pl-12"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
        🔍
      </div>
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>
      )}
    </div>
  );
}