"use client"

import { useNavigate, useLocation } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Check, X } from "lucide-react"

const FREE_FEATURES = [
  "Basic career recommendations",
  "Interest assessment",
  "Basic college search",
  "Limited training modules",
]

const PRO_FEATURES = [
  "All Free features",
  "Advanced career matching",
  "Unlimited training modules",
  "Priority support",
  "Personalized guidance",
  "Advanced analytics",
]

export function ProPaywallModal({ open, onOpenChange }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleUpgrade = () => {
    // Store intended destination before navigating to checkout
    const currentPath = location.pathname + (location.search || "")
    if (currentPath !== "/checkout/pro" && currentPath !== "/billing") {
      // Use postUpgradeRedirect for consistency with other components
      const existingRedirect = sessionStorage.getItem("postUpgradeRedirect")
      if (!existingRedirect || existingRedirect === "/checkout/pro" || existingRedirect === "/billing") {
        sessionStorage.setItem("postUpgradeRedirect", currentPath)
      }
    }
    // Mark that user came from modal - auto-proceed to payment when ready
    sessionStorage.setItem("auto_proceed_from_modal", "true")
    onOpenChange(false)
    navigate("/checkout/pro")
  }

  const handleNotNow = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-base">
            Unlock all premium features and take your career journey to the next level
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Free</h3>
                <span className="text-2xl font-bold text-foreground">Free</span>
              </div>
              <ul className="space-y-2">
                {FREE_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Pro</h3>
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">500</span>
                    <span className="text-sm text-muted-foreground">NPR</span>
                  </div>
                  <span className="text-xs text-muted-foreground">per month</span>
                </div>
              </div>
              <ul className="space-y-2">
                {PRO_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleNotNow} className="bg-transparent">
            Not now
          </Button>
          <Button
            onClick={handleUpgrade}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
