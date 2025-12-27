import { Spinner } from "@/shared/components/ui/spinner"

export function RouteLoadingFallback({ message = "Loading content..." }) {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}

export default RouteLoadingFallback
