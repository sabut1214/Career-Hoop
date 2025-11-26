import { cn } from "@/lib/utils"

function Spinner({ className, ...props }) {
  return (
    <div
      data-slot="spinner"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
      {...props}
    />
  )
}

export { Spinner }
