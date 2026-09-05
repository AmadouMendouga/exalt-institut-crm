import React from 'react';
import { Star, Trash2, MessageSquareHeart } from 'lucide-react';
import { motion } from 'motion/react';
import { Review } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ReviewsScreenProps {
  reviews: Review[];
  onDeleteReview: (review: Review) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`w-3.5 h-3.5 ${
          value <= rating ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-stone-300 dark:text-stone-600'
        }`}
      />
    ))}
  </div>
);

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({ reviews, onDeleteReview }) => {
  const { language, t } = useLanguage();

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.reviewsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.reviewsSubtitle}
          </p>
        </div>

        {average && (
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border-color)]/60 rounded-xl px-4 py-2 shadow-xs">
            <StarRating rating={Math.round(Number(average))} />
            <span className="font-mono-code text-sm font-bold text-[var(--text-primary)]">{average}</span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              ({reviews.length} {language === 'fr' ? 'avis' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-stone-400 dark:text-stone-500">
            <MessageSquareHeart className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
            <p className="font-medium text-stone-600 dark:text-stone-300">{t.reviewsEmpty}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{t.reviewsEmptySub}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]/30">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 sm:px-6 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {review.clientName || t.reviewsUnknownClient}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{review.comment}</p>
                  )}
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">
                    {new Date(review.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteReview(review)}
                  aria-label={t.reviewsDeleteBtn}
                  className="shrink-0 w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
