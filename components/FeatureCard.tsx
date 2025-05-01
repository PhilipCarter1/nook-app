'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { getClient } from '@/lib/supabase/client';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isBeta?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
  featureKey?: 'legalAssistant' | 'concierge' | 'customBranding';
}

const MotionDiv = motion.div;

export function FeatureCard({
  title,
  description,
  icon,
  isBeta = false,
  isDisabled = false,
  onClick,
  className,
  featureKey,
}: FeatureCardProps) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = React.useState(!featureKey);

  React.useEffect(() => {
    const checkFeature = async () => {
      if (!user || !featureKey) return;
      
      const client = getClient();
      if (!client) return;

      const { data } = await client
        .from('feature_flags')
        .select('enabled')
        .eq('key', featureKey)
        .single();

      setIsEnabled(data?.enabled ?? false);
    };

    checkFeature();
  }, [user, featureKey]);

  return (
    <MotionDiv
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-gray-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700',
        (isDisabled || !isEnabled) && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nook-purple-50 text-nook-purple-500 dark:bg-nook-purple-900/50">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {isBeta && (
            <span className="ml-2 inline-flex items-center rounded-full bg-nook-purple-100 px-2.5 py-0.5 text-xs font-medium text-nook-purple-800 dark:bg-nook-purple-900/50 dark:text-nook-purple-300">
              Beta
            </span>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
      {!isDisabled && isEnabled && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-nook-purple-500 to-nook-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </MotionDiv>
  );
} 