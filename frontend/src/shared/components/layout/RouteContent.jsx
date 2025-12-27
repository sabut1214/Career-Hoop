import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import { RouteTransition } from "@/shared/components/motion/RouteTransition"
import { RouteLoadingFallback } from "@/shared/components/common/RouteLoadingFallback"

export function RouteContent({ fallbackMessage }) {
  return (
    <Suspense fallback={<RouteLoadingFallback message={fallbackMessage} />}>
      <RouteTransition>
        <Outlet />
      </RouteTransition>
    </Suspense>
  )
}

export default RouteContent
