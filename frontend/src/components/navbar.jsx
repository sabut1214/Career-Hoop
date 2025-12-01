import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { isDarkMode, toggleTheme } = useTheme()

  const navLinks = [
    { href: "/landing", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/why-choose-us", label: "Why Choose Us" },
    { href: "/contact", label: "Contact" },
  ]

  const handleAuthRedirect = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
            CH
          </div>
          <span className="text-xl font-bold text-foreground">
            Career<span className="text-primary">Hoop</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <Button variant="ghost" className="text-sm font-medium" onClick={() => handleAuthRedirect("/login")}>
            Log In
          </Button>
          <Button
            className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            onClick={() => handleAuthRedirect("/signup")}
          >
            Get Started
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-border/40 pt-4">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors mx-auto"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <Button variant="ghost" className="w-full text-sm font-medium" onClick={() => handleAuthRedirect("/login")}>
                Log In
              </Button>
              <Button
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleAuthRedirect("/signup")}
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

