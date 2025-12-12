import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Building2, MapPin, GraduationCap, Calendar, DollarSign, ExternalLink } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const parsePrograms = (programs) => {
  if (!programs) return []
  
  if (Array.isArray(programs)) {
    return programs.map((program) => {
      if (typeof program === "string") return program
      if (typeof program === "object" && program !== null) {
        return program.name || program.title || program.program || ""
      }
      return ""
    }).filter(Boolean)
  }

  if (typeof programs === "string") {
    const trimmed = programs.trim()
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(programs)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (typeof item === "string") return item
            if (typeof item === "object" && item !== null) {
              return item.name || item.title || item.program || ""
            }
            return ""
          }).filter(Boolean)
        }
      } catch (error) {
        return programs.split(",").map((item) => item.trim()).filter(Boolean)
      }
    } else {
      return programs.split(",").map((item) => item.trim()).filter(Boolean)
    }
  }

  return []
}

export default function ComparisonTable({ colleges }) {
  if (!colleges || colleges.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No colleges to compare</p>
        </CardContent>
      </Card>
    )
  }

  const comparisonFields = [
    {
      label: "Name",
      getValue: (college) => college.name || "N/A",
      icon: Building2,
    },
    {
      label: "Location",
      getValue: (college) => college.location || "N/A",
      icon: MapPin,
    },
    {
      label: "Affiliation",
      getValue: (college) => college.affiliation || "N/A",
      icon: GraduationCap,
    },
    {
      label: "Established Year",
      getValue: (college) => college.establishedYear || college.established || "N/A",
      icon: Calendar,
    },
    {
      label: "Type",
      getValue: (college) => {
        const type = college.type || ""
        if (type.toLowerCase().includes("public")) return "Public"
        if (type.toLowerCase().includes("private")) return "Private"
        return type || "Unknown"
      },
    },
    {
      label: "Tuition",
      getValue: (college) => college.tuition || college.feesRange || "N/A",
      icon: DollarSign,
    },
    {
      label: "Programs",
      getValue: (college) => {
        const programs = parsePrograms(college.programs)
        return programs.length > 0 ? programs.slice(0, 5).join(", ") : "N/A"
      },
      isMultiLine: true,
    },
    {
      label: "Description",
      getValue: (college) => {
        const desc = college.overview || college.description || ""
        return desc.length > 150 ? desc.substring(0, 150) + "..." : desc || "N/A"
      },
      isMultiLine: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          College Comparison ({colleges.length} colleges)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold sticky left-0 bg-background z-10 min-w-[200px]">
                    Criteria
                  </th>
                  {colleges.map((college, index) => (
                    <th key={college.id || index} className="text-left p-4 font-semibold min-w-[250px] max-w-[300px]">
                      <div className="space-y-2">
                        <div className="font-bold text-lg">{college.name || "Unknown"}</div>
                        {college.detailUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(college.detailUrl, '_blank')}
                            className="w-full"
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field, fieldIndex) => (
                  <tr key={fieldIndex} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        {field.icon && <field.icon className="h-4 w-4 text-muted-foreground" />}
                        {field.label}
                      </div>
                    </td>
                    {colleges.map((college, collegeIndex) => (
                      <td key={college.id || collegeIndex} className="p-4">
                        <div className={field.isMultiLine ? "space-y-1" : ""}>
                          {field.label === "Programs" && parsePrograms(college.programs).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {parsePrograms(college.programs).slice(0, 3).map((program, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {program}
                                </Badge>
                              ))}
                              {parsePrograms(college.programs).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{parsePrograms(college.programs).length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm">{field.getValue(college)}</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

