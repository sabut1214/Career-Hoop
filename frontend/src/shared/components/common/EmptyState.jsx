"use client"

import { Search, BookOpen, Heart, AlertCircle, Inbox } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

/**
 * Empty state component for displaying when there's no data.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = "No items found",
  description = "There are no items to display at this time.",
  action,
  actionLabel,
  className,
}) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-3">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && actionLabel && (
        <CardContent className="flex justify-center">
          <Button onClick={action} variant="default">
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Empty state for search results.
 */
export function EmptySearchState({ searchTerm, onClearSearch }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find any colleges matching "${searchTerm}". Try adjusting your search terms.`}
      action={onClearSearch}
      actionLabel="Clear Search"
    />
  )
}

/**
 * Empty state for saved items.
 */
export function EmptySavedState({ type = "colleges", onBrowse }) {
  const titles = {
    colleges: "No saved colleges",
    careers: "No saved careers",
  }
  const descriptions = {
    colleges: "You haven't saved any colleges yet. Start exploring and save colleges you're interested in!",
    careers: "You haven't saved any careers yet. Start exploring and save careers you're interested in!",
  }
  
  return (
    <EmptyState
      icon={Heart}
      title={titles[type] || "No saved items"}
      description={descriptions[type] || "You haven't saved any items yet."}
      action={onBrowse}
      actionLabel={`Browse ${type}`}
    />
  )
}

/**
 * Empty state for error states.
 */
export function EmptyErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description={error || "An unexpected error occurred. Please try again."}
      action={onRetry}
      actionLabel="Try Again"
      className="border-destructive/50"
    />
  )
}

/**
 * Empty state for no data.
 */
export function EmptyDataState({ type = "items", onAdd }) {
  return (
    <EmptyState
      icon={BookOpen}
      title={`No ${type} available`}
      description={`There are no ${type} to display at this time.`}
      action={onAdd}
      actionLabel={`Add ${type}`}
    />
  )
}

export default EmptyState

