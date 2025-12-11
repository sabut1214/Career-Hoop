import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileJson, FileText, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"
import { fetchWithAuth } from "@/lib/api"

/**
 * DataExport component allows users to download their profile data.
 * 
 * Features:
 * - Export profile data as JSON format
 * - Export profile data as PDF format
 * - Includes profile information, saved careers, and saved colleges
 * - Automatic file download with proper naming
 * 
 * @returns {JSX.Element} The data export component
 */
export function DataExport() {
  const { user } = useAuth()
  const [isExportingJson, setIsExportingJson] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExport = async (format) => {
    if (!user?.id) {
      toast.error("User not authenticated")
      return
    }

    const isJson = format === "json"
    if (isJson) {
      setIsExportingJson(true)
    } else {
      setIsExportingPdf(true)
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/users/${user.id}/export/${format}`,
        {
          method: "GET",
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || `Failed to export ${format.toUpperCase()}`
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      
      // Check if blob is empty or invalid
      if (blob.size === 0) {
        throw new Error(`Export failed: received empty ${format.toUpperCase()} file`)
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `careerhoop-export-${user.id}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${format.toUpperCase()} export downloaded successfully`)
    } catch (error) {
      const errorMessage = error.message || `Failed to export ${format.toUpperCase()}. Please try again.`
      toast.error(errorMessage)
      console.error(`Export ${format} error:`, error)
    } finally {
      if (isJson) {
        setIsExportingJson(false)
      } else {
        setIsExportingPdf(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Export
        </CardTitle>
        <CardDescription>Download your profile data in various formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Export your profile data, saved careers, and saved colleges for backup or migration purposes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            disabled={isExportingJson || isExportingPdf}
            className="flex-1"
          >
            {isExportingJson ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={isExportingJson || isExportingPdf}
            className="flex-1"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


