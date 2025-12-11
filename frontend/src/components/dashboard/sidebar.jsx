import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Home,
  BookOpen,
  Target,
  BarChart3,
  Building2,
  User,
  Settings,
  LogOut,
  Briefcase,
  Users,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import logoImg from "@/assets/images/Logo.png"

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "Enter Grades", href: "/grades" },
  { icon: Target, label: "Interests", href: "/interests" },
  { icon: BarChart3, label: "Recommendations", href: "/recommendations" },
  { icon: Building2, label: "Colleges", href: "/colleges" },
  { icon: Briefcase, label: "Careers", href: "/careers" },
  { icon: Users, label: "Mentors", href: "/mentors" },
  { icon: BookOpen, label: "Training", href: "/trainings" },
  { icon: Activity, label: "Quiz Analytics", href: "/quiz/analytics" },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    return saved ? JSON.parse(saved) : false
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "5rem" : "16rem")
  }, [isCollapsed])

  // Mark as animated after first render
  if (!hasAnimatedRef.current) {
    hasAnimatedRef.current = true
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // close drawer on navigation
    setIsMobileOpen(false)
  }, [location.pathname])

  const toggleSidebar = () => setIsCollapsed((prev) => !prev)
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"
    const name = user.name || user.fullName || user.email || "User"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return "User"
    return user.name || user.fullName || user.email?.split("@")[0] || "User"
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 rounded-full shadow-md bg-background/80 backdrop-blur"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle navigation</span>
      </Button>

      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={toggleMobileSidebar} />
      )}

      <motion.aside
        {...(!hasAnimatedRef.current && { initial: { x: -300 } })}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border z-40 overflow-y-auto transition-all duration-300",
          isCollapsed ? "w-20 p-4" : "w-64 p-6",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
      {/* Header with Logo and Toggle */}
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt="CareerHoop Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-bold text-foreground">
              areer<span className="text-primary">Hoop</span>
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/" className="flex items-center justify-center">
            <img src={logoImg} alt="CareerHoop Logo" className="h-8 w-8 object-contain" />
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

      {/* Navigation */}
      <nav className="space-y-2">
        {!isCollapsed && (
          <p className="text-sm font-medium text-muted-foreground mb-4">NAVIGATION</p>
        )}
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.href
          return (
            <motion.div
              key={item.label}
              {...(!hasAnimatedRef.current && { initial: { opacity: 0, x: -20 } })}
              animate={{ opacity: 1, x: 0 }}
              transition={hasAnimatedRef.current ? { duration: 0 } : { duration: 0.4, delay: 0.1 + index * 0.05 }}
            >
              <Link to={item.href} title={isCollapsed ? item.label : ""}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full h-12 text-sm",
                    isCollapsed ? "justify-center px-0" : "justify-start gap-3",
                    isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsMobileOpen(false)
                  }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center gap-2 truncate">
                      <span className="truncate">{item.label}</span>
                    </div>
                  )}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User Menu - ChatGPT Style */}
      <div className={`absolute bottom-6 ${isCollapsed ? "left-2 right-2" : "left-6 right-6"}`}>
        <div className="border-t border-border pt-4">
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center p-2 hover:bg-muted/50 rounded-lg"
                  title={getUserDisplayName()}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || user?.profilePicture} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-56 ml-2 max-w-[90vw]">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto p-3 hover:bg-muted/50 rounded-lg text-left text-foreground hover:text-foreground focus-visible:text-foreground"
                >
                  <div className="flex w-full items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || user?.profilePicture} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground break-all sm:truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-60 max-w-[90vw] mb-2">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      </motion.aside>
    </>
  )
}
