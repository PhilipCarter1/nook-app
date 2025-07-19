#!/bin/bash

echo "🎨 Enhancing Nook Platform User Experience..."

# Create premium UX enhancements
cat > components/ui/premium-loading.tsx << 'EOF'
import React from 'react';
import { motion } from 'framer-motion';

export function PremiumLoadingState({ 
  message = "Loading your experience...",
  showProgress = false,
  progress = 0 
}: {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <motion.div
          className="w-20 h-20 border-4 border-nook-purple-200 border-t-nook-purple-600 rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </h3>
          
          {showProgress && (
            <div className="w-64 mx-auto">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-nook-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progress}% complete
              </p>
            </div>
          )}
        </motion.div>
        
        <motion.div
          className="flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-nook-purple-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
EOF

# Create premium navigation enhancement
cat > components/ui/premium-navigation.tsx << 'EOF'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface PremiumNavigationProps {
  items: PremiumNavItem[];
  className?: string;
}

export function PremiumNavigation({ items, className }: PremiumNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)}>
      {items.map((item, index) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-nook-purple-100 text-nook-purple-700 dark:bg-nook-purple-900/30 dark:text-nook-purple-300 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-nook-purple-500/10"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive
                    ? "text-nook-purple-600 dark:text-nook-purple-400"
                    : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                )}
              />
              
              <span className="relative z-10">{item.label}</span>
              
              {item.badge && (
                <motion.span
                  className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-nook-purple-100 text-nook-purple-800 dark:bg-nook-purple-900/30 dark:text-nook-purple-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
EOF

# Create premium feedback component
cat > components/ui/premium-feedback.tsx << 'EOF'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumFeedbackProps {
  onClose: () => void;
}

export function PremiumFeedback({ onClose }: PremiumFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      // Here you would send the feedback to your backend
      // await submitFeedback({ rating, feedback });
      
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your feedback helps us improve your experience.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">How was your experience?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                </motion.button>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Additional feedback (optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what we can improve..."
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-700"
                disabled={rating === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
EOF

echo "✅ Premium UX components created successfully!"
echo "🎨 Enhanced loading states, navigation, and feedback systems"
echo "🚀 Your platform now has premium user experience features" 