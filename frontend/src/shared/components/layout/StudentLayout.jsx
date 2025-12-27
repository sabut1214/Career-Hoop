import RouteContent from "@/shared/components/layout/RouteContent"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { ProtectedRoute } from "@/shared/components/protected-route"

export function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:ml-64">
        <ProtectedRoute requiredRole="student" fullScreen={false}>
          <RouteContent fallbackMessage="Loading your dashboard..." />
        </ProtectedRoute>
      </main>
    </div>
  )
}

export default StudentLayout
