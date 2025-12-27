import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, BookOpen, Building2, Zap, FileText, LogOut, ChevronLeft, ChevronRight, Menu, X, Sun, Moon, UserCheck, Award } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import { useAuth } from "@/shared/context/AuthContext"
import { useTheme } from "@/shared/context/ThemeContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { cn } from "@/shared/lib/utils"
import logoImg from "@/assets/images/Logo.png"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/careers", label: "Careers", icon: BookOpen },
  { href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { href: "/admin/trainings", label: "Trainings", icon: Zap },
  { href: "/admin/mentors", label: "Mentors", icon: UserCheck },
  { href: "/admin/scholarships", label: "Scholarships", icon: Award },
  { href: "/admin/assessments", label: "Assessments", icon: FileText },
]

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isDarkMode, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed")
    return saved ? JSON.parse(saved) : false
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleThemeChange = (checked) => {
    setTheme(checked ? "dark" : "light")
  }

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(isCollapsed))
    document.documentElement.style.setProperty(
      "--admin-sidebar-width",
      isCollapsed ? "4.5rem" : "16.25rem"
    )
  }, [isCollapsed])

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
    if (!user) return "A"
    const name = user.name || user.fullName || user.email || "Admin"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return "Admin"
    return user.name || user.fullName || user.email?.split("@")[0] || "Admin"
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 right-4 z-50 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle navigation</span>
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border/50 z-40 flex flex-col",
          "transition-all duration-300 ease-in-out",
          "shadow-lg lg:shadow-xl",
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Toggle Arrow Button - Overlapping right edge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "absolute top-4 z-50 h-8 w-8 rounded-md bg-card border-border/50 shadow-md hover:bg-muted/50 transition-all duration-200",
                  isCollapsed ? "right-[-16px]" : "right-[-16px]"
                )}
                aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
              >
                {isCollapsed ? (
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>{isCollapsed ? "Open sidebar" : "Close sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Top Header Area */}
        <div className={cn(
          "flex-shrink-0 border-b border-border/50",
          isCollapsed ? "p-3" : "p-4"
        )}>
          {isCollapsed ? (
            /* Collapsed: Logo only */
            <div className="flex items-center justify-center w-full">
              <img src={logoImg} alt="CareerHoop Logo" className="h-10 w-10 object-contain" />
            </div>
          ) : (
            /* Expanded: Logo + Brand Name */
            <div className="flex flex-col flex-1 min-w-0">
              <Link
                to="/admin"
                className="flex items-center gap-0"
              >
                <img src={logoImg} alt="CareerHoop Logo" className="h-10 w-10 object-contain shrink-0" />
                <span className="text-2xl font-bold text-foreground whitespace-nowrap">
                  Career<span className="text-primary">Hoop</span>
                </span>
              </Link>
              <span className="text-xs text-muted-foreground ml-[2.5rem] mt-0.5">
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <TooltipProvider delayDuration={300}>
            <nav className={cn("space-y-1", isCollapsed ? "p-2" : "p-3")}>
              {!isCollapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Navigation
                </p>
              )}
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                const navItem = (
                  <div key={item.href}>
                    <Link to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full text-sm transition-all duration-200 rounded-lg",
                          isCollapsed ? "justify-center h-10 px-0" : "justify-start h-11 gap-3 px-3",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                            : "hover:bg-muted/50 hover:text-foreground text-muted-foreground"
                        )}
                        onClick={() => {
                          if (window.innerWidth < 1024) setIsMobileOpen(false)
                        }}
                      >
                        <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                        {!isCollapsed && (
                          <span className="truncate text-left flex-1">
                            {item.label}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </div>
                )

                // Wrap with tooltip when collapsed
                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        {navItem}
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return navItem
              })}
            </nav>
          </TooltipProvider>
        </div>

        {/* Bottom Settings/Profile Area */}
        <div className={cn(
          "flex-shrink-0 border-t border-border/50 bg-background/50 backdrop-blur-sm",
          isCollapsed ? "p-2" : "p-3"
        )}>
          {/* Theme Toggle */}
          <div className={cn("mb-2", isCollapsed ? "flex justify-center" : "")}>
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleThemeChange(!isDarkMode)}
                      className="h-10 w-10 rounded-lg hover:bg-muted/50"
                      aria-label="Toggle theme"
                    >
                      {isDarkMode ? (
                        <Moon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Sun className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p>{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeChange}
                  aria-label="Toggle theme"
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-center h-10 p-0 hover:bg-muted/50 rounded-lg"
                        aria-label={getUserDisplayName()}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar || user?.profilePicture} alt={getUserDisplayName()} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-56 max-w-[90vw]">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email || "admin@example.com"}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{getUserDisplayName()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto p-2.5 hover:bg-muted/50 rounded-lg text-left"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={user?.avatar || user?.profilePicture} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" sideOffset={2} className="w-64 max-w-[90vw]">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "admin@example.com"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
    </>
  )
}
