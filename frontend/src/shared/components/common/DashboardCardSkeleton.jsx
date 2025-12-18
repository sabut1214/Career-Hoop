import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"

export function DashboardCardSkeleton() {
  return (
    <Card className="border-2 animate-pulse h-full">
      <CardHeader className="space-y-4">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-10 bg-muted rounded w-full" />
      </CardContent>
    </Card>
  )
}

export function DashboardCardSkeletonGrid({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <DashboardCardSkeleton key={index} />
      ))}
    </div>
  )
}

