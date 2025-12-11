import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"

export default function CollegeFilters({ filters, onFiltersChange, onClearFilters }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    affiliations: []
  })
  const [loadingOptions, setLoadingOptions] = useState(false)

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingOptions(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/colleges/filters/options`)
        if (response.ok) {
          const data = await response.json()
          setFilterOptions(data)
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error)
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchFilterOptions()
  }, [])

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== null && value !== undefined && value !== "" && value !== "all"
  ).length

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" || value === "" ? null : value
    })
  }

  const currentYear = new Date().getFullYear()
  const minYear = 1950
  const maxYear = currentYear

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter Colleges</CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={filters.location || "all"}
                  onValueChange={(value) => handleFilterChange("location", value)}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {loadingOptions ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      filterOptions.locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliation Filter */}
              <div className="space-y-2">
                <Label htmlFor="affiliation">Affiliation</Label>
                <Select
                  value={filters.affiliation || "all"}
                  onValueChange={(value) => handleFilterChange("affiliation", value)}
                >
                  <SelectTrigger id="affiliation">
                    <SelectValue placeholder="All Affiliations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Affiliations</SelectItem>
                    {loadingOptions ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      filterOptions.affiliations.map((affiliation) => (
                        <SelectItem key={affiliation} value={affiliation}>
                          {affiliation}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <Label htmlFor="minYear">Established Year (From)</Label>
                <Input
                  id="minYear"
                  type="number"
                  min={minYear}
                  max={maxYear}
                  placeholder="From year"
                  value={filters.minYear || ""}
                  onChange={(e) => handleFilterChange("minYear", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxYear">Established Year (To)</Label>
                <Input
                  id="maxYear"
                  type="number"
                  min={minYear}
                  max={maxYear}
                  placeholder="To year"
                  value={filters.maxYear || ""}
                  onChange={(e) => handleFilterChange("maxYear", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              {/* Program Filter */}
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  placeholder="Search by program name..."
                  value={filters.program || ""}
                  onChange={(e) => handleFilterChange("program", e.target.value)}
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy || "name"}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="year">Established Year</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Order</Label>
                <Select
                  value={filters.sortOrder || "asc"}
                  onValueChange={(value) => handleFilterChange("sortOrder", value)}
                >
                  <SelectTrigger id="sortOrder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}

