"use client"
import { useForm } from "@/shared/hooks/useForm"
import { validateStudentForm } from "@/shared/utils/validators"
import "@/features/profile/styles/StudentForm.css"

export const StudentForm = ({ initialData = {}, onSubmit, isLoading = false }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    {
      fullName: initialData.fullName || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      grade10Percentage: initialData.grade10Percentage || "",
      interests: initialData.interests || "",
    },
    async (formData) => {
      const validationErrors = validateStudentForm(formData)

      if (Object.keys(validationErrors).length > 0) {
        throw { validationErrors }
      }

      await onSubmit(formData)
    },
  )

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${touched.fullName && errors.fullName ? "error" : ""}`}
          disabled={isLoading}
        />
        {touched.fullName && errors.fullName && <span className="form-error">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${touched.email && errors.email ? "error" : ""}`}
          disabled={isLoading}
        />
        {touched.email && errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className="form-input"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="grade10Percentage">Grade 10 Percentage</label>
        <input
          type="number"
          id="grade10Percentage"
          name="grade10Percentage"
          value={values.grade10Percentage}
          onChange={handleChange}
          onBlur={handleBlur}
          min="0"
          max="100"
          className={`form-input ${touched.grade10Percentage && errors.grade10Percentage ? "error" : ""}`}
          disabled={isLoading}
        />
        {touched.grade10Percentage && errors.grade10Percentage && (
          <span className="form-error">{errors.grade10Percentage}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="interests">Interests (comma-separated)</label>
        <textarea
          id="interests"
          name="interests"
          value={values.interests}
          onChange={handleChange}
          onBlur={handleBlur}
          rows="4"
          className="form-input"
          disabled={isLoading}
        />
      </div>

      <button type="submit" className="form-submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Student"}
      </button>
    </form>
  )
}

export default StudentForm
