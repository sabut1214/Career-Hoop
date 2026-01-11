import { cn } from "@/shared/lib/utils"

export function SectionContainer({ 
  className, 
  children, 
  variant = "default",
  ...props 
}) {
  const variants = {
    default: "px-4 py-16 md:py-24 lg:py-32",
    compact: "px-4 py-12 md:py-16 lg:py-20",
    spacious: "px-4 py-20 md:py-28 lg:py-36",
  }

  return (
    <section 
      className={cn(
        "container mx-auto max-w-6xl",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export default SectionContainer

