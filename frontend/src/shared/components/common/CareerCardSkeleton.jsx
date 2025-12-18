import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"

export function CareerCardSkeleton() {
  return (
    <Card className="border-2 animate-pulse">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="w-5 h-5 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-12" />
          </div>
          <div className="h-2 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="space-y-3">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-6 bg-muted rounded w-14" />
        </div>
        <div className="h-20 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-10 bg-muted rounded flex-1" />
          <div className="h-10 bg-muted rounded flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CareerCardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CareerCardSkeleton key={index} />
      ))}
    </div>
  )
}

