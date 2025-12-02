"use client"

import { useState, useEffect } from "react"

export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetchFunction()
        if (isMounted) {
          setData(response.data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "An error occurred")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetch()

    return () => {
      isMounted = false
    }
  }, dependencies)

  const refetch = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchFunction()
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, refetch }
}

export default useFetch
