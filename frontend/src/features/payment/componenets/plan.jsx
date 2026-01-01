import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

export function PlanCard({
  name,
  price,
  currency = "NPR",
  description,
  features,
  isSelected = false,
  isCurrentPlan = false,
  onSelect,
  buttonText = "Select Plan",
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={`p-6 cursor-pointer transition-all ${
          isSelected
            ? "border-green-600 border-2 ring-2 ring-green-100"
            : isCurrentPlan
              ? "border-green-600 border-2"
              : "border-border"
        }`}
        onClick={onSelect}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">{price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">{currency}</span>
          </div>

          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={onSelect}
            className={`w-full transition-all ${
              isSelected || isCurrentPlan
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-muted hover:bg-muted text-foreground"
            }`}
          >
            {isCurrentPlan ? "Current Plan" : buttonText}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
