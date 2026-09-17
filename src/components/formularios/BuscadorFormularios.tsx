'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function BuscadorFormularios({ value, onChange, placeholder }: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div className="relative w-full md:max-w-xl">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 pl-10 text-sm shadow-inner shadow-slate-200/50 transition-all placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:ring-4 focus-visible:ring-sky-100"
        placeholder={placeholder ?? 'Buscar por nombre...'}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  );
}