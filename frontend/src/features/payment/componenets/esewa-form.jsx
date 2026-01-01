import { useEffect } from "react"

export function EsewaRedirectForm({ actionUrl, fields }) {
  useEffect(() => {
    // Auto-submit the form to redirect to eSewa
    const form = document.getElementById("esewa-form")
    if (form) {
      form.submit()
    }
  }, [])

  return (
    <form id="esewa-form" action={actionUrl} method="POST" className="hidden">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  )
}
