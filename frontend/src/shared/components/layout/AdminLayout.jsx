import RouteContent from "@/shared/components/layout/RouteContent"
import { AdminSidebar } from "@/features/admin/components/sidebar"
import { ProtectedRoute } from "@/shared/components/protected-route"

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
        <ProtectedRoute requiredRole="admin" fullScreen={false}>
          <RouteContent fallbackMessage="Loading admin workspace..." />
        </ProtectedRoute>
      </main>
    </div>
  )
}

export default AdminLayout
