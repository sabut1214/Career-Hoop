import { Card } from "@/shared/components/ui/card"

export function OrderSummary({ selectedPlan, selectedPrice, currentPlan, upgradeAmount }) {
  const total = upgradeAmount || selectedPrice

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
      <div className="space-y-3">
        {currentPlan && upgradeAmount ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Upgrade to {selectedPlan}</span>
              <span className="text-foreground font-semibold">{upgradeAmount.toLocaleString()} NPR</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-success">{total.toLocaleString()} NPR</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{selectedPlan} Plan</span>
              <span className="text-foreground font-semibold">{selectedPrice.toLocaleString()} NPR</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-success">{total.toLocaleString()} NPR</span>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
