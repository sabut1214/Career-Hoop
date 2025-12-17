import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-muted hover:text-foreground",
        // Light background with dark text (for chips on light surfaces)
        light: "border-transparent bg-surface text-foreground hover:bg-muted active:bg-muted/80",
        // Primary/dark background with white text
        primary: "border-transparent bg-primary-600 text-primary-foreground hover:bg-primary active:bg-primary-active",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
