'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LegalAssistantBadgeProps {
  className?: string;
}

const MotionDiv = motion.div;

export function LegalAssistantBadge({ className }: LegalAssistantBadgeProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'inline-flex items-center rounded-full border border-nook-purple-200 bg-nook-purple-50 px-3 py-1 text-sm font-medium text-nook-purple-700 dark:border-nook-purple-800 dark:bg-nook-purple-900/50 dark:text-nook-purple-300',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nook-purple-400 opacity-75 dark:bg-nook-purple-500" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-nook-purple-500 dark:bg-nook-purple-400" />
      </span>
      <span className="ml-2">Legal Assistant (Beta)</span>
    </MotionDiv>
  );
} 