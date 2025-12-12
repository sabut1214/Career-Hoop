"use client"

import { useState, useCallback } from "react"
import "../../styles/SearchBar.css"

export const SearchBar = ({ onSearch, placeholder = "Search...", debounceDelay = 300 }) => {
  const [value, setValue] = useState("")
  const [debounceTimer, setDebounceTimer] = useState(null)

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value
      setValue(newValue)

      if (debounceTimer) clearTimeout(debounceTimer)

      const timer = setTimeout(() => {
        onSearch(newValue)
      }, debounceDelay)

      setDebounceTimer(timer)
    },
    [debounceTimer, debounceDelay, onSearch],
  )

  const handleClear = () => {
    setValue("")
    onSearch("")
  }

  return (
    <div className="search-bar">
      <input type="text" value={value} onChange={handleChange} placeholder={placeholder} className="search-input" />
      {value && (
        <button className="search-clear" onClick={handleClear}>
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
