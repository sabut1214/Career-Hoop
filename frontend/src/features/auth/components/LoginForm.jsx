"use client"
import { useForm } from "@/shared/hooks/useForm"
import { isValidEmail } from "@/shared/utils/validators"
import "../styles/LoginForm.css"

export const LoginForm = ({ onSubmit, isLoading = false }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: "", password: "" },
    async (formData) => {
      const validationErrors = {}

      if (!isValidEmail(formData.email)) {
        validationErrors.email = "Valid email is required"
      }

      if (!formData.password || formData.password.length < 6) {
        validationErrors.password = "Password must be at least 6 characters"
      }

      if (Object.keys(validationErrors).length > 0) {
        throw { validationErrors }
      }

      await onSubmit(formData)
    },
  )

  return (
    <form className="login-form" onSubmit={handleSubmit}>
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
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${touched.password && errors.password ? "error" : ""}`}
          disabled={isLoading}
        />
        {touched.password && errors.password && <span className="form-error">{errors.password}</span>}
      </div>

      <button type="submit" className="form-submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log In"}
      </button>
    </form>
  )
}

export default LoginForm
