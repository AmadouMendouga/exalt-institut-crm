import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useTransform } from 'motion/react';

interface UseCountUpOptions {
  duration?: number;
  format?: (value: number) => string;
}

export function useCountUp(target: number, options?: UseCountUpOptions) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const format = options?.format ?? ((v: number) => Math.round(v).toLocaleString());
  const display = useTransform(motionValue, format);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, target, { duration: options?.duration ?? 1.2, ease: 'easeOut' });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, target]);

  return { ref, display };
}
