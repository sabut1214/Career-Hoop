"use client"

import { useMemo } from "react"
import { cn } from "@/shared/lib/utils"

/**
 * Password Strength Meter Component
 * Visual indicator showing password strength (Weak, Medium, Strong)
 */
export function PasswordStrengthMeter({ password, className }) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: "", color: "" }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
    
    // Calculate score
    if (checks.length) score++
    if (checks.uppercase) score++
    if (checks.lowercase) score++
    if (checks.number) score++
    if (checks.special) score++
    
    // Additional points for longer passwords
    if (password.length >= 12) score++
    if (password.length >= 16) score++
    
    if (score <= 2) {
      return { level: 1, label: "Weak", color: "bg-destructive", textColor: "text-destructive" }
    } else if (score <= 4) {
      return { level: 2, label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-500" }
    } else {
      return { level: 3, label: "Strong", color: "bg-green-500", textColor: "text-green-600 dark:text-green-500" }
    }
  }, [password])
  
  if (!password) return null
  
  return (
    <div id={id} className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={cn("font-medium", strength.textColor)}>
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1 h-1.5">
        <div className={cn(
          "flex-1 rounded-full transition-colors",
          strength.level >= 1 ? strength.color : "bg-muted"
        )} />
        <div className={cn(
          "flex-1 rounded-full transition-colors",
          strength.level >= 2 ? strength.color : "bg-muted"
        )} />
        <div className={cn(
          "flex-1 rounded-full transition-colors",
          strength.level >= 3 ? strength.color : "bg-muted"
        )} />
      </div>
    </div>
  )
}

export default PasswordStrengthMeter

