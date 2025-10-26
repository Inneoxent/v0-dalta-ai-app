import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
    const variantStyles = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-border text-foreground hover:bg-muted",
    }

    return <button ref={ref} className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props} />
  },
)
Button.displayName = "Button"

export { Button }
