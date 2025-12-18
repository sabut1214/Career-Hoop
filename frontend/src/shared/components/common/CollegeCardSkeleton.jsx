import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"

export function CollegeCardSkeleton() {
  return (
    <Card className="border-2 animate-pulse">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
          <div className="w-5 h-5 rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-muted rounded w-20" />
            <div className="h-6 bg-muted rounded w-24" />
            <div className="h-6 bg-muted rounded w-18" />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-10 bg-muted rounded flex-1" />
          <div className="h-10 bg-muted rounded w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CollegeCardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CollegeCardSkeleton key={index} />
      ))}
    </div>
  )
}

