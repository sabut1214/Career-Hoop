// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ""))
}

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// Validate student form
export const validateStudentForm = (data) => {
  const errors = {}

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required"
  }

  if (!isValidEmail(data.email)) {
    errors.email = "Valid email is required"
  }

  if (!data.grade10Percentage || data.grade10Percentage < 0 || data.grade10Percentage > 100) {
    errors.grade10Percentage = "Valid grade 10 percentage (0-100) is required"
  }

  return errors
}

// Validate career form
export const validateCareerForm = (data) => {
  const errors = {}

  if (!data.name?.trim()) {
    errors.name = "Career name is required"
  }

  if (!data.description?.trim()) {
    errors.description = "Description is required"
  }

  return errors
}

// Check if object has errors
export const hasErrors = (errors) => Object.keys(errors).length > 0
