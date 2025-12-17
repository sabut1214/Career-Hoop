import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import { setNavigateRef } from "@/shared/lib/navigation"
import { AuthProvider } from "@/shared/context/AuthContext"
import { ThemeProvider } from "@/shared/context/ThemeContext"
import { ModalProvider } from "@/shared/context/ModalContext"
import ModalContainer from "@/shared/components/common/ModalContainer"
import { Navbar } from "@/shared/components/layout/navbar"
import HealthCheck from "@/shared/components/views/HealthCheck"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ErrorBoundary from "@/shared/components/ErrorBoundary"

// Lazy load components for code splitting
const Landing = lazy(() => import("@/features/landing-page/components/landing").then(m => ({ default: m.Landing })))
const Assessment = lazy(() => import("@/features/assessment/pages/Assessment"))
const Grades = lazy(() => import("@/features/assessment/pages/Grades"))
const Interests = lazy(() => import("@/features/assessment/pages/Interests"))
const Careers = lazy(() => import("@/features/careers/pages/Careers"))
const Colleges = lazy(() => import("@/features/colleges/pages/Colleges"))
const SavedColleges = lazy(() => import("@/features/colleges/pages/SavedColleges"))
const CollegeComparison = lazy(() => import("@/features/colleges/pages/CollegeComparison"))
const Trainings = lazy(() => import("@/features/trainings/pages/Trainings"))
const QuizStart = lazy(() => import("@/features/trainings/pages/QuizStart"))
const QuizPage = lazy(() => import("@/features/trainings/pages/QuizPage"))
const QuizResult = lazy(() => import("@/features/trainings/pages/QuizResult"))
const QuizAnalytics = lazy(() => import("@/features/trainings/pages/QuizAnalytics"))
const Profile = lazy(() => import("@/features/profile/pages/Profile"))
const Recommendations = lazy(() => import("@/features/recommendations/pages/Recomendations"))
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"))
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard"))
const AdminStudents = lazy(() => import("@/features/admin/pages/Students"))
const AdminCareers = lazy(() => import("@/features/admin/pages/Careers"))
const AdminColleges = lazy(() => import("@/features/admin/pages/Colleges"))
const AdminMentors = lazy(() => import("@/features/admin/pages/Mentors"))
const AdminScholarships = lazy(() => import("@/features/admin/pages/Scholarships"))
const AdminTrainings = lazy(() => import("@/features/admin/pages/Trainings"))
const AcademicRecords = lazy(() => import("@/features/admin/pages/AcademicRecords"))
const Login = lazy(() => import("@/features/auth/pages/Login"))
const Signup = lazy(() => import("@/features/auth/pages/Signup"))
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPassword"))
const ResetPassword = lazy(() => import("@/features/auth/pages/ResetPassword"))
const About = lazy(() => import("@/features/landing-page/pages/About"))
const Features = lazy(() => import("@/features/landing-page/pages/Features"))
const WhyChooseUs = lazy(() => import("@/features/landing-page/pages/WhyChooseUs"))
const Contact = lazy(() => import("@/features/landing-page/pages/Contact"))
const NotFound = lazy(() => import("@/shared/components/views/NotFound"))

// Loading fallback component with smooth animation
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary transition-colors duration-300"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-primary opacity-20"></div>
      </div>
      <p className="text-muted-foreground text-sm font-medium">Loading page...</p>
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse transition-all duration-1000" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
)

import "@/shared/styles/App.css"

// Inner component to access useNavigate hook
function AppContent() {
  const navigate = useNavigate()
  
  useEffect(() => {
    setNavigateRef(navigate)
  }, [navigate])
  
  return (
    <div className="app">
              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Skip to main content
              </a>
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public Routes - Show Navbar */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/health" element={
                    <>
                      <Navbar />
                      <main id="main-content" className="main-content">
                        <HealthCheck />
                      </main>
                    </>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/why-choose-us" element={<WhyChooseUs />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected Dashboard Routes - Show Sidebar (handled in components) */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/interests" element={<Interests />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/colleges" element={<Colleges />} />
                  <Route path="/saved-colleges" element={<SavedColleges />} />
                  <Route path="/college-comparison" element={<CollegeComparison />} />
                  <Route path="/trainings" element={<Trainings />} />
                  <Route path="/quiz/start/:trainingId" element={<QuizStart />} />
                  <Route path="/quiz/session/:quizSessionId" element={<QuizPage />} />
                  <Route path="/quiz/result/:quizSessionId" element={<QuizResult />} />
                  <Route path="/quiz/analytics" element={<QuizAnalytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  
                  {/* Admin Routes - Show Admin Sidebar (handled in components) */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/careers" element={<AdminCareers />} />
                  <Route path="/admin/colleges" element={<AdminColleges />} />
                  <Route path="/admin/mentors" element={<AdminMentors />} />
                  <Route path="/admin/scholarships" element={<AdminScholarships />} />
                  <Route path="/admin/trainings" element={<AdminTrainings />} />
                  <Route path="/admin/academic-records" element={<AcademicRecords />} />

                  {/* Fallback */}
                  <Route path="*" element={
                    <>
                      <Navbar />
                      <main className="main-content">
                        <NotFound />
                      </main>
                    </>
                  } />
                </Routes>
              </Suspense>
              <ModalContainer />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ModalProvider>
            <Router>
              <AppContent />
            </Router>
          </ModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
