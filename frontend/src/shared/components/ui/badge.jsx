import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
        primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary: "border-transparent bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 active:bg-secondary/40",
        success: "border-transparent bg-[#ddf1dd] text-[#005f00] hover:bg-[#bfe3bf] active:bg-[#93cc93]", // green-100 bg, green-700 text
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80", // Brand Mint
        outline: "text-foreground border-border/50 bg-transparent hover:bg-muted/50 hover:border-border",
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
