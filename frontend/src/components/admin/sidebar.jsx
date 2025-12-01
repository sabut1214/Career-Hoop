import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, BookOpen, Building2, Users2, Gift, Zap, FileText, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed")
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(isCollapsed))
    // Update CSS variable for main content margin
    document.documentElement.style.setProperty(
      "--admin-sidebar-width",
      isCollapsed ? "5rem" : "16rem"
    )
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/careers", label: "Careers", icon: BookOpen },
    { href: "/admin/colleges", label: "Colleges", icon: Building2 },
    { href: "/admin/mentors", label: "Mentors", icon: Users2 },
    { href: "/admin/scholarships", label: "Scholarships", icon: Gift },
    { href: "/admin/trainings", label: "Trainings", icon: Zap },
    { href: "/admin/academic-records", label: "Academic Records", icon: FileText },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? "w-20 p-4" : "w-64 p-6"
      }`}
    >
      {/* Header with Logo and Toggle */}
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <Link to="/admin">
            <h1 className="text-2xl font-bold text-sidebar-primary">CareerHoop Admin</h1>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/admin" className="flex items-center justify-center" title="CareerHoop Admin">
            <LayoutDashboard className="h-8 w-8 text-sidebar-primary" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} to={item.href} title={isCollapsed ? item.label : ""}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full h-12 ${
                  isCollapsed
                    ? "justify-center px-0"
                    : "justify-start gap-3"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Button
        variant="outline"
        className={`w-full h-12 text-destructive hover:text-destructive bg-transparent ${
          isCollapsed ? "justify-center px-0" : "justify-start gap-3"
        }`}
        onClick={handleLogout}
        title={isCollapsed ? "Logout" : ""}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>Logout</span>}
      </Button>
    </aside>
  )
}

