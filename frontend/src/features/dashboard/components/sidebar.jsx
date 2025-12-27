import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/shared/components/ui/button"
import {
  GraduationCap,
  Home,
  BookOpen,
  Target,
  BarChart3,
  Building2,
  User,
  LogOut,
  Briefcase,
  Users,
  Star,
  Scale,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
  PanelLeft,
  Sun,
  Moon,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/shared/context/AuthContext"
import { useTheme } from "@/shared/context/ThemeContext"
import { Switch } from "@/shared/components/ui/switch"
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

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", tooltip: "View your dashboard and progress" },
  { icon: Target, label: "Assessment", href: "/assessment", tooltip: "Complete your career assessment (grades, interests, location)" },
  { icon: BarChart3, label: "Recommendations", href: "/recommendations", tooltip: "View personalized career recommendations" },
  { icon: Building2, label: "Colleges", href: "/colleges", tooltip: "Explore colleges and universities" },
  { icon: Star, label: "Saved Colleges", href: "/saved-colleges", tooltip: "Review your saved colleges" },
  { icon: Scale, label: "Compare Colleges", href: "/college-comparison", tooltip: "Compare colleges side-by-side" },
  { icon: Briefcase, label: "Careers", href: "/careers", tooltip: "Browse career options" },
  { icon: BookOpen, label: "Training", href: "/trainings", tooltip: "Access skill training programs" },
  { icon: Activity, label: "My Quizzes", href: "/quiz/analytics", tooltip: "View your quiz results and analytics" },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isDarkMode, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    return saved ? JSON.parse(saved) : false
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const hasAnimatedRef = useRef(false)

  const handleThemeChange = (checked) => {
    setTheme(checked ? "dark" : "light")
  }

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "4.5rem" : "16.25rem")
  }, [isCollapsed])

  // Mark as animated after first mount
  useEffect(() => {
    hasAnimatedRef.current = true
  }, [])

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
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-20 right-4 z-50 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-border/50 hover:bg-background"
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
            <Link 
              to="/" 
              className="flex items-center gap-0"
            >
              <img src={logoImg} alt="CareerHoop Logo" className="h-10 w-10 object-contain shrink-0" />
              <span className="text-2xl font-bold text-foreground whitespace-nowrap">
                Career<span className="text-primary">Hoop</span>
              </span>
            </Link>
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
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                const navItem = (
                  <div key={item.label}>
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
                        <item.icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
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
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        {navItem}
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        <p>{item.tooltip || item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                // For expanded sidebar, wrap with tooltip that shows on hover
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      {navItem}
                    </TooltipTrigger>
                    {item.tooltip && (
                      <TooltipContent side="right" sideOffset={8}>
                        <p>{item.tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
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
                    <DropdownMenuContent align="end" side="right" className="w-56 ml-2 max-w-[90vw]">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
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
                    <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-64 max-w-[90vw] mb-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
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
