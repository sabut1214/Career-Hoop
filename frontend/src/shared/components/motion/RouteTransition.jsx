import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { pageTransition, reducedMotionTransition } from "@/shared/motion/tokens"

export function RouteTransition({ children }) {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const transition = prefersReducedMotion ? reducedMotionTransition : pageTransition

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} {...transition} className="min-h-[60vh]">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default RouteTransition
