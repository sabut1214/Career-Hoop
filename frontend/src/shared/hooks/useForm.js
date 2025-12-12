"use client"

import { useState } from "react"

export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  const setFieldError = (fieldName, errorMessage) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }))
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldError,
    setValues,
  }
}

export default useForm
