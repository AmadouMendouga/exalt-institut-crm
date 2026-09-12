import React, { useRef } from 'react';
import { Image as ImageIcon, Video, Download, Upload, X, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface CampaignMediaItem {
  kind: 'photo' | 'video';
  contentType: string;
  filename: string;
  updatedAt: string;
}

interface CampaignMediaPanelProps {
  media: Partial<Record<'photo' | 'video', CampaignMediaItem>>;
  onUpload: (kind: 'photo' | 'video', file: File) => Promise<void>;
  onDelete: (kind: 'photo' | 'video') => Promise<void>;
}

// WhatsApp (wa.me) ne permet pas de joindre un fichier via le lien : ce panneau
// laisse préparer une photo/vidéo de campagne à télécharger puis ajouter à la
// main dans la conversation, juste avant ou après l'envoi du texte.
export const CampaignMediaPanel: React.FC<CampaignMediaPanelProps> = ({ media, onUpload, onDelete }) => {
  const { language, t } = useLanguage();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const slots: { kind: 'photo' | 'video'; icon: React.ElementType; ref: React.RefObject<HTMLInputElement | null>; accept: string }[] = [
    { kind: 'photo', icon: ImageIcon, ref: photoInputRef, accept: 'image/*' },
    { kind: 'video', icon: Video, ref: videoInputRef, accept: 'video/*' }
  ];

  const handleFileChange = (kind: 'photo' | 'video') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(kind, file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
        {t.campaignMediaLabel}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {slots.map(({ kind, icon: Icon, ref, accept }) => {
          const item = media[kind];
          return (
            <div
              key={kind}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[var(--surface)] flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-[var(--accent)] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-stone-700 dark:text-stone-200 truncate">
                  {item ? item.filename : (kind === 'photo' ? t.campaignMediaNoPhoto : t.campaignMediaNoVideo)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item ? (
                    <>
                      <a
                        href={`/api/campaign-media/${kind}/file`}
                        download={item.filename}
                        className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        {t.campaignMediaDownload}
                      </a>
                      <button
                        type="button"
                        onClick={() => ref.current?.click()}
                        className="text-[10px] text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 cursor-pointer"
                      >
                        {language === 'fr' ? 'Remplacer' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(kind)}
                        aria-label={t.campaignMediaRemove}
                        className="text-stone-400 dark:text-stone-500 hover:text-rose-600 hover:dark:text-rose-300 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => ref.current?.click()}
                      className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      {t.campaignMediaUploadBtn}
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={ref}
                type="file"
                accept={accept}
                onChange={handleFileChange(kind)}
                className="hidden"
              />
            </div>
          );
        })}
      </div>
      {(media.photo || media.video) && (
        <p className="flex items-start gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          {t.campaignMediaHint}
        </p>
      )}
    </div>
  );
};
