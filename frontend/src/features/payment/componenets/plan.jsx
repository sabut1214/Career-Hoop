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
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <Card
        className={`p-6 cursor-pointer transition-[border-color,box-shadow] duration-200 ease-out ${
          isSelected
            ? "border-primary border-2 ring-2 ring-primary/20"
            : isCurrentPlan
              ? "border-primary border-2"
              : "border-border"
        }`}
        onClick={onSelect}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">{currency}</span>
            </div>
            {price > 0 && (
              <span className="text-sm text-muted-foreground mt-1">per month</span>
            )}
          </div>

          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={(e) => {
              e.stopPropagation() // Prevent card onClick from firing
              onSelect()
            }}
            className={`w-full transition-[background-color,color] duration-200 ease-out ${
              isSelected || isCurrentPlan
                ? "bg-primary hover:bg-primary-hover text-primary-foreground"
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
