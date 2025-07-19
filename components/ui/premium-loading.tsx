import React from 'react';
import { motion } from 'framer-motion';

interface PremiumLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'nook' | 'gradient';
}

export function PremiumLoading({ 
  message = "Loading your experience...", 
  size = 'md',
  variant = 'nook'
}: PremiumLoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    nook: 'border-nook-purple-200 border-t-nook-purple-600',
    gradient: 'border-gradient-to-r from-nook-purple-500 to-purple-500 border-t-white'
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center space-y-4">
        <motion.div
          className={`${sizeClasses[size]} border-4 border-t-transparent rounded-full mx-auto ${variantClasses[variant]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}
