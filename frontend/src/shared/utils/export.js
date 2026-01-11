/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 * @param {Array} columns - Array of column definitions [{key: string, label: string}]
 */
export function exportToCSV(data, filename = "export.csv", columns = null) {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

  // If columns not provided, use all keys from first object
  if (!columns) {
    const firstItem = data[0]
    columns = Object.keys(firstItem).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")
    }))
  }

  // Create CSV header
  const headers = columns.map(col => col.label).join(",")

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key]
      // Handle null/undefined
      if (value === null || value === undefined) return ""
      // Handle objects/arrays
      if (typeof value === "object") {
        if (Array.isArray(value)) {
          return `"${value.join(", ")}"`
        }
        return `"${JSON.stringify(value)}"`
      }
      // Handle strings with commas/quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(",")
  })

  // Combine header and rows
  const csvContent = [headers, ...rows].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export data to JSON format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export function exportToJSON(data, filename = "export.json") {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

