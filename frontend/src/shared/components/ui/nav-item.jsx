import { NavLink } from "react-router-dom"
import { cn } from "@/shared/lib/utils"
import { cva } from "class-variance-authority"

const navItemVariants = cva(
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        active: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export function NavItem({ to, className, children, ...props }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          navItemVariants({ variant: isActive ? "active" : "default" }),
          className
        )
      }
      {...props}
    >
      {children}
    </NavLink>
  )
}

