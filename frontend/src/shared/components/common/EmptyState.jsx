import { Search, AlertCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"

/**
 * Reusable EmptyState component for displaying empty states with optional CTAs
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Icon component to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {Object} [props.action] - Optional action button
 * @param {string} props.action.label - Button label
 * @param {Function} props.action.onClick - Button click handler
 * @param {'primary' | 'secondary'} [props.action.variant] - Button variant
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="border-2 border-dashed bg-muted/30">
      <CardContent className="py-12 px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {Icon && (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size="lg"
              className="mt-4"
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state for search results
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onClearSearch - Handler to clear search
 */
export function EmptySearchState({ searchTerm, onClearSearch }) {
  return (
    <EmptyState
      icon={Search}
      title="No Colleges Found"
      description={searchTerm 
        ? `We couldn't find any colleges matching "${searchTerm}". Try adjusting your search or filters.`
        : "No colleges match your current filters. Try adjusting your search criteria."}
      action={searchTerm ? {
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "secondary"
      } : undefined}
    />
  )
}

/**
 * Empty state for error scenarios
 * @param {Object} props
 * @param {string|Error} [props.error] - Error message or error object to display
 * @param {string} [props.message] - Error message to display (alternative to error prop)
 * @param {Function} [props.onRetry] - Optional retry handler
 */
export function EmptyErrorState({ error, message, onRetry }) {
  const errorMessage = message || (typeof error === 'string' ? error : error?.message) || "We're having trouble loading the data. Please try again."
  
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something Went Wrong"
      description={errorMessage}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "default"
      } : undefined}
    />
  )
}
