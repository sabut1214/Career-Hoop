import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  User,
  BookOpen,
  Target,
  School,
  Award,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Landing"),
    icon: Home,
  },
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Target,
  },
  {
    title: "Assessment",
    url: createPageUrl("Assessment"),
    icon: BookOpen,
  },
  {
    title: "Recommendations",
    url: createPageUrl("Recommendations"),
    icon: Award,
  },
  {
    title: "Colleges",
    url: createPageUrl("Colleges"),
    icon: School,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isLandingPage = currentPageName === "Landing";

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">CareerHoop</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to={createPageUrl("Dashboard")} className="text-gray-600 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link to={createPageUrl("Colleges")} className="text-gray-600 hover:text-blue-600 font-medium">
                  Colleges
                </Link>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white shadow-lg flex-col">
        <div className="p-6 border-b">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">CareerHoop</h2>
              <p className="text-xs text-gray-500">Find Your Future</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-green-50">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">Ready to explore?</p>
            <p className="text-xs text-gray-500 mb-3">Complete your assessment</p>
            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600">
              Start Assessment
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-40">
        <div className="flex items-center justify-between p-4">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CareerHoop</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 z-30 bg-white"
          >
            <div className="pt-16 p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
