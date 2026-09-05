import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Service } from '../../types';

interface ServicePickerProps {
  services: Service[];
  /** Valeur stockée telle quelle (ex: "Coiffure simple + Teinture" pour plusieurs soins). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SEPARATOR = ' + ';

export const ServicePicker: React.FC<ServicePickerProps> = ({ services, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => (value ? value.split(SEPARATOR).filter(Boolean) : []), [value]);

  const results = useMemo(() => {
    if (!query.trim()) return services;
    const q = query.trim().toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [services, query]);

  const addService = (name: string) => {
    if (!selected.includes(name)) {
      onChange([...selected, name].join(SEPARATOR));
    }
    setQuery('');
  };

  const removeService = (name: string) => {
    onChange(selected.filter((s) => s !== name).join(SEPARATOR));
  };

  // Ferme la liste au clic/tap réellement en dehors du composant. On évite `onBlur`
  // car sur Safari iOS, le champ perd le focus dès le `touchstart` — avant même que
  // le clic sur un résultat n'ait pu être capté — ce qui démonte la liste trop tôt
  // et empêche toute sélection au tactile.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-[var(--surface-alt)] text-[var(--accent-dark)] text-[11px] font-medium pl-2 pr-1 py-1 rounded-full"
            >
              {name}
              <button
                type="button"
                onClick={() => removeService(name)}
                className="w-3.5 h-3.5 rounded-full hover:bg-[var(--surface-highlight)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-[var(--surface)] border border-[var(--border-color)]/60 rounded-lg shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-stone-400 dark:text-stone-500">
              {query.trim() || 'Aucun soin trouvé.'}
            </p>
          ) : (
            results.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => addService(service.name)}
                disabled={selected.includes(service.name)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-200 hover:bg-[var(--surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{service.name}</span>
                <span className="shrink-0 text-[10px] text-stone-400 dark:text-stone-500">{service.category}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
