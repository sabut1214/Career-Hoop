"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import "@/styles/Navbar.css"
import logoImg from "@/assets/images/Logo.png"

const Navbar = () => {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  const isActive = (path) => (location.pathname === path ? "active" : "")

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt="CareerHoop Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-foreground">
              areer<span className="text-primary">Hoop</span>
            </span>
          </Link>
        </div>

        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive("/")}`}>
              Home
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/careers" className={`nav-link ${isActive("/careers")}`}>
                  Careers
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/colleges" className={`nav-link ${isActive("/colleges")}`}>
                  Colleges
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/mentors" className={`nav-link ${isActive("/mentors")}`}>
                  Mentors
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/scholarships" className={`nav-link ${isActive("/scholarships")}`}>
                  Scholarships
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/trainings" className={`nav-link ${isActive("/trainings")}`}>
                  Trainings
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className={`nav-link ${isActive("/profile")}`}>
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link theme-toggle" onClick={toggleTheme}>
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
              </li>
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle">{user?.fullName || "Account"}</span>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>
                  <Link to="/admin" className="dropdown-item">
                    Admin Panel
                  </Link>
                  <button className="dropdown-item logout-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/health" className={`nav-link ${isActive("/health")}`}>
                  Health Check
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link theme-toggle" onClick={toggleTheme}>
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
              </li>
              <li className="nav-item">
                <Link to="/login" className={`nav-link ${isActive("/login")}`}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link btn-signup">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
