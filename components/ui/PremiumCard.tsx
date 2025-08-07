import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        elevated: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200",
        outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
        glass: "bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border-white/20 dark:border-gray-700/20",
        gradient: "bg-gradient-to-br from-nook-purple-50 to-purple-50 dark:from-nook-purple-900/20 dark:to-purple-900/20 border-nook-purple-200 dark:border-nook-purple-800",
        premium: "bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-gray-200 dark:border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-300",
        success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      animation: {
        none: "",
        hover: "hover:scale-105 transition-transform duration-200",
        float: "hover:-translate-y-1 transition-transform duration-200",
        glow: "hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-shadow duration-200",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface PremiumCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  interactive?: boolean
  loading?: boolean
  disabled?: boolean
  glow?: boolean
  border?: boolean
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl"
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false,
    interactive = false,
    loading = false,
    disabled = false,
    glow = false,
    border = true,
    shadow = "sm",
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? React.Fragment : "div"
    
    const baseClasses = cn(
      cardVariants({ variant, size, animation }),
      {
        "cursor-pointer": interactive && !disabled,
        "opacity-50 cursor-not-allowed": disabled,
        "border-0": !border,
        "shadow-none": shadow === "none",
        "shadow-sm": shadow === "sm",
        "shadow-md": shadow === "md",
        "shadow-lg": shadow === "lg",
        "shadow-xl": shadow === "xl",
        "shadow-2xl": shadow === "2xl",
        "shadow-[0_0_30px_rgba(147,51,234,0.3)]": glow,
      },
      className
    )

    const content = (
      <div
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-nook-purple-600 border-t-transparent rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          </div>
        )}
        {children}
      </div>
    )

    return content
  }
)
PremiumCard.displayName = "PremiumCard"

const PremiumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
PremiumCardHeader.displayName = "PremiumCardHeader"

const PremiumCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white",
      className
    )}
    {...props}
  />
))
PremiumCardTitle.displayName = "PremiumCardTitle"

const PremiumCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
))
PremiumCardDescription.displayName = "PremiumCardDescription"

const PremiumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
PremiumCardContent.displayName = "PremiumCardContent"

const PremiumCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
PremiumCardFooter.displayName = "PremiumCardFooter"

// Specialized Card Components
export const ElevatedCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="elevated" {...props} />
)
ElevatedCard.displayName = "ElevatedCard"

export const GlassCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="glass" {...props} />
)
GlassCard.displayName = "GlassCard"

export const GradientCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="gradient" {...props} />
)
GradientCard.displayName = "GradientCard"

export const PremiumCardComponent = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="premium" {...props} />
)
PremiumCardComponent.displayName = "PremiumCardComponent"

export const SuccessCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="success" {...props} />
)
SuccessCard.displayName = "SuccessCard"

export const WarningCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="warning" {...props} />
)
WarningCard.displayName = "WarningCard"

export const ErrorCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="error" {...props} />
)
ErrorCard.displayName = "ErrorCard"

export const InfoCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} variant="info" {...props} />
)
InfoCard.displayName = "InfoCard"

export const InteractiveCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} interactive animation="hover" {...props} />
)
InteractiveCard.displayName = "InteractiveCard"

export const LoadingCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (props, ref) => <PremiumCard ref={ref} loading {...props} />
)
LoadingCard.displayName = "LoadingCard"

export { 
  PremiumCard, 
  PremiumCardHeader, 
  PremiumCardFooter, 
  PremiumCardTitle, 
  PremiumCardDescription, 
  PremiumCardContent,
  cardVariants 
} 