import RouteContent from "@/shared/components/layout/RouteContent"

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div id="main-content">
        <RouteContent fallbackMessage="Loading page..." />
      </div>
    </div>
  )
}

export default PublicLayout
