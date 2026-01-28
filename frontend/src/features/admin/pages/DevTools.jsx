import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { grantProPlan } from "@/shared/lib/api"
import { toast } from "react-toastify"
import { Loader2, Zap, Mail } from "lucide-react"

export default function DevTools() {
  const [email, setEmail] = useState("")
  const [lifetimeSubscription, setLifetimeSubscription] = useState(true)
  const [expiresAt, setExpiresAt] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter an email address")
      return
    }

    if (!lifetimeSubscription && !expiresAt) {
      toast.error("Please enter an expiry date or select lifetime subscription")
      return
    }

    setLoading(true)
    try {
      const expiryDate = lifetimeSubscription ? null : new Date(expiresAt).toISOString()
      await grantProPlan(email, expiryDate)
      toast.success(`Pro plan granted successfully to ${email}`)
      setEmail("")
      setExpiresAt("")
      setLifetimeSubscription(true)
    } catch (error) {
      const errorMessage = error.message || "Failed to grant pro plan"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dev Tools</h1>
        <p className="text-muted-foreground mt-2">
          Administrative tools for development and testing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Grant Pro Plan
          </CardTitle>
          <CardDescription>
            Grant Pro plan subscription to a user by email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lifetime"
                checked={lifetimeSubscription}
                onCheckedChange={(checked) => {
                  setLifetimeSubscription(checked)
                  if (checked) {
                    setExpiresAt("")
                  }
                }}
              />
              <Label
                htmlFor="lifetime"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Lifetime subscription (no expiry date)
              </Label>
            </div>

            {!lifetimeSubscription && (
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  required={!lifetimeSubscription}
                />
                <p className="text-sm text-muted-foreground">
                  The subscription will expire on this date and time
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting Pro Plan...
                </>
              ) : (
                "Grant Pro Plan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
