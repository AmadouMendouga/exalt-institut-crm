import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '', ...rest }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, rgba(0,106,97,0.12), transparent 80%)`;

  return (
    <div className={`relative overflow-hidden group ${className}`} onMouseMove={handleMouseMove} {...rest}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};
