import React from 'react';
import { premiumLayout, premiumAnimations } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface PremiumLayoutProps {
  children: React.ReactNode;
  className?: string;
  container?: boolean;
  animate?: boolean;
}

export function PremiumLayout({
  children,
  className,
  container = true,
  animate = true,
}: PremiumLayoutProps) {
  return (
    <div
      className={cn(
        premiumLayout.spacing.section,
        animate && premiumAnimations.fadeIn,
        className
      )}
    >
      {container ? (
        <div className={premiumLayout.container.base}>
          <div className={premiumLayout.spacing.content}>{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface PremiumSectionProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function PremiumSection({
  children,
  className,
  animate = true,
}: PremiumSectionProps) {
  return (
    <section
      className={cn(
        premiumLayout.spacing.section,
        animate && premiumAnimations.fadeIn,
        className
      )}
    >
      {children}
    </section>
  );
}

interface PremiumGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  animate?: boolean;
}

export function PremiumGrid({
  children,
  className,
  cols = 1,
  animate = true,
}: PremiumGridProps) {
  return (
    <div
      className={cn(
        premiumLayout.grid.base,
        premiumLayout.grid.cols[cols],
        animate && premiumAnimations.fadeIn,
        className
      )}
    >
      {children}
    </div>
  );
}

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function PremiumCard({
  children,
  className,
  animate = true,
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border border-neutral-200',
        animate && premiumAnimations.fadeIn,
        className
      )}
    >
      {children}
    </div>
  );
}

interface PremiumCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumCardHeader({
  children,
  className,
}: PremiumCardHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-neutral-200',
        className
      )}
    >
      {children}
    </div>
  );
}

interface PremiumCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumCardContent({
  children,
  className,
}: PremiumCardContentProps) {
  return (
    <div
      className={cn(
        'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

interface PremiumCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumCardFooter({
  children,
  className,
}: PremiumCardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-neutral-200',
        className
      )}
    >
      {children}
    </div>
  );
} 