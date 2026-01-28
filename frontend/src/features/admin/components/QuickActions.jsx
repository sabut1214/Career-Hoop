import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import {
  BookOpen,
  Building2,
  Zap,
  Download,
  Upload
} from "lucide-react"
import { importAllData } from "@/shared/lib/api"
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
      label: "Add Career",
      icon: BookOpen,
      onClick: () => navigate("/admin/careers"),
      color: "bg-secondary/10 text-secondary hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-secondary"
    },
    {
      label: "Add College",
      icon: Building2,
      onClick: () => navigate("/admin/colleges"),
      color: "bg-accent/10 text-accent hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent"
    },
    {
      label: "Add Training",
      icon: Zap,
      onClick: () => navigate("/admin/trainings"),
      color: "bg-warning/10 text-warning hover:bg-warning/20 focus-visible:ring-2 focus-visible:ring-warning"
    },
    {
      label: "Import Data",
      icon: Upload,
      onClick: handleImportData,
      color: "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
    },
    {
      label: "Export Data",
      icon: Download,
      onClick: handleExportData,
      color: "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60",
      disabled: true,
      tooltip: "Coming soon"
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
                onClick={action.disabled ? undefined : action.onClick}
                disabled={action.disabled}
                title={action.tooltip}
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
