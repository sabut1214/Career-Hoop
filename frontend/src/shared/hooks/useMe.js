import { useCallback, useEffect, useState } from "react"
import { getMe } from "@/shared/lib/api"
import { useAuth } from "@/shared/context/AuthContext"

export function useMe() {
  const { user } = useAuth()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setMe(null)
      setError(null)
      setLoading(false)
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getMe()
      setMe(data)
      return data
    } catch (err) {
      setError(err)
      setMe(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { me, loading, error, refresh }
}

