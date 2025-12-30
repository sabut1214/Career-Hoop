import { lazy, useEffect } from "react"
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
import "@/shared/styles/App.css"
import PublicLayout from "@/shared/components/layout/PublicLayout"
import StudentLayout from "@/shared/components/layout/StudentLayout"
import AdminLayout from "@/shared/components/layout/AdminLayout"
import ScrollToTop from "@/shared/components/common/ScrollToTop"

// Lazy load components for code splitting
const Landing = lazy(() => import("@/features/landing-page/components/landing").then(m => ({ default: m.Landing })))
const Assessment = lazy(() => import("@/features/assessment/pages/Assessment"))
const Grades = lazy(() => import("@/features/assessment/pages/Grades"))
const Interests = lazy(() => import("@/features/assessment/pages/Interests"))
const Careers = lazy(() => import("@/features/careers/pages/Careers"))
const Colleges = lazy(() => import("@/features/colleges/pages/Colleges"))
const Trainings = lazy(() => import("@/features/trainings/pages/Trainings"))
const QuizStart = lazy(() => import("@/features/trainings/pages/QuizStart"))
const QuizPage = lazy(() => import("@/features/trainings/pages/QuizPage"))
const QuizResult = lazy(() => import("@/features/trainings/pages/QuizResult"))
const QuizAnalytics = lazy(() => import("@/features/trainings/pages/QuizAnalytics"))
const Profile = lazy(() => import("@/features/profile/pages/Profile"))
const Recommendations = lazy(() => import("@/features/recommendations/pages/Recomendations"))
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"))
const Onboarding = lazy(() => import("@/features/onboarding/pages/Onboarding"))
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard"))
const AdminStudents = lazy(() => import("@/features/admin/pages/Students"))
const AdminCareers = lazy(() => import("@/features/admin/pages/Careers"))
const AdminColleges = lazy(() => import("@/features/admin/pages/Colleges"))
const AdminTrainings = lazy(() => import("@/features/admin/pages/Trainings"))
const AdminMentors = lazy(() => import("@/features/admin/pages/Mentors"))
const AdminScholarships = lazy(() => import("@/features/admin/pages/Scholarships"))
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
              <ScrollToTop />
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/why-choose-us" element={<WhyChooseUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route
                  path="/health"
                  element={
                    <>
                      <Navbar />
                        <main className="main-content">
                          <HealthCheck />
                        </main>
                      </>
                    }
                  />
                <Route
                  path="*"
                  element={
                    <>
                      <Navbar />
                      <main className="main-content">
                        <NotFound />
                      </main>
                    </>
                  }
                />
              </Route>

                <Route element={<StudentLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/interests" element={<Interests />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/colleges" element={<Colleges />} />
                  <Route path="/trainings" element={<Trainings />} />
                  <Route path="/quiz/start/:trainingId" element={<QuizStart />} />
                  <Route path="/quiz/session/:quizSessionId" element={<QuizPage />} />
                  <Route path="/quiz/result/:quizSessionId" element={<QuizResult />} />
                  <Route path="/quiz/analytics" element={<QuizAnalytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                </Route>

                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/careers" element={<AdminCareers />} />
                  <Route path="/admin/colleges" element={<AdminColleges />} />
                  <Route path="/admin/trainings" element={<AdminTrainings />} />
                  <Route path="/admin/mentors" element={<AdminMentors />} />
                  <Route path="/admin/scholarships" element={<AdminScholarships />} />
                  <Route path="/admin/assessments" element={<AcademicRecords />} />
                  <Route path="/admin/academic-records" element={<AcademicRecords />} />
                </Route>

              </Routes>
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
