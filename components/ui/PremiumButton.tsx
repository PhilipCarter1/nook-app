import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-nook-purple-300 bg-white text-nook-purple-700 hover:bg-nook-purple-50 hover:text-nook-purple-800 hover:border-nook-purple-400 shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-nook-purple-600 to-purple-600 text-white hover:from-nook-purple-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm",
        error: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        info: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        subtle: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
        gradient: "bg-gradient-to-r from-nook-purple-500 via-purple-500 to-pink-500 text-white hover:from-nook-purple-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        ping: "animate-ping",
        wiggle: "animate-wiggle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  ripple?: boolean
  glow?: boolean
  glass?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    icon,
    iconPosition = "left",
    ripple = false,
    glow = false,
    glass = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseClasses = cn(
      buttonVariants({ variant, size, animation }),
      className,
      {
        "relative overflow-hidden": ripple,
        "shadow-[0_0_20px_rgba(147,51,234,0.3)]": glow && variant === "premium",
        "backdrop-blur-sm bg-white/10 border border-white/20": glass,
        "cursor-not-allowed opacity-50": disabled || loading,
      }
    )

    const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return
      
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      
      const rippleElement = document.createElement("span")
      rippleElement.style.width = rippleElement.style.height = size + "px"
      rippleElement.style.left = x + "px"
      rippleElement.style.top = y + "px"
      rippleElement.classList.add("ripple")
      
      button.appendChild(rippleElement)
      
      setTimeout(() => {
        rippleElement.remove()
      }, 600)
    }

    const content = (
      <>
        {loading ? (
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
            />
            {loadingText || children}
          </div>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </>
    )

    return (
      <Comp
        className={baseClasses}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleRipple}
        {...props}
      >
        {content}
        <style jsx>{`
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
          }
          
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          @keyframes wiggle {
            0%, 7% {
              transform: rotateZ(0);
            }
            15% {
              transform: rotateZ(-15deg);
            }
            20% {
              transform: rotateZ(10deg);
            }
            25% {
              transform: rotateZ(-10deg);
            }
            30% {
              transform: rotateZ(6deg);
            }
            35% {
              transform: rotateZ(-4deg);
            }
            40%, 100% {
              transform: rotateZ(0);
            }
          }
        `}</style>
      </Comp>
    )
  }
)
PremiumButton.displayName = "PremiumButton"

// Specialized Button Components
export const PrimaryButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} variant="premium" {...props} />
)
PrimaryButton.displayName = "PrimaryButton"

export const SuccessButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} variant="success" {...props} />
)
SuccessButton.displayName = "SuccessButton"

export const WarningButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} variant="warning" {...props} />
)
WarningButton.displayName = "WarningButton"

export const ErrorButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} variant="error" {...props} />
)
ErrorButton.displayName = "ErrorButton"

export const InfoButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} variant="info" {...props} />
)
InfoButton.displayName = "InfoButton"

export const GradientButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} variant="gradient" {...props} />
)
GradientButton.displayName = "GradientButton"

export const GlassButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} glass {...props} />
)
GlassButton.displayName = "GlassButton"

export const LoadingButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (props, ref) => <PremiumButton ref={ref} loading {...props} />
)
LoadingButton.displayName = "LoadingButton"

export { PremiumButton, buttonVariants } 