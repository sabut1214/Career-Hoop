"use client"

import { createContext, useState, useContext, useEffect } from "react"

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage immediately to prevent flash
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        return storedTheme
      }
    }
    return "system"
  }

  const [theme, setTheme] = useState(getInitialTheme)
  
  // Initialize isDarkMode based on the initial theme
  const getInitialDarkMode = () => {
    const initialTheme = getInitialTheme()
    if (initialTheme === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
      }
      return false
    }
    return initialTheme === "dark"
  }
  
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode)

  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setIsDarkMode(prefersDark)
      } else {
        setIsDarkMode(theme === "dark")
      }
    }

    updateTheme()

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => updateTheme()
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  // Apply theme to document and persist to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      localStorage.setItem("theme", theme)
    }
  }, [isDarkMode, theme])

  const setThemeValue = (newTheme) => {
    setTheme(newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return <ThemeContext.Provider value={{ theme, isDarkMode, setTheme: setThemeValue, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
