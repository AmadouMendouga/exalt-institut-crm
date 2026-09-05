import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, ImagePlus, Trash2 } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';

const SERVICE_CATEGORIES = [
  'Épilation',
  'Massage',
  'Hammam & Gommage',
  'Enveloppement',
  'Soins de Visage',
  'Beauté des Mains',
  'Beauté des Pieds',
  'Coiffure Femmes',
  'Coiffure Hommes',
  'Makeup',
  'Extension de Cils',
];

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: { name: string; category: string; price: number; imageUrl: string | null }) => Promise<Service>;
  onUploadImage: (serviceId: string, file: File) => Promise<Service>;
  editingService?: Service | null;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUploadImage,
  editingService
}) => {
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageCleared, setImageCleared] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editingService);

  useEffect(() => {
    if (isOpen) {
      setName(editingService?.name ?? '');
      setCategory(editingService?.category ?? SERVICE_CATEGORIES[0]);
      setPrice(editingService ? String(editingService.price) : '');
      setImagePreview(editingService?.imageUrl ?? null);
      setSelectedFile(null);
      setImageCleared(false);
      setSubmitStatus('idle');
    }
  }, [isOpen, editingService]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImageCleared(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageCleared(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitStatus !== 'idle') return;

    setSubmitStatus('loading');
    try {
      const imageUrl = imageCleared && !selectedFile ? null : editingService?.imageUrl ?? null;
      const saved = await onSave({ name: name.trim(), category, price: Number(price) || 0, imageUrl });
      if (selectedFile) {
        await onUploadImage(saved.id, selectedFile);
      }
      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
        onClose();
      }, 500);
    } catch {
      setSubmitStatus('idle');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
            {isEditing ? t.editServiceModalTitle : t.addServiceModalTitle}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeBtn}
          className="w-8 h-8 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:dark:text-stone-300 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-3.5 overflow-y-auto">
        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.serviceNameLabel} *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="Ex: Manucure Gel & Nail Art"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.serviceCategoryLabel}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.servicePriceLabel}
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="15000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.serviceImageLabel}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt=""
                className="w-full h-32 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label={t.serviceImageRemove}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
              >
                {t.serviceImageChange}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-lg border border-dashed border-stone-300 dark:border-stone-600 flex flex-col items-center justify-center gap-1 text-stone-400 dark:text-stone-500 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs font-medium">{t.serviceImageUploadBtn}</span>
            </button>
          )}
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 hover:dark:text-stone-100 cursor-pointer"
          >
            {t.cancel}
          </button>
          <StatefulButton
            type="submit"
            status={submitStatus}
            className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.saveServiceSubmit}</span>
          </StatefulButton>
        </div>
      </form>
    </Modal>
  );
};
