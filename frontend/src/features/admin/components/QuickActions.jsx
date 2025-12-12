import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { 
  UserPlus, 
  BookOpen, 
  Building2, 
  Zap, 
  Download, 
  Upload
} from "lucide-react"
import { importAllData } from "@/lib/api"
import { toast } from "react-toastify"

export function QuickActions() {
  const navigate = useNavigate()

  const handleImportData = async () => {
    try {
      await importAllData()
      toast.success("Data import initiated successfully")
    } catch (error) {
      console.error("Failed to import data:", error)
      toast.error("Failed to import data")
    }
  }

  const handleExportData = () => {
    toast.info("Export feature coming soon")
  }

  const actions = [
    {
      label: "Add Student",
      icon: UserPlus,
      onClick: () => navigate("/admin/students"),
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200"
    },
    {
      label: "Add Career",
      icon: BookOpen,
      onClick: () => navigate("/admin/careers"),
      color: "bg-green-100 text-green-600 hover:bg-green-200"
    },
    {
      label: "Add College",
      icon: Building2,
      onClick: () => navigate("/admin/colleges"),
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200"
    },
    {
      label: "Add Training",
      icon: Zap,
      onClick: () => navigate("/admin/trainings"),
      color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
    },
    {
      label: "Import Data",
      icon: Upload,
      onClick: handleImportData,
      color: "bg-orange-100 text-orange-600 hover:bg-orange-200"
    },
    {
      label: "Export Data",
      icon: Download,
      onClick: handleExportData,
      color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
    },
  ]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="outline"
                className={`flex flex-col items-center justify-center h-20 gap-2 ${action.color}`}
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

